// supabase connect
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const supbaseKey = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";
const supbaseUrl = "https://dpheuwopfkpdynfgjthm.supabase.co";
const service_role =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwaGV1d29wZmtwZHluZmdqdGhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjkyMjM5OSwiZXhwIjoyMDk4NDk4Mzk5fQ.yvmgW9-bzNBspiaqHMKtXf-GlfJaeMrgJxTH40_-gRw";
var supabase = createClient(supbaseUrl, supbaseKey);
const supabaseAdmin = createClient(supbaseUrl, service_role);

document.addEventListener("DOMContentLoaded", () => {
  const profileTrigger = document.getElementById("profileTrigger");
  const profileDropdown = document.getElementById("profileDropdown");
  const profilePicInput = document.getElementById("profilePicInput");
  const avatarInitials = document.getElementById("avatarInitials");
  const avatarImage = document.getElementById("avatarImage");
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  // function onload
  showUserIcon();

  // 1. Toggle Profile Dropdown
  profileTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("show");
    profileTrigger.classList.toggle("active");
  });

  // Close Dropdown when clicking outside
  document.addEventListener("click", () => {
    profileDropdown.classList.remove("show");
    profileTrigger.classList.remove("active");
  });

  // 2. Profile Image Upload Preview & LocalStorage Persistence
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) {
    avatarImage.src = savedAvatar;
    avatarImage.classList.remove("hidden");
    avatarInitials.classList.add("hidden");
  }

  profilePicInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        const imageSrc = event.target.result;
        avatarImage.src = imageSrc;
        avatarImage.classList.remove("hidden");
        avatarInitials.classList.add("hidden");
        localStorage.setItem("userAvatar", imageSrc);
      };
      reader.readAsDataURL(file);
    }
  });

  // 3. Mobile Navigation Toggle
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });
  }

  // 4. Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to log out of QuadPulse?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0e8388",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Logout",
        background: "#081d21",
        color: "#ffffff",
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    });
  }
});

// App State
let selectedBgImg = "";
let isEditMode = false;
let editIndex = null;
let currentUserFname;
let currentUserLname;
let currentUserId;
let currentUserEmail;
async function showUserIcon() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return;

  currentUserId = user.id;
  // Profile mein hum full_name save kar rahe hain
  const fullName = user.user_metadata?.full_name || "User";

  // Current user name
  currentUserFname = fullName;
  currentUserLname = "";
  const userNameDisplay = document.getElementById("userNameDisplay");
  if (userNameDisplay) userNameDisplay.innerText = fullName;
  const welcomeUserName = document.getElementById("welcomeUserName");
  if (welcomeUserName) {
    welcomeUserName.innerText = fullName;
  }
  // Profile Picture check & render
  const savedAvatarUrl = user.user_metadata?.avatar_url;
  if (savedAvatarUrl) {
    displayAvatarImage(savedAvatarUrl);
  } else {
    // Agar image nahi hai to Initials dikhayein
    const firstInitial = currentUserFname
      ? currentUserFname.charAt(0).toUpperCase()
      : "U";
    const lastInitial = currentUserLname
      ? currentUserLname.charAt(0).toUpperCase()
      : "";
    const avatarInitials = document.getElementById("avatarInitials");
    if (avatarInitials) avatarInitials.innerText = firstInitial + lastInitial;
  }

  // Admin link insertion
  const userRole = user.user_metadata?.role;
  const dropdownMenu = document.getElementById("profileDropdown");
  if (
    userRole === "admin" &&
    dropdownMenu &&
    !document.getElementById("adminDashboardLink")
  ) {
    const adminLinkHTML = `
      <a href="./adminDashboard.html" class="dropdown-item" id="adminDashboardLink">
        <i class="fa-solid fa-user-shield"></i>
        <span>Admin Dashboard</span>
      </a>
    `;
    dropdownMenu.insertAdjacentHTML("afterbegin", adminLinkHTML);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const profilePicInput = document.getElementById("profilePicInput");

  if (profilePicInput) {
    profilePicInput.addEventListener("change", handleProfilePicUpload);
  }
});

async function handleProfilePicUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  // File type and size validation (Max 2MB)
  if (!file.type.startsWith("image/")) {
    Swal.fire("Error", "Please select a valid image file!", "error");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    Swal.fire("Error", "File size must be under 2MB!", "error");
    return;
  }

  try {
    // Current logged-in user get karein
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("User not authenticated");

    // File name unique banane ke liye timestamp attach karein
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // 1. Supabase Storage Mein Upload Karein (Upsert=true se purani photo overwrite ho jayegi)
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // 2. Uploaded Image Ka Public URL Get Karein
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Cache clear karne ke liye cache-buster query string add karein
    const avatarUrl = `${publicUrl}?t=${new Date().getTime()}`;

    // 3. Auth Metadata Mein Image URL Save/Update Karein
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: avatarUrl },
    });

    if (updateError) throw updateError;

    // 4. UI Par Live Picture Display Karein
    displayAvatarImage(avatarUrl);

    Swal.fire({
      icon: "success",
      title: "Updated!",
      text: "Profile picture updated successfully!",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (error) {
    console.error("Upload error:", error.message);
    Swal.fire("Upload Failed", error.message, "error");
  }
}

// UI par Image render karne aur Initials hide karne ka helper function
function displayAvatarImage(url) {
  const avatarImage = document.getElementById("avatarImage");
  const avatarInitials = document.getElementById("avatarInitials");

  if (avatarImage && url) {
    avatarImage.src = url;
    avatarImage.classList.remove("hidden");
    if (avatarInitials) avatarInitials.style.display = "none";
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

async function loadMiniEvents() {
  const container = document.getElementById("eventsMiniGrid");
  if (!container) return;

  try {
    // Supabase se 2 latest events fetch karein
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(2);

    if (error) throw error;

    if (events && events.length > 0) {
      container.innerHTML = events
        .map((event) => {
          // Date aur Time handle karna
          const formattedDate = event["formatted-date"] || event.date || "";
          const formattedTime = event["formatted-time"] || event.time || "";

          let day = "01";
          let month = "AUG";

          // Day aur Month extract karna
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
          const timeDisplay = formattedTime ? ` • ${formattedTime}` : "";

          return `
          <div class="event-mini-card">
            <div class="event-date">
              <span class="day">${day}</span>
              <span class="month">${month}</span>
            </div>
            <div class="event-details">
              <h4>${event.title || "Untitled Event"}</h4>
              <p><i class="fa-solid fa-location-dot"></i> ${location}${timeDisplay}</p>
            </div>
          </div>
        `;
        })
        .join("");
    } else {
      container.innerHTML = `<p style="color: #94a3b8; font-size: 0.85rem;">No upcoming events available.</p>`;
    }
  } catch (err) {
    console.error("Error loading mini events:", err.message);
    container.innerHTML = `<p style="color: #ef4444; font-size: 0.85rem;">Failed to load events.</p>`;
  }
}

// Page load par execute karein
document.addEventListener("DOMContentLoaded", () => {
  loadMiniEvents();
});
async function loadAnnouncements() {
  const announcementList = document.getElementById("announcementList");

  if (!announcementList) return;

  try {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error loading announcements:", error);

      announcementList.innerHTML = `
        <p style="color: #f87171; padding: 12px;">
          Failed to load announcements.
        </p>
      `;

      return;
    }

    if (!data || data.length === 0) {
      announcementList.innerHTML = `
        <p style="color: #94a3b8; padding: 12px;">
          No announcements available.
        </p>
      `;

      return;
    }

    announcementList.innerHTML = "";

    data.forEach((announcement) => {
      const createdAt = new Date(announcement.created_at);

      const timeAgo = getTimeAgo(createdAt);

      const priorityClass =
        announcement.category === "Urgent"
          ? "priority-high"
          : "";

      announcementList.innerHTML += `
        <div class="announcement-item ${priorityClass}">

          <span class="tag">
            ${announcement.category}
          </span>

          <h3>
            ${announcement.title}
          </h3>

          <p>
            ${announcement.description}
          </p>

          <span class="time-stamp">
            ${timeAgo}
          </span>

        </div>
      `;
    });

  } catch (error) {
    console.error("Unexpected error:", error);
  }
}
function getTimeAgo(date) {
  const now = new Date();

  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) {
    return "Just now";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  return `${days} days ago`;
}
loadAnnouncements()

// gsap

const userName = document.getElementById("welcomeUserName");
const text = userName.textContent;

userName.textContent = "";

const typewriter = gsap.timeline({
  repeat: -1,
  repeatDelay: 0.8,
});

typewriter
  // Type
  .to(
    userName,
    {
      duration: text.length * 0.1,
      ease: "none",
      text: text,
    }
  )

  // Wait
  .to({}, { duration: 1 })

  // Delete
  .to(userName, {
    duration: text.length * 0.06,
    ease: "none",
    text: "",
  })

  // Wait before typing again
  .to({}, { duration: 0.5 });


  document.addEventListener("DOMContentLoaded", () => {
  if (typeof gsap !== "undefined" && gsap.registerPlugin && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  initParticles();
  initButtonHoverLine();
  initScrollArrow();
  initPageIntro();
  initDropdownAnimation();
  initButtonTapFeedback();
});

// ---------------- Floating background particles ----------------
function initParticles() {
  const container = document.getElementById("particle-container");
  if (!container) return;

  const numParticles = 50;

  for (let i = 0; i < numParticles; i++) {
    createParticle(container);
  }
}

function createParticle(container) {
  const particle = document.createElement("div");
  particle.className = "particle";
  container.appendChild(particle);

  const size = Math.random() * 2 + 2; // 2px se 7px tak

  gsap.set(particle, {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    width: size,
    height: size,
    opacity: Math.random() * 0.5 + 0.2,
  });

  animateParticle(particle);
}

function animateParticle(particle) {
  gsap.to(particle, {
    x: `+=${Math.random() * 200 - 100}`,
    y: `+=${Math.random() * 200 - 100}`,
    duration: Math.random() * 10 + 5,
    ease: "none",
    onComplete: () => animateParticle(particle),
  });

  gsap.to(particle, {
    opacity: Math.random() * 0.8 + 0.1,
    duration: Math.random() * 2 + 1,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });
}