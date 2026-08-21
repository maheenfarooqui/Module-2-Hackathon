// Supabase Setup
const SUPABASE_URL = "https://dpheuwopfkpdynfgjthm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================
   HEADER & PROFILE HANDLERS
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  var profileTrigger = document.getElementById("profileTrigger");
  var profileDropdown = document.getElementById("profileDropdown");
  var profilePicInput = document.getElementById("profilePicInput");
  var avatarInitials = document.getElementById("avatarInitials");
  var avatarImage = document.getElementById("avatarImage");
  var mobileToggle = document.getElementById("mobileToggle");
  var navMenu = document.getElementById("navMenu");
  var logoutBtn = document.getElementById("logoutBtn");

  // Load User Info from Supabase Auth
  showUserIcon();

  // 1. Toggle Profile Dropdown
  if (profileTrigger && profileDropdown) {
    profileTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
      profileTrigger.classList.toggle("active");
    });

    document.addEventListener("click", function () {
      profileDropdown.classList.remove("show");
      profileTrigger.classList.remove("active");
    });
  }

  // 2. Profile Image LocalStorage Persistence Fallback
  var savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar && avatarImage && avatarInitials) {
    avatarImage.src = savedAvatar;
    avatarImage.classList.remove("hidden");
    avatarInitials.classList.add("hidden");
  }

  // 3. Profile Picture Upload Listener
  if (profilePicInput) {
    profilePicInput.addEventListener("change", handleProfilePicUpload);
  }

  // 4. Mobile Navigation Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", function () {
      navMenu.classList.toggle("active");
    });
  }

  // 5. Logout Handler
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (typeof Swal !== "undefined") {
        Swal.fire({
          title: "Logout?",
          text: "Are you sure you want to log out of QuadPulse?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#0e8388",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Logout",
          background: "#081d21",
          color: "#ffffff"
        }).then(function (result) {
          if (result.isConfirmed) {
            window.location.href = "index.html";
          }
        });
      } else {
        if (confirm("Are you sure you want to log out?")) {
          window.location.href = "index.html";
        }
      }
    });
  }
});

// Helper: Fetch & Display Supabase User Metadata
async function showUserIcon() {
  try {
    var response = await supabaseClient.auth.getUser();
    var user = response.data ? response.data.user : null;
    var userError = response.error;

    if (userError || !user) return;

    var fullName = user.user_metadata?.full_name || "User";
    var userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) userNameDisplay.innerText = fullName;

    var savedAvatarUrl = user.user_metadata?.avatar_url;
    if (savedAvatarUrl) {
      displayAvatarImage(savedAvatarUrl);
    } else {
      var firstInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";
      var avatarInitials = document.getElementById("avatarInitials");
      if (avatarInitials) avatarInitials.innerText = firstInitial;
    }

    // Dynamic Admin Link Injection
    var userRole = user.user_metadata?.role;
    var dropdownMenu = document.getElementById("profileDropdown");
    if (userRole === "admin" && dropdownMenu && !document.getElementById("adminDashboardLink")) {
      var adminLinkHTML = 
        '<a href="./adminDashboard.html" class="dropdown-item" id="adminDashboardLink">' +
          '<i class="fa-solid fa-user-shield"></i>' +
          '<span>Admin Dashboard</span>' +
        '</a>';
      dropdownMenu.insertAdjacentHTML("afterbegin", adminLinkHTML);
    }
  } catch (err) {
    console.error("Error fetching user profile:", err);
  }
}

// Helper: Handle Avatar Upload to Supabase Storage
async function handleProfilePicUpload(event) {
  var file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file!");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    alert("File size must be under 2MB!");
    return;
  }

  try {
    var response = await supabaseClient.auth.getUser();
    var user = response.data ? response.data.user : null;
    var userError = response.error;

    if (userError || !user) throw new Error("User not authenticated");

    var fileExt = file.name.split(".").pop();
    var filePath = user.id + "/avatar." + fileExt;

    var uploadRes = await supabaseClient.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadRes.error) throw uploadRes.error;

    var publicUrlObj = supabaseClient.storage.from("avatars").getPublicUrl(filePath);
    var avatarUrl = publicUrlObj.data.publicUrl + "?t=" + new Date().getTime();

    var updateRes = await supabaseClient.auth.updateUser({
      data: { avatar_url: avatarUrl }
    });

    if (updateRes.error) throw updateRes.error;

    displayAvatarImage(avatarUrl);
    localStorage.setItem("userAvatar", avatarUrl);
    alert("Profile picture updated successfully!");
  } catch (error) {
    console.error("Upload error:", error.message);
    alert("Upload Failed: " + error.message);
  }
}

// Helper: Display Avatar Image
function displayAvatarImage(url) {
  var avatarImage = document.getElementById("avatarImage");
  var avatarInitials = document.getElementById("avatarInitials");

  if (avatarImage && url) {
    avatarImage.src = url;
    avatarImage.classList.remove("hidden");
    if (avatarInitials) avatarInitials.style.display = "none";
  }
}

/* ==========================================================
   STUDY PARTNER FINDER CORE LOGIC
   ========================================================== */
let partners = [];

// DOM Elements
const partnersContainer = document.getElementById("partnersContainer");
const filterSubject = document.getElementById("filterSubject");
const filterSkill = document.getElementById("filterSkill");
const filterLevel = document.getElementById("filterLevel");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const addProfileForm = document.getElementById("addProfileForm");
const profileForm = document.getElementById("profileForm");
const submitBtn = document.getElementById("submitBtn");

// Toggle Form Visibility with GSAP
toggleFormBtn.addEventListener("click", () => {
  const isOpening = !addProfileForm.classList.contains("active");
  addProfileForm.classList.toggle("active");
  
  toggleFormBtn.textContent = isOpening ? "Close Form" : "Add My Profile";
  
  if (typeof animateFormToggle === "function") {
    animateFormToggle(isOpening);
  }
});

// Fetch Data from Supabase
async function fetchPartners() {
  partnersContainer.innerHTML = `
    <div class="no-results card-box">
      Loading study partners...
    </div>
  `;

  const { data, error } = await supabaseClient
    .from("study_partners")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching data:", error);
    partnersContainer.innerHTML = `
      <div class="no-results card-box" style="color: #ff6b6b;">
        Failed to load profiles. Please check Supabase configuration.
      </div>
    `;
    return;
  }

  partners = data || [];
  filterPartners();
}

// Render Partner Cards
function renderPartners(data) {
  partnersContainer.innerHTML = "";

  if (data.length === 0) {
    partnersContainer.innerHTML = `
      <div class="no-results card-box">
        No study partners found matching your criteria.
      </div>
    `;
    return;
  }

  data.forEach(partner => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name)}&background=124B57&color=8CE5ED`;
    
    const card = document.createElement("div");
    card.className = "partner-card";
    card.innerHTML = `
      <div>
        <div class="profile-header">
          <img 
            src="${partner.picture || defaultAvatar}" 
            alt="${partner.name}" 
            class="profile-img"
            onerror="this.src='${defaultAvatar}'"
          />
          <div class="profile-info">
            <h3>${partner.name}</h3>
            <span class="badge-level">${partner.experience}</span>
          </div>
        </div>

        <p class="bio">${partner.intro}</p>

        <div class="detail-section">
          <div class="detail-label">Subjects</div>
          <div class="tags-container">
            ${partner.subjects.map(s => `<span class="tag">${s.trim()}</span>`).join("")}
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Skills</div>
          <div class="tags-container">
            ${partner.skills.map(s => `<span class="tag skill">${s.trim()}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="availability">
          🕒 <span>${partner.availability}</span>
        </div>
      </div>
    `;
    partnersContainer.appendChild(card);
  });

  // Call GSAP Stagger Animation
  if (typeof animatePartnerCards === "function") {
    animatePartnerCards();
  }
}

// Search & Filter Logic
function filterPartners() {
  const subjectQuery = filterSubject.value.toLowerCase().trim();
  const skillQuery = filterSkill.value.toLowerCase().trim();
  const levelQuery = filterLevel.value;

  const filtered = partners.filter(partner => {
    const matchesSubject = !subjectQuery || partner.subjects.some(s => s.toLowerCase().includes(subjectQuery));
    const matchesSkill = !skillQuery || partner.skills.some(s => s.toLowerCase().includes(skillQuery));
    const matchesLevel = !levelQuery || partner.experience === levelQuery;

    return matchesSubject && matchesSkill && matchesLevel;
  });

  renderPartners(filtered);
}

// Filter Event Listeners
filterSubject.addEventListener("input", filterPartners);
filterSkill.addEventListener("input", filterPartners);
filterLevel.addEventListener("change", filterPartners);

profileForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  submitBtn.disabled = true;
  submitBtn.textContent = "Publishing...";

  const newPartner = {
    name: document.getElementById("name").value.trim(),
    picture: document.getElementById("picture").value.trim() || null,
    experience: document.getElementById("experience").value,
    availability: document.getElementById("availability").value.trim(),
    subjects: document.getElementById("subjects").value.split(",").map(s => s.trim()).filter(Boolean),
    skills: document.getElementById("skills").value.split(",").map(s => s.trim()).filter(Boolean),
    intro: document.getElementById("bio").value.trim()
  };

  const { error } = await supabaseClient
    .from("study_partners")
    .insert([newPartner]);

  submitBtn.disabled = false;
  submitBtn.textContent = "Publish Profile";

  if (error) {
    console.error("Error inserting data:", error);
    alert("Error publishing profile: " + error.message);
    return;
  }

  profileForm.reset();
  if (typeof animateFormToggle === "function") {
    animateFormToggle(false);
  }
  addProfileForm.classList.remove("active");
  toggleFormBtn.textContent = "Add My Profile";
  fetchPartners();
});


fetchPartners();