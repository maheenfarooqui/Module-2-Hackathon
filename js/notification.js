// 1. SUPABASE INITIALIZATION
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const { createClient } = window.supabase;
const _supabase = createClient(supbaseUrl, supbaseKey);

let notificationUserId = null;
let notifications = [];

// 2. INITIAL LOAD
document.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { user },
  } = await _supabase.auth.getUser();

  if (user) {
    notificationUserId = user.id;
    await fetchNotificationsFromSupabase();
    setupRealtimeNotifications();
  }
});

// 3. FETCH NOTIFICATIONS
async function fetchNotificationsFromSupabase() {
  if (!notificationUserId) return;

  try {
    const { data, error } = await _supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${notificationUserId},user_id.is.null`)
      .order("created_at", { ascending: false });

    if (error) throw error;

    notifications = (data || []).map((item) => ({
      id: item.id,
      type: item.type,
      text: item.text || "New activity logged",
      time: formatTimeAgo(item.created_at),
      unread: item.is_read === false,
      icon: getNotificationIcon(item.type),
    }));

    renderNotifications();
  } catch (err) {
    console.warn("Supabase Notification Fetch Error:", err.message);
  }
}

// 4. REALTIME SUBSCRIBER
// function setupRealtimeNotifications() {
//   _supabase
//     .channel("public:notifications")
//     .on(
//       "postgres_changes",
//       {
//         event: "INSERT",
//         schema: "public",
//         table: "notifications",
//       },
//       (payload) => {
//         const newNotif = payload.new;

//         // Check if targeted to this user or broadcast
//         if (!newNotif.user_id || newNotif.user_id === notificationUserId) {
//           notifications.unshift({
//             id: newNotif.id,
//             type: newNotif.type,
//             text: newNotif.text,
//             time: "Just now",
//             unread: true,
//             icon: getNotificationIcon(newNotif.type),
//           });

//           renderNotifications();

//           // Bell Shake Animation
//           const bell = document.getElementById("bellIcon");
//           if (bell) {
//             bell.classList.add("shake-animation");
//             setTimeout(() => bell.classList.remove("shake-animation"), 1000);
//           }
//         }
//       }
//     )
//     .subscribe();
// }
// 4. REALTIME SUBSCRIBER
function setupRealtimeNotifications() {
  _supabase
    .channel("notifications-channel")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        const newNotif = payload.new;

        // User ID check (Broadcast ya Targeted User)
        if (
          !newNotif.user_id ||
          String(newNotif.user_id) === String(notificationUserId)
        ) {
          notifications.unshift({
            id: newNotif.id,
            type: newNotif.type,
            text: newNotif.text,
            time: "Just now",
            unread: true,
            icon: getNotificationIcon(newNotif.type),
          });

          renderNotifications();

          // Bell Shake Animation
          const bell = document.getElementById("bellIcon");
          if (bell) {
            bell.classList.add("shake-animation");
            setTimeout(() => bell.classList.remove("shake-animation"), 1000);
          }
        }
      },
    )
    .subscribe();
}

// 5. RENDER UI
function renderNotifications() {
  const list = document.getElementById("notifList");
  const unreadBadge = document.getElementById("unreadBadge");

  const unreadCount = notifications.filter((n) => n.unread).length;

  if (unreadBadge) {
    unreadBadge.innerText = unreadCount;
    unreadBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
  }

  if (!list) return;

  if (notifications.length === 0) {
    list.innerHTML = `<div style="padding: 15px; text-align: center; color: #94a3b8;">No notifications yet.</div>`;
    return;
  }

  list.innerHTML = notifications
    .map(
      (n) => `
      <div class="notif-item ${n.unread ? "unread" : ""}" onclick="markSingleAsRead('${n.id}')">
        <div class="notif-icon"><i class="fa-solid ${n.icon}"></i></div>
        <div style="flex: 1;">
          <div class="notif-text">${n.text}</div>
          <span class="notif-time" style="font-size:0.75rem; color:#94a3b8;">${n.time}</span>
        </div>
      </div>
    `,
    )
    .join("");
}

function toggleNotificationDropdown() {
  const dropdown = document.getElementById("notifDropdown");
  if (dropdown) dropdown.classList.toggle("active");
}

// 6. MARK READ FUNCTIONS
async function markAllAsRead() {
  notifications.forEach((n) => (n.unread = false));
  renderNotifications();

  try {
    await _supabase
      .from("notifications")
      .update({ is_read: true })
      .or(`user_id.eq.${notificationUserId},user_id.is.null`);
  } catch (err) {
    console.error("Supabase Error:", err.message);
  }
}

async function markSingleAsRead(id) {
  const notif = notifications.find((n) => n.id == id);
  if (notif && notif.unread) {
    notif.unread = false;
    renderNotifications();

    try {
      await _supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
    } catch (err) {
      console.error("Supabase Error:", err.message);
    }
  }
}

// HELPERS
function getNotificationIcon(type) {
  switch (type) {
    case "like":
      return "fa-heart";
    case "comment":
      return "fa-comment";
    case "event":
      return "fa-calendar-check";
    case "post":
      return "fa-pen-to-square";
    case "poll":
      return "fa-chart-simple";
    case "announcement":
      return "fa-bullhorn";
    case "study_partner":
      return "fa-user-graduate";
    default:
      return "fa-bell";
  }
}

function formatTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return date.toLocaleDateString();
}

// Universal function to send a notification
async function createNotification({ targetUserId = null, type, text }) {
  try {
    const { error } = await _supabase.from("notifications").insert([
      {
        user_id: targetUserId, // Specific user ID ya NULL (Broadcast to all)
        type: type, // 'like', 'comment', 'event', 'post', 'announcement'
        text: text, // Text string
        is_read: false,
      },
    ]);

    if (error) throw error;
  } catch (err) {
    console.error("Failed to create notification:", err.message);
  }
}
