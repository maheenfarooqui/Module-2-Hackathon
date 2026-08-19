// // 1. SUPABASE CLIENT INITIALIZATION
// const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
// const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

// const { createClient } = window.supabase;
// const _supabase = createClient(supbaseUrl, supbaseKey);

// let currentUserId = null;
// let notifications = [];

// // 2. INITIAL LOAD & AUTH CHECK
// document.addEventListener("DOMContentLoaded", async () => {
//   // Get Current Logged-in User
//   const {
//     data: { user },
//   } = await _supabase.auth.getUser();
//   if (user) {
//     currentUserId = user.id;
//     await fetchNotificationsFromSupabase();
//     setupRealtimeNotifications();
//   }
// });

// // 3. FETCH NOTIFICATIONS FROM SUPABASE
// async function fetchNotificationsFromSupabase() {
//   if (!currentUserId) return;

//   try {
//     const { data, error } = await _supabase
//       .from("notifications")
//       .select("*")
//       .or(`user_id.eq.${currentUserId},user_id.is.null`) // Specific user or broadcast
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     notifications = (data || []).map((item) => ({
//       id: item.id,
//       type: item.type,
//       text: item.message || item.text,
//       time: formatTimeAgo(item.created_at),
//       unread: item.is_read === false,
//       icon: getNotificationIcon(item.type),
//     }));

//     renderNotifications();
//   } catch (err) {
//     console.warn("Supabase Fetch Warning:", err.message);
//   }
// }

// // 4. LISTEN FOR REAL-TIME NOTIFICATIONS
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
//         if (!newNotif.user_id || newNotif.user_id === currentUserId) {
//           notifications.unshift({
//             id: newNotif.id,
//             type: newNotif.type,
//             text: newNotif.message || newNotif.text,
//             time: "Just now",
//             unread: true,
//             icon: getNotificationIcon(newNotif.type),
//           });
//           renderNotifications();

//           // Bell Icon Shake Effect
//           const bell = document.getElementById("bellIcon");
//           if (bell) {
//             bell.classList.add("shake-animation");
//             setTimeout(() => bell.classList.remove("shake-animation"), 1000);
//           }
//         }
//       },
//     )
//     .subscribe();
// }

// // 5. RENDER NOTIFICATIONS
// function renderNotifications() {
//   const list = document.getElementById("notifList");
//   const pageList = document.getElementById("pageNotifList");
//   const dashboardList = document.querySelector(
//     ".right-column .notification-list",
//   );
//   const unreadBadge = document.getElementById("unreadBadge");

//   const unreadCount = notifications.filter((n) => n.unread).length;

//   if (unreadBadge) {
//     unreadBadge.innerText = unreadCount;
//     unreadBadge.style.display = unreadCount > 0 ? "inline-block" : "none";
//   }

//   const listHTML =
//     notifications.length > 0
//       ? notifications
//           .map(
//             (n) => `
//         <div class="notif-item ${n.unread ? "unread" : ""}" onclick="markSingleAsRead('${n.id}')">
//           <div class="notif-icon"><i class="fa-solid ${n.icon}"></i></div>
//           <div style="flex: 1;">
//             <div class="notif-text">${n.text}</div>
//             <span class="notif-time" style="font-size:0.75rem; color:#94a3b8;">${n.time}</span>
//           </div>
//         </div>
//       `,
//           )
//           .join("")
//       : `<div style="padding: 15px; text-align: center; color: #94a3b8;">No notifications yet.</div>`;

//   if (list) list.innerHTML = listHTML;
//   if (pageList) pageList.innerHTML = listHTML;
//   if (dashboardList) dashboardList.innerHTML = listHTML;
// }

// function toggleNotificationDropdown() {
//   const dropdown = document.getElementById("notifDropdown");
//   if (!dropdown) return;
//   dropdown.classList.toggle("active");
// }

// // 7. MARK ALL AS READ
// async function markAllAsRead() {
//   notifications.forEach((n) => (n.unread = false));
//   renderNotifications();

//   try {
//     await _supabase
//       .from("notifications")
//       .update({ is_read: true })
//       .eq("user_id", currentUserId);
//   } catch (err) {
//     console.error("Supabase Error:", err.message);
//   }
// }

// // 8. MARK SINGLE AS READ
// async function markSingleAsRead(id) {
//   const notif = notifications.find((n) => n.id == id);
//   if (notif && notif.unread) {
//     notif.unread = false;
//     renderNotifications();

//     try {
//       await _supabase
//         .from("notifications")
//         .update({ is_read: true })
//         .eq("id", id);
//     } catch (err) {
//       console.error("Supabase Error:", err.message);
//     }
//   }
// }

// // HELPER FUNCTIONS
// function getNotificationIcon(type) {
//   switch (type) {
//     case "like":
//       return "fa-heart";
//     case "comment":
//       return "fa-comment";
//     case "event":
//       return "fa-calendar-check";
//     case "post":
//       return "fa-pen-to-square";
//     case "poll":
//       return "fa-chart-simple";
//     case "announcement":
//       return "fa-bullhorn";
//     default:
//       return "fa-bell";
//   }
// }

// function formatTimeAgo(dateString) {
//   if (!dateString) return "Just now";
//   const date = new Date(dateString);
//   const now = new Date();
//   const seconds = Math.floor((now - date) / 1000);

//   if (seconds < 60) return "Just now";
//   const minutes = Math.floor(seconds / 60);
//   if (minutes < 60) return `${minutes} mins ago`;
//   const hours = Math.floor(minutes / 60);
//   if (hours < 24) return `${hours} hours ago`;
//   return date.toLocaleDateString();
// }



// 1. SUPABASE CLIENT INITIALIZATION
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const { createClient } = window.supabase;
const _supabase = createClient(supbaseUrl, supbaseKey);

let notificationUserId = null; // CHANGE: currentUserId → notificationUserId
let notifications = [];

// 2. INITIAL LOAD & AUTH CHECK
document.addEventListener("DOMContentLoaded", async () => {
  // Get Current Logged-in User
  const {
    data: { user },
  } = await _supabase.auth.getUser();

  if (user) {
    notificationUserId = user.id; // CHANGE
    await fetchNotificationsFromSupabase();
    setupRealtimeNotifications();
  }
});

// 3. FETCH NOTIFICATIONS FROM SUPABASE
async function fetchNotificationsFromSupabase() {
  if (!notificationUserId) return; // CHANGE

  try {
    const { data, error } = await _supabase
      .from("notifications")
      .select("*")
      .or(
        `user_id.eq.${notificationUserId},user_id.is.null`,
      ) // CHANGE
      .order("created_at", { ascending: false });

    if (error) throw error;

    notifications = (data || []).map((item) => ({
      id: item.id,
      type: item.type,
      text: item.message || item.text,
      time: formatTimeAgo(item.created_at),
      unread: item.is_read === false,
      icon: getNotificationIcon(item.type),
    }));

    renderNotifications();
  } catch (err) {
    console.warn("Supabase Fetch Warning:", err.message);
  }
}

// 4. LISTEN FOR REAL-TIME NOTIFICATIONS
function setupRealtimeNotifications() {
  _supabase
    .channel("public:notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
      },
      (payload) => {
        const newNotif = payload.new;

        if (
          !newNotif.user_id ||
          newNotif.user_id === notificationUserId // CHANGE
        ) {
          notifications.unshift({
            id: newNotif.id,
            type: newNotif.type,
            text: newNotif.message || newNotif.text,
            time: "Just now",
            unread: true,
            icon: getNotificationIcon(newNotif.type),
          });

          renderNotifications();

          // Bell Icon Shake Effect
          const bell = document.getElementById("bellIcon");

          if (bell) {
            bell.classList.add("shake-animation");

            setTimeout(
              () => bell.classList.remove("shake-animation"),
              1000,
            );
          }
        }
      },
    )
    .subscribe();
}

// 5. RENDER NOTIFICATIONS
function renderNotifications() {
  const list = document.getElementById("notifList");
  const pageList = document.getElementById("pageNotifList");

  const dashboardList = document.querySelector(
    ".right-column .notification-list",
  );

  const unreadBadge = document.getElementById("unreadBadge");

  const unreadCount = notifications.filter(
    (n) => n.unread,
  ).length;

  if (unreadBadge) {
    unreadBadge.innerText = unreadCount;
    unreadBadge.style.display =
      unreadCount > 0 ? "inline-block" : "none";
  }

  const listHTML =
    notifications.length > 0
      ? notifications
          .map(
            (n) => `
        <div 
          class="notif-item ${n.unread ? "unread" : ""}" 
          onclick="markSingleAsRead('${n.id}')"
        >
          <div class="notif-icon">
            <i class="fa-solid ${n.icon}"></i>
          </div>

          <div style="flex: 1;">
            <div class="notif-text">${n.text}</div>

            <span 
              class="notif-time" 
              style="font-size:0.75rem; color:#94a3b8;"
            >
              ${n.time}
            </span>
          </div>
        </div>
      `,
          )
          .join("")
      : `
        <div 
          style="padding: 15px; text-align: center; color: #94a3b8;"
        >
          No notifications yet.
        </div>
      `;

  if (list) list.innerHTML = listHTML;
  if (pageList) pageList.innerHTML = listHTML;
  if (dashboardList) dashboardList.innerHTML = listHTML;
}

function toggleNotificationDropdown() {
  const dropdown = document.getElementById("notifDropdown");

  if (!dropdown) return;

  dropdown.classList.toggle("active");
}

// 7. MARK ALL AS READ
async function markAllAsRead() {
  notifications.forEach((n) => (n.unread = false));

  renderNotifications();

  try {
    await _supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", notificationUserId); // CHANGE
  } catch (err) {
    console.error("Supabase Error:", err.message);
  }
}

// 8. MARK SINGLE AS READ
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

// HELPER FUNCTIONS
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