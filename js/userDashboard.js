// supabase links
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const service_role =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaGV1d29wZmtwZHluZmdqdGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMjM5OSwiZXhwIjoyMDk4NDk4Mzk5fQ.yvmgW9-bzNBspiaqHMKtXf-GlfJaeMrgJxTH40_-gRw";
var supabase = createClient(supbaseUrl, supbaseKey);
const supabaseAdmin = createClient(supbaseUrl, service_role);

// Welcome User
let currentUserFname;
let currentUserLname;
let currentUserId;
let currentUserEmail;

welcomeUser();

async function welcomeUser() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return;

  currentUserId = user.id;
  currentUserEmail = user.email;

  // Profile update mein hum full_name save kar rahe hain
  const fullName = user.user_metadata?.full_name || "User";

  // Welcome name display
  const welcomeUserName =
    document.getElementById("welcomeUserName");

  if (welcomeUserName) {
    welcomeUserName.innerText = fullName;
  }
}
async function loadStatsCounts() {
  try {
    // 1. PostApp Table se Total Posts ka Count
    const { count: postsCount, error: postsError } = await supabase
      .from("postApp")
      .select("*", { count: "exact", head: true });

    if (!postsError && postsCount !== null) {
      const postsEl = document.getElementById("totalPostsCount");
      if (postsEl) {
        postsEl.innerText = `${postsCount}`;
      }
    }

    // 2. Events Table se Total Events ka Count
    const { count: eventsCount, error: eventsError } = await supabase
      .from("events")
      .select("*", { count: "exact", head: true });

    if (!eventsError && eventsCount !== null) {
      const eventsEl = document.getElementById("upcomingEventsCount");
      if (eventsEl) {
        eventsEl.innerText = `${eventsCount}`;
      }
    }
  } catch (err) {
    console.error("Stats count error:", err.message);
  }
}

// DOM load hote hi counts update honge
document.addEventListener("DOMContentLoaded", () => {
  loadStatsCounts();
});

async function loadDashboardUpcomingEvents() {
  const eventsListContainer = document.getElementById("upcomingEventsList");
  if (!eventsListContainer) return;

  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);

    if (error) throw error;

    if (events && events.length > 0) {
      eventsListContainer.innerHTML = events
        .map((event) => {
          const formattedDate = event["formatted-date"] || event.date || "";

          let day = "01";
          let month = "AUG";

          // Day aur Month extract karne ka logic
          if (event.date) {
            const d = new Date(event.date);
            if (!isNaN(d)) {
              day = d.getDate().toString().padStart(2, "0");
              month = d
                .toLocaleString("en-US", { month: "short" })
                .toUpperCase();
            }
          } else if (formattedDate) {
            const parts = formattedDate.trim().split(" ");
            if (parts.length >= 2) {
              day = parts[0].padStart(2, "0");
              month = parts[1].substring(0, 3).toUpperCase();
            }
          }

          const location = event.location || "Campus";

          return `
          <div class="event-item">
            <div class="event-date">
              <span class="day">${day}</span>
              <span class="month">${month}</span>
            </div>
            <div class="event-info">
              <h4>${event.title || "Untitled Event"}</h4>
              <p><i class="fa-solid fa-location-dot"></i> ${location}</p>
            </div>
          </div>
        `;
        })
        .join("");
    } else {
      eventsListContainer.innerHTML = `<p style="color: #94a3b8; font-size: 0.85rem; padding: 8px;">No upcoming events available.</p>`;
    }
  } catch (err) {
    console.error("Error loading dashboard events:", err.message);
    eventsListContainer.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem; padding: 8px;">Failed to load events.</p>`;
  }
}

// DOM load hone par run karein
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardUpcomingEvents();
});

async function loadMyRecentPosts() {
  const postsListContainer = document.getElementById("myPostsList");
  if (!postsListContainer) return;

  try {
    // 1. Current logged-in user get karein
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      postsListContainer.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem; padding: 12px;">Please log in to view your posts.</p>`;
      return;
    }

    // 2. postApp table se sirf current user ki posts fetch karein
    const { data: posts, error } = await supabase
      .from("postApp")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    if (posts && posts.length > 0) {
      postsListContainer.innerHTML = posts
        .map((post) => {
          // Date Format (e.g. "Aug 15, 2026")
          const postDate = post.created_at
            ? new Date(post.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Recently";

          return `
          <div class="post-item" id="post-${post.id}">
            <div class="post-header">
              <h3>${post.title || "Untitled Post"}</h3>
              <span class="post-date">${postDate}</span>
            </div>
            <p>${post.description || post.content || "No content provided."}</p>
            <div class="post-actions">
              <button class="action-link" onclick="editPost('${post.id}')">
                <i class="fa-solid fa-pen-to-square"></i> Edit
              </button>
            <button class="action-link delete" onclick="deletePost('${post.id}')">
  <i class="fa-solid fa-trash"></i> Delete
</button>
            </div>
          </div>
        `;
        })
        .join("");
    } else {
      postsListContainer.innerHTML = `<p style="color: #94a3b8; font-size: 0.85rem; padding: 12px;">You haven't created any posts yet.</p>`;
    }
  } catch (err) {
    console.error("Error fetching user posts:", err.message);
    postsListContainer.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem; padding: 12px;">Failed to load posts.</p>`;
  }
}

// Delete Post Function
// Delete Post Function
async function deletePost(postId) {
  // 1. Delete se pehle confirmation
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to delete this post?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, delete it!",
  });

  // 2. Agar user ne cancel kiya to function yahin stop
  if (!result.isConfirmed) return;

  try {
    // 3. Current logged-in user get karein
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      Swal.fire("Error", "Please log in first.", "error");
      return;
    }

    // 4. Sirf current user ki post delete karein
    const { error } = await supabase
      .from("postApp")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id);

    if (error) throw error;

    // 5. UI se deleted post remove karein
    const postCard = document.getElementById(`post-${postId}`);

    if (postCard) {
      postCard.remove();
    }

    // 6. Success message
    Swal.fire("Deleted!", "Your post has been deleted.", "success");
  } catch (err) {
    console.error("Delete error:", err.message);

    Swal.fire("Error", "Could not delete post: " + err.message, "error");
  }
}
window.deletePost = deletePost;
window.editPost = editPost;

// Edit Post Function (Placeholder for redirection or modal)
function editPost(postId) {
  window.location.href = `communitypost.html?edit=${postId}`;
}

// Page load execution
document.addEventListener("DOMContentLoaded", () => {
  loadMyRecentPosts();
});

let currentAvatarUrl = null;

// 1. Existing User Data Load Karein
async function loadUserProfile() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) return;

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("emailAddr");
    const avatarImg = document.getElementById("avatarImage");
    const defaultIcon = document.getElementById("defaultAvatarIcon");

    // Populate Fields
    fullNameInput.value =
      user.user_metadata?.full_name || user.user_metadata?.name || "";
    emailInput.value = user.email || "";

    // Populate Avatar
    const avatarUrl = user.user_metadata?.avatar_url;
    if (avatarUrl) {
      currentAvatarUrl = avatarUrl;
      avatarImg.src = avatarUrl;
      avatarImg.style.display = "block";
      defaultIcon.style.display = "none";
    }
  } catch (err) {
    console.error("Error loading user profile:", err.message);
  }
}

// 2. Avatar Instant Preview (Local File Select)
document.getElementById("avatarInput")?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (event) {
      const avatarImg = document.getElementById("avatarImage");
      const defaultIcon = document.getElementById("defaultAvatarIcon");
      avatarImg.src = event.target.result;
      avatarImg.style.display = "block";
      defaultIcon.style.display = "none";
    };
    reader.readAsDataURL(file);
  }
});

// 3. Save Profile Changes (Supabase Upload + Metadata Update)
document
  .getElementById("profileForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById("saveProfileBtn");

    saveBtn.disabled = true;
    saveBtn.innerText = "Updating...";

    try {
      // 1. Current logged-in user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated");
      }

      // 2. Form values
      const newFullName = document
        .getElementById("fullName")
        .value
        .trim();

      const newEmail = document
        .getElementById("emailAddr")
        .value
        .trim();

      const avatarFile =
        document.getElementById("avatarInput").files[0];

      let updatedAvatarUrl = currentAvatarUrl;

      // 3. Agar new avatar select kiya hai
      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();

        const fileName = `${user.id}-${Date.now()}.${fileExt}`;

        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile);

        if (uploadError) {
          throw uploadError;
        }

        // 4. Avatar public URL
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        updatedAvatarUrl = publicUrlData.publicUrl;
      }

      // 5. Update User Metadata
      const { data: updatedUser, error: updateError } =
        await supabase.auth.updateUser({
          data: {
            full_name: newFullName,
            avatar_url: updatedAvatarUrl,
          },
        });

      if (updateError) {
        throw updateError;
      }

      // 6. Agar email bhi change ki hai
      if (newEmail && newEmail !== user.email) {
        const { error: emailError } =
          await supabase.auth.updateUser({
            email: newEmail,
          });

        if (emailError) {
          throw emailError;
        }
      }

      // 7. Check karo actually update hua ya nahi
      console.log("UPDATED USER:", updatedUser);

      console.log(
        "UPDATED METADATA:",
        updatedUser.user.user_metadata
      );

      // 8. Current avatar URL update
      currentAvatarUrl = updatedAvatarUrl;

      // 9. Success
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile details have been successfully saved.",
        timer: 2000,
        showConfirmButton: false,
      });

    } catch (err) {
      console.error("Profile update error:", err);

      Swal.fire(
        "Error",
        err.message || "Failed to update profile",
        "error"
      );

    } finally {
      saveBtn.disabled = false;
      saveBtn.innerText = "Save Changes";
    }
  });

// Load Profile on Page Init
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
});

// logout

async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
  } catch (error) {
    console.log(error);
  }
  window.location.href = "index.html";
}
window.logout = logout;



