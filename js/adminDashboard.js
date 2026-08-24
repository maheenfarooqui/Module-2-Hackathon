import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const service_role =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaGV1d29wZmtwZHluZmdqdGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMjM5OSwiZXhwIjoyMDk4NDk4Mzk5fQ.yvmgW9-bzNBspiaqHMKtXf-GlfJaeMrgJxTH40_-gRw";
var supabase = createClient(supbaseUrl, supbaseKey);
const supabaseAdmin = createClient(supbaseUrl, service_role);
// Function to fetch counts from Supabase tables
async function fetchAdminDashboardStats() {
  try {
    // 1. Fetch Total Users (Assuming 'profiles' table exists, otherwise checks auth/users via profiles)
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    // 2. Fetch Total Posts (postApp)
    const { count: postsCount, error: postsErr } = await supabase
      .from("postApp")
      .select("*", { count: "exact", head: true });

    // 3. Fetch Total Events (events)
    const { count: eventsCount, error: eventsErr } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    // 4. Fetch Study Partners Requests (study_partners)
    const { count: studyCount, error: studyErr } = await supabase
      .from("study_partners")
      .select("*", { count: "exact", head: true });

    // 5. Fetch Total Comments (commentsApp)
    const { count: commentsCount, error: commentsErr } = await supabase
      .from("commentsApp")
      .select("*", { count: "exact", head: true });

    // 6. Fetch Total Likes (likesapp)
    const { count: likesCount, error: likesErr } = await supabase
      .from("likesApp")
      .select("*", { count: "exact", head: true });

    // --- DOM Update ---
    document.getElementById("totalUsersCount").innerText =
      `${users.length}` || 0;
    document.getElementById("totalPostsCount").innerText = postsCount || 0;
    document.getElementById("totalEventsCount").innerText = eventsCount || 0;
    document.getElementById("studyPartnersCount").innerText = studyCount || 0;
    document.getElementById("totalCommentsCount").innerText =
      commentsCount || 0;
    document.getElementById("totalLikesCount").innerText = likesCount || 0;
  } catch (error) {
    console.error("Error fetching admin dashboard statistics:", error.message);
  }
}

// Page load hone par runs automatically
document.addEventListener("DOMContentLoaded", () => {
  fetchAdminDashboardStats();
});

const announcementForm = document.getElementById("adminAnnouncementForm");

announcementForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("announcementTitle").value.trim();
  const category = document.getElementById("announcementCategory").value;
  const description = document
    .getElementById("announcementDescription")
    .value.trim();

  if (!title || !description) {
    Swal.fire({
      icon: "warning",
      title: "Missing Fields",
      text: "Please fill all fields.",
    });
    return;
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert([
      {
        title,
        category,
        description,
      },
    ])
    .select();

  if (error) {
    console.error("Announcement error:", error);
    Swal.fire({
      icon: "error",
      title: "Failed!",
      text: "Failed to publish announcement.",
    });
    return;
  }

  console.log("Announcement published:", data);
  try {
    const { error: notifError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: null, // Broadcast announcement (sab users ke liye)
          type: "announcement",
          text: `📢 <b>Admin:</b> ${title}`,
          is_read: false
        }
      ]);

    if (notifError) {
      console.error("Notification trigger error:", notifError.message);
    } else {
      console.log("Notification sent successfully!");
    }
  } catch (err) {
    console.error("Notification Exception:", err);
  }
  

  Swal.fire({
    icon: "success",
    title: "Published!",
    text: "Announcement published successfully.",
    timer: 1800,
    showConfirmButton: false,
  });

  announcementForm.reset();
});

loadUsersControl()
async function loadUsersControl() {
  let adminModerationList = document.getElementById("adminModerationList");

  try {
    const {
      data: { users },
      error,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      console.log(error);
      return;
    }

    console.log(users);

    adminModerationList.innerHTML = "";

    users.forEach((userInfo) => {
      // First Name aur Last Name ke safety checks
      const fName = userInfo.user_metadata.first_name || "User";
      const lName = userInfo.user_metadata.last_name || "";
      const email = userInfo.email || "No Email";
      const userId = userInfo.id || "00000000";

      adminModerationList.innerHTML += `
        <div class="moderation-user">
          
          <div class="user-profile-circle shadow-cyan"
               style="width: 35px; height: 35px; font-size: 0.8rem;">
            ${fName.charAt(0).toUpperCase()}${lName ? lName.charAt(0).toUpperCase() : ""}
          </div>

          <div>
            <span class="fw-bold d-block text-white" style="font-size: 0.85rem;">
              ${fName} ${lName}
            </span>

            <span class="text-light opacity-50 d-block" style="font-size: 0.7rem;">
              ${email}
            </span>

            <span class="text-light opacity-50 d-block" style="font-size: 0.65rem;">
              ${userId.substring(0, 8)}...
            </span>
          </div>

        <button
  class="btn btn-sm btn-outline-danger"
  style="font-size: 0.75rem;"
  onclick="deleteUser('${userId}')"
>
  Delete
</button>

        </div>
      `;
    });

  } catch (error) {
    console.log(error);
  }
}

window.deleteUser = async function (userId) {
  const result = await Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "Do you really want to delete this user?",
    color: "#ffffff",
    background: "#1e293b",
    showCancelButton: true,
    confirmButtonText: "Yes, delete user",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
  });

  if (!result.isConfirmed) return;

  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Delete user error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "User could not be deleted.",
        background: "#1e293b",
        color: "#ffffff",
      });

      return;
    }

    Swal.fire({
      icon: "success",
      title: "Deleted!",
      text: "User has been deleted successfully.",
      background: "#1e293b",
      color: "#ffffff",
      timer: 1500,
      showConfirmButton: false,
    });

    // Users list dobara load karo
    loadUsersControl();

  } catch (error) {
    console.error(error);
  }
};

async function loadRecentActivities() {
  const adminActivityLogs = document.getElementById("adminActivityLogs");

  try {
    const { data, error } = await supabase
      .from("postApp")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading recent activities:", error);
      return;
    }

    console.log("Recent Activities:", data);

    if (!data || data.length === 0) {
      adminActivityLogs.innerHTML = `
        <p style="color: #94a3b8; font-size: 0.85rem; padding: 12px">
          No recent activity found.
        </p>
      `;
      return;
    }

    adminActivityLogs.innerHTML = "";

    data.forEach((post) => {
      const firstName = post.author_fname || "User";
      const lastName = post.author_lname || "";

      adminActivityLogs.innerHTML += `
        <div class="activity-item">

          <div class="user-profile-circle shadow-cyan">
            ${firstName.charAt(0).toUpperCase()}${lastName
              ? lastName.charAt(0).toUpperCase()
              : ""}
          </div>

          <div class="activity-content">

            <div class="activity-user">
              ${firstName} ${lastName}
            </div>

            <div class="activity-post">
              ${post.title || "Untitled Post"}
            </div>

            <div class="activity-description">
              ${post.description || ""}
            </div>

          </div>

          <div class="activity-date">
            ${new Date(post.created_at).toLocaleDateString()}
          </div>

        </div>
      `;
    });

  } catch (error) {
    console.error(error);
  }
}
loadRecentActivities();



// for event contro
 
// async function loadPendingEvents() {
//   const pendingEventsList = document.getElementById("pendingEventsList");
//   if (!pendingEventsList) return;
 
//   try {
//     const { data, error } = await supabase
//       .from("events")
//       .select("*")
//       .eq("status", "pending")
//       .order("date", { ascending: true });
 
//     if (error) {
//       console.error("Error loading pending events:", error);
//       pendingEventsList.innerHTML = `
//         <p style="color:#94a3b8; font-size:0.85rem; padding:8px">
//           Failed to load pending events.
//         </p>`;
//       return;
//     }
 
//     if (!data || data.length === 0) {
//       pendingEventsList.innerHTML = `
//         <p style="color:#94a3b8; font-size:0.85rem; padding:8px">
//           No pending events right now.
//         </p>`;
//       return;
//     }
 
//     pendingEventsList.innerHTML = "";
 
//     data.forEach((eventItem) => {
//       pendingEventsList.innerHTML += `
//         <div class="moderation-user" id="pending-event-${eventItem.id}">
//           <div>
//             <span class="fw-bold d-block text-white" style="font-size: 0.85rem;">
//               ${eventItem.title || "Untitled Event"}
//             </span>
//             <span class="text-light opacity-50 d-block" style="font-size: 0.7rem;">
//               ${eventItem.category || ""} • ${eventItem.date || ""} ${eventItem.time || ""}
//             </span>
//             <span class="text-light opacity-50 d-block" style="font-size: 0.7rem;">
//               ${eventItem.location || ""}
//             </span>
//           </div>
 
//           <div style="display:flex; gap:6px; margin-left:auto;">
//             <button
//               class="btn btn-sm btn-outline-success"
//               style="font-size: 0.75rem;"
//               onclick="approveEvent(${eventItem.id})"
//             >
//               Approve
//             </button>
//             <button
//               class="btn btn-sm btn-outline-danger"
//               style="font-size: 0.75rem;"
//               onclick="rejectEvent(${eventItem.id})"
//             >
//               Reject
//             </button>
//           </div>
//         </div>
//       `;
//     });
//   } catch (err) {
//     console.error("Pending events exception:", err);
//   }
// }
async function loadPendingEvents() {
  const pendingEventsList = document.getElementById("pendingEventsList");
  if (!pendingEventsList) return;

  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "pending")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error loading pending events:", error);
      pendingEventsList.innerHTML = `
        <p style="color:#94a3b8; font-size:0.85rem; padding:8px">
          Failed to load pending events.
        </p>`;
      return;
    }

    if (!data || data.length === 0) {
      pendingEventsList.innerHTML = `
        <p style="color:#94a3b8; font-size:0.85rem; padding:8px">
          No pending events right now.
        </p>`;
      return;
    }

    pendingEventsList.innerHTML = "";

    data.forEach((eventItem) => {
      pendingEventsList.innerHTML += `
        <div class="moderation-user" id="pending-event-${eventItem.id}">
          <div style="flex: 1; min-width: 140px; padding-right: 8px;">
            <span class="fw-bold d-block text-white" style="font-size: 0.85rem; word-break: break-word;">
              ${eventItem.title || "Untitled Event"}
            </span>
            <span class="text-light opacity-50 d-block" style="font-size: 0.7rem;">
              ${eventItem.category || ""} • ${eventItem.date || ""} ${eventItem.time || ""}
            </span>
            <span class="text-light opacity-50 d-block" style="font-size: 0.7rem; word-break: break-word;">
              ${eventItem.location || ""}
            </span>
          </div>

          <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
            <button
              class="btn btn-sm btn-outline-success"
              style="font-size: 0.7rem; padding: 2px 8px; white-space: nowrap;"
              onclick="approveEvent('${eventItem.id}')"
            >
              Approve
            </button>
            <button
              class="btn btn-sm btn-outline-danger"
              style="font-size: 0.7rem; padding: 2px 8px; white-space: nowrap;"
              onclick="rejectEvent('${eventItem.id}')"
            >
              Reject
            </button>
          </div>
        </div>
      `;
    });
  } catch (err) {
    console.error("Pending events exception:", err);
  }
}
 
window.approveEvent = async function (id) {
  try {
    const { error } = await supabaseAdmin
      .from("events")
      .update({ status: "approved" })
      .eq("id", id);
 
    if (error) {
      console.error("Approve event error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not approve this event.",
        background: "#1e293b",
        color: "#ffffff",
      });
      return;
    }
 
    Swal.fire({
      icon: "success",
      title: "Approved!",
      text: "Event is now live for all users.",
      background: "#1e293b",
      color: "#ffffff",
      timer: 1500,
      showConfirmButton: false,
    });
 
    loadPendingEvents();
  } catch (err) {
    console.error(err);
  }
};
 
window.rejectEvent = async function (id) {
  const result = await Swal.fire({
    icon: "warning",
    title: "Reject this event?",
    text: "The organizer's event will not be published.",
    color: "#ffffff",
    background: "#1e293b",
    showCancelButton: true,
    confirmButtonText: "Yes, reject",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
  });
 
  if (!result.isConfirmed) return;
 
  try {
    const { error } = await supabaseAdmin
      .from("events")
      .update({ status: "rejected" })
      .eq("id", id);
 
    if (error) {
      console.error("Reject event error:", error);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Could not reject this event.",
        background: "#1e293b",
        color: "#ffffff",
      });
      return;
    }
 
    Swal.fire({
      icon: "success",
      title: "Rejected",
      text: "Event has been rejected.",
      background: "#1e293b",
      color: "#ffffff",
      timer: 1500,
      showConfirmButton: false,
    });
 
    loadPendingEvents();
  } catch (err) {
    console.error(err)}
  }
   loadPendingEvents() 