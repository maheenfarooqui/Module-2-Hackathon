// Supabase Setup
const SUPABASE_URL = "https://dpheuwopfkpdynfgjthm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ==========================================================
   THEMED ALERT HELPERS (SweetAlert2, matching QuadPulse theme)
   ========================================================== */
function notifyInfo(title, text, icon) {
  if (typeof Swal === "undefined") {
    alert(text || title);
    return Promise.resolve();
  }
  return Swal.fire({
    icon: icon || "info",
    title,
    text,
    background: "#081d21",
    color: "#ffffff",
    confirmButtonColor: "#0e8388"
  });
}

function notifySuccess(title, text) {
  if (typeof Swal === "undefined") {
    alert(title);
    return Promise.resolve();
  }
  return Swal.fire({
    icon: "success",
    title,
    text,
    background: "#081d21",
    color: "#ffffff",
    confirmButtonColor: "#0e8388",
    timer: 1800,
    showConfirmButton: false
  });
}

function notifyError(title, text) {
  if (typeof Swal === "undefined") {
    alert(text || title);
    return Promise.resolve();
  }
  return Swal.fire({
    icon: "error",
    title,
    text,
    background: "#081d21",
    color: "#ffffff",
    confirmButtonColor: "#0e8388"
  });
}

async function confirmAction(title, text, confirmButtonText) {
  if (typeof Swal === "undefined") {
    return confirm(text || title);
  }
  const result = await Swal.fire({
    title,
    text,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0e8388",
    cancelButtonColor: "#d33",
    confirmButtonText: confirmButtonText || "Yes",
    background: "#081d21",
    color: "#ffffff"
  });
  return result.isConfirmed;
}

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
    notifyError("Invalid File", "Please select a valid image file!");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    notifyError("File Too Large", "File size must be under 2MB!");
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
    notifySuccess("Updated!", "Profile picture updated successfully!");
  } catch (error) {
    console.error("Upload error:", error.message);
    notifyError("Upload Failed", error.message);
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
let currentUserId = null;
let currentUserName = "A student";
let currentUserAvatarUrl = null;
let editingPartnerId = null;
let sentRequestPartnerIds = new Set();
let currentProfilePictureUrl = null; // resolved picture URL to save on submit

// DOM Elements
const partnersContainer = document.getElementById("partnersContainer");
const filterSubject = document.getElementById("filterSubject");
const filterSkill = document.getElementById("filterSkill");
const filterLevel = document.getElementById("filterLevel");
const toggleFormBtn = document.getElementById("toggleFormBtn");
const addProfileForm = document.getElementById("addProfileForm");
const profileForm = document.getElementById("profileForm");
const submitBtn = document.getElementById("submitBtn");
const pictureInput = document.getElementById("pictureInput");
const pictureAvatarPreview = document.getElementById("pictureAvatarPreview");

// Helper: show a picture (URL or data URL) in the small circular preview,
// falling back to the default person icon when there's nothing to show.
function setPicturePreview(url) {
  if (pictureAvatarPreview) {
    pictureAvatarPreview.innerHTML = url
      ? `<img src="${url}" style="width:100%;height:100%;object-fit:cover;" />`
      : `<i class="fa-solid fa-user"></i>`;
  }
}

// Instant local preview when a new photo file is chosen
pictureInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => setPicturePreview(event.target.result);
  reader.readAsDataURL(file);
});

// Toggle Form Visibility with GSAP
toggleFormBtn.addEventListener("click", () => {
  const isOpening = !addProfileForm.classList.contains("active");
  addProfileForm.classList.toggle("active");

  if (!isOpening) {
    // Closing without submitting — reset back to "create" mode
    editingPartnerId = null;
    profileForm.reset();
    document.getElementById("name").value = currentUserName;
    currentProfilePictureUrl = null;
    setPicturePreview(null);
    submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane icon-left"></i> Publish Profile';
  } else if (!editingPartnerId) {
    // Opening fresh (not editing) — default the picture to the account's
    // own profile photo; the person can still choose a different one.
    document.getElementById("name").value = currentUserName;
    currentProfilePictureUrl = currentUserAvatarUrl;
    setPicturePreview(currentUserAvatarUrl);
  }

  toggleFormBtn.innerHTML = isOpening
    ? '<i class="fa-solid fa-xmark icon-left"></i> Close Form'
    : '<i class="fa-solid fa-user-plus icon-left"></i> Add My Profile';
  
  if (typeof animateFormToggle === "function") {
    animateFormToggle(isOpening);
  }
});

// Edit: prefill the form with this partner's existing data and switch to update mode
window.editPartnerProfile = function (id) {
  const partner = partners.find(p => p.id === id);
  if (!partner) return;

  editingPartnerId = id;
  document.getElementById("name").value = currentUserName;
  currentProfilePictureUrl = partner.picture || null;
  setPicturePreview(currentProfilePictureUrl);
  document.getElementById("experience").value = partner.experience || "";
  document.getElementById("availability").value = partner.availability || "";
  document.getElementById("subjects").value = (partner.subjects || []).join(", ");
  document.getElementById("skills").value = (partner.skills || []).join(", ");
  document.getElementById("bio").value = partner.intro || "";

  submitBtn.innerHTML = '<i class="fa-solid fa-pen icon-left"></i> Update Profile';

  if (!addProfileForm.classList.contains("active")) {
    addProfileForm.classList.add("active");
    toggleFormBtn.innerHTML = '<i class="fa-solid fa-xmark icon-left"></i> Close Form';
    if (typeof animateFormToggle === "function") {
      animateFormToggle(true);
    }
  }

  addProfileForm.scrollIntoView({ behavior: "smooth", block: "start" });
};

// Delete: remove the current user's own profile
window.deletePartnerProfile = async function (id) {
  const confirmed = await confirmAction(
    "Are you sure?",
    "This will permanently delete your study partner profile.",
    "Yes, delete it"
  );
  if (!confirmed) return;

  const { error } = await supabaseClient
    .from("study_partners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete partner error:", error);
    notifyError("Failed!", "Failed to delete profile: " + error.message);
    return;
  }

  notifySuccess("Deleted!", "Your study partner profile has been removed.");
  fetchPartners();
};

// Send Request: notify a study partner that this user wants to connect
window.sendPartnerRequest = async function (partnerId, receiverId) {
  if (!currentUserId) {
    notifyInfo("Login Required", "Please log in to send a study partner request.");
    return;
  }
  if (receiverId === currentUserId) {
    return; // safety guard, shouldn't happen since button is hidden on own card
  }
  if (sentRequestPartnerIds.has(String(partnerId))) {
    return; // already requested
  }

  try {
    const { error } = await supabaseClient
      .from("study_partner_requests")
      .insert([
        {
          sender_id: currentUserId,
          receiver_id: receiverId,
          partner_id: partnerId,
          status: "pending"
        }
      ]);

    if (error) {
      console.error("Send request error:", error);
      notifyError("Failed!", "Failed to send request: " + error.message);
      return;
    }

    // Best-effort notification for the receiver — if this fails, the
    // request itself has still gone through, so we don't alert on it.
    try {
      await supabaseClient.from("notifications").insert([
        {
          user_id: receiverId,
          type: "study_request",
          text: `<b>${currentUserName}</b> sent you a study partner request.`,
          is_read: false
        }
      ]);
    } catch (notifErr) {
      console.error("Request notification error:", notifErr);
    }

    sentRequestPartnerIds.add(String(partnerId));
    filterPartners();
    notifySuccess("Request Sent!", "They'll be notified and can accept it from their dashboard.");
  } catch (err) {
    console.error("Send request exception:", err);
    notifyError("Something Went Wrong", "Could not send the request. Please try again.");
  }
};

// Helper: Know which logged-in user is viewing, so we can show
// Edit/Delete controls only on that user's own profile card.
async function loadCurrentUser() {
  try {
    const { data } = await supabaseClient.auth.getUser();
    currentUserId = data?.user?.id || null;
    currentUserName = data?.user?.user_metadata?.full_name || "A student";
    currentUserAvatarUrl = data?.user?.user_metadata?.avatar_url || null;

    const nameInput = document.getElementById("name");
    if (nameInput) {
      nameInput.value = currentUserName;
    }
  } catch (err) {
    console.error("Error loading current user:", err);
  }
}

// Helper: Load the set of partner profile IDs this user already sent
// a study request to, so we can show "Request Sent" instead of the
// button again (avoids duplicate requests).
async function loadSentRequests() {
  if (!currentUserId) return;
  try {
    const { data, error } = await supabaseClient
      .from("study_partner_requests")
      .select("partner_id")
      .eq("sender_id", currentUserId);

    if (error) {
      console.error("Error loading sent requests:", error);
      return;
    }

    sentRequestPartnerIds = new Set((data || []).map(r => String(r.partner_id)));
  } catch (err) {
    console.error("Sent requests exception:", err);
  }
}

// Fetch Data from Supabase
async function fetchPartners() {
  partnersContainer.innerHTML = `
    <div class="no-results card-box">
      <i class="fa-solid fa-spinner fa-spin no-results-icon"></i>
      <p>Loading study partners...</p>
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
        <i class="fa-solid fa-triangle-exclamation no-results-icon"></i>
        <p>Failed to load profiles. Please check Supabase configuration.</p>
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
        <i class="fa-solid fa-user-group no-results-icon"></i>
        <p>No study partners found matching your criteria.</p>
      </div>
    `;
    return;
  }

  data.forEach(partner => {
    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.name || "S")}&background=124B57&color=8CE5ED`;
    const subjectsList = partner.subjects || [];
    const skillsList = partner.skills || [];
    const isOwner = currentUserId && partner.user_id && String(partner.user_id).trim() === String(currentUserId).trim();

    let requestButton = "";
    if (!isOwner && partner.user_id) {
      const alreadyRequested = sentRequestPartnerIds.has(String(partner.id));
      requestButton = alreadyRequested
        ? `<button class="btn-request btn-request-sent" disabled>
             <i class="fa-solid fa-check icon-left"></i> Request Sent
           </button>`
        : `<button class="btn-request" onclick="sendPartnerRequest(${partner.id}, '${partner.user_id}')">
             <i class="fa-solid fa-paper-plane icon-left"></i> Send Request
           </button>`;
    }

    const ownerActions = isOwner ? `
      <div class="card-owner-actions">
        <button class="btn-icon" onclick="editPartnerProfile(${partner.id})" title="Edit your profile">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn-icon btn-icon-danger" onclick="deletePartnerProfile(${partner.id})" title="Delete your profile">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    ` : "";

    const card = document.createElement("div");
    card.className = "partner-card";
    card.innerHTML = `
      ${ownerActions}
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
            <span class="badge-level level-${(partner.experience || "").toLowerCase()}">${partner.experience}</span>
          </div>
        </div>

        <p class="bio">${partner.intro || ""}</p>

        <div class="detail-section">
          <div class="detail-label">Subjects</div>
          <div class="tags-container">
            ${subjectsList.map(s => `<span class="tag">${s.trim()}</span>`).join("")}
          </div>
        </div>

        <div class="detail-section">
          <div class="detail-label">Skills</div>
          <div class="tags-container">
            ${skillsList.map(s => `<span class="tag skill">${s.trim()}</span>`).join("")}
          </div>
        </div>
      </div>

      <div class="card-footer">
        <div class="availability">
          <i class="fa-regular fa-clock"></i> <span>${partner.availability || ""}</span>
        </div>
        ${requestButton}
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
    const subjectsList = partner.subjects || [];
    const skillsList = partner.skills || [];

    const matchesSubject = !subjectQuery || subjectsList.some(s => s.toLowerCase().includes(subjectQuery));
    const matchesSkill = !skillQuery || skillsList.some(s => s.toLowerCase().includes(skillQuery));
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
  submitBtn.innerHTML = editingPartnerId
    ? '<i class="fa-solid fa-spinner fa-spin icon-left"></i> Updating...'
    : '<i class="fa-solid fa-spinner fa-spin icon-left"></i> Publishing...';

  // If a new photo file was chosen, upload it to Supabase Storage first
  // and use the resulting public URL. Otherwise keep whatever picture
  // was already resolved (account avatar on create, existing photo on edit).
  const chosenFile = pictureInput?.files?.[0];
  let resolvedPictureUrl = currentProfilePictureUrl;

  if (chosenFile) {
    const fileExt = chosenFile.name.split(".").pop();
    const filePath = `${currentUserId}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabaseClient.storage
      .from("study-partner-profile-photos")
      .upload(filePath, chosenFile, { upsert: true });

    if (uploadError) {
      console.error("Picture upload error:", uploadError);
      notifyError("Upload Failed", "Failed to upload picture: " + uploadError.message);
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane icon-left"></i> Publish Profile';
      return;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from("study-partner-profile-photos")
      .getPublicUrl(filePath);
    resolvedPictureUrl = publicUrlData.publicUrl;
  }

  const partnerPayload = {
    name: currentUserName,
    picture: resolvedPictureUrl,
    experience: document.getElementById("experience").value,
    availability: document.getElementById("availability").value.trim(),
    subjects: document.getElementById("subjects").value.split(",").map(s => s.trim()).filter(Boolean),
    skills: document.getElementById("skills").value.split(",").map(s => s.trim()).filter(Boolean),
    intro: document.getElementById("bio").value.trim()
  };

  let error;

  if (editingPartnerId) {
    partnerPayload.user_id = currentUserId; // re-attach ownership in case it was missing
    ({ error } = await supabaseClient
      .from("study_partners")
      .update(partnerPayload)
      .eq("id", editingPartnerId));
  } else {
    partnerPayload.user_id = currentUserId;
    ({ error } = await supabaseClient
      .from("study_partners")
      .insert([partnerPayload]));
  }

  submitBtn.disabled = false;
  submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane icon-left"></i> Publish Profile';

  if (error) {
    console.error("Error saving profile:", error);
    notifyError("Failed!", "Error saving profile: " + error.message);
    return;
  }

  const wasEditing = !!editingPartnerId;

  profileForm.reset();
  document.getElementById("name").value = currentUserName;
  currentProfilePictureUrl = null;
  setPicturePreview(null);
  editingPartnerId = null;
  if (typeof animateFormToggle === "function") {
    animateFormToggle(false);
  }
  addProfileForm.classList.remove("active");
  toggleFormBtn.innerHTML = '<i class="fa-solid fa-user-plus icon-left"></i> Add My Profile';

  // Reset any active filters so the newly saved profile is guaranteed
  // to be visible right away, even if a search/filter was active that
  // would otherwise hide it.
  filterSubject.value = "";
  filterSkill.value = "";
  filterLevel.value = "";

  fetchPartners();
  notifySuccess(
    wasEditing ? "Profile Updated!" : "Profile Published!",
    wasEditing ? "Your study partner profile has been updated." : "Your study partner profile is now live."
  );
});


(async function init() {
  await loadCurrentUser();
  await loadSentRequests();
  fetchPartners();
})();