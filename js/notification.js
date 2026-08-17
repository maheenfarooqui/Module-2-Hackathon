// 1. SUPABASE CLIENT INITIALIZATION
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const { createClient } = window.supabase;
const _supabase = createClient(supbaseUrl, supbaseKey);

const currentUserId = "user_123";
let notifications = [];

// 2. INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
  fetchNotificationsFromSupabase();
});

// 3. FETCH NOTIFICATIONS FROM SUPABASE
async function fetchNotificationsFromSupabase() {
  try {
    const { data, error } = await _supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      notifications = data.map(item => ({
        id: item.id,
        type: item.type,
        text: item.message || item.text,
        time: formatTimeAgo(item.created_at),
        unread: item.is_read === false,
        icon: getNotificationIcon(item.type)
      }));
    } else {
      // Fallback Data if DB is empty
      notifications = [
        { id: 1, type: 'like', text: '<b>Sarah</b> liked your post.', time: '2 mins ago', unread: true, icon: 'fa-heart' },
        { id: 2, type: 'comment', text: '<b>Ali</b> commented on your post.', time: '10 mins ago', unread: true, icon: 'fa-comment' },
        { id: 3, type: 'event', text: '<b>Hamza</b> joined your coding event.', time: '1 hour ago', unread: true, icon: 'fa-calendar-check' }
      ];
    }

    renderNotifications();
  } catch (err) {
    console.warn("Supabase Fetch Warning:", err.message);
    renderNotifications();
  }
}

// 4. RENDER NOTIFICATIONS
function renderNotifications() {
  const list = document.getElementById("notifList");
  const pageList = document.getElementById("pageNotifList");
  const unreadBadge = document.getElementById("unreadBadge");

  const unreadCount = notifications.filter(n => n.unread).length;

  if (unreadBadge) {
    unreadBadge.innerText = unreadCount;
    unreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
  }

  const listHTML = notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" onclick="markSingleAsRead('${n.id}')">
      <div class="notif-icon"><i class="fa-solid ${n.icon}"></i></div>
      <div style="flex: 1;">
        <div class="notif-text">${n.text}</div>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>
  `).join("");

  if (list) list.innerHTML = listHTML;
  if (pageList) pageList.innerHTML = listHTML;
}

// 5. TOGGLE DROPDOWN
function toggleNotificationDropdown() {
  const dropdown = document.getElementById("notifDropdown");
  if (!dropdown) return;

  const isActive = dropdown.classList.contains("active");

  if (!isActive) {
    dropdown.classList.add("active");
    if (typeof animateBellRing === "function") animateBellRing();
    if (typeof animateDropdownOpen === "function") animateDropdownOpen();
  } else {
    dropdown.classList.remove("active");
  }
}

// 6. MARK ALL AS READ
async function markAllAsRead() {
  notifications.forEach(n => n.unread = false);
  renderNotifications();

  try {
    await _supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', currentUserId);
  } catch (err) {
    console.error("Supabase Error:", err.message);
  }
}

// 7. MARK SINGLE AS READ
async function markSingleAsRead(id) {
  const notif = notifications.find(n => n.id == id);
  if (notif && notif.unread) {
    notif.unread = false;
    renderNotifications();

    try {
      await _supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (err) {
      console.error("Supabase Error:", err.message);
    }
  }
}

// HELPER FUNCTIONS
function getNotificationIcon(type) {
  switch (type) {
    case 'like': return 'fa-heart';
    case 'comment': return 'fa-comment';
    case 'event': return 'fa-calendar-check';
    case 'post': return 'fa-pen-to-square';
    case 'announcement': return 'fa-bullhorn';
    default: return 'fa-bell';
  }
}

function formatTimeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return date.toLocaleDateString();
}