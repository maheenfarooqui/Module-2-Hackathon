// Supabase Setup
const SUPABASE_URL = "https://dpheuwopfkpdynfgjthm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_dOaRFmzPIgKgPV5pZDfq0w_vL3GxXdO";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// Toggle Form Visibility
toggleFormBtn.addEventListener("click", () => {
  addProfileForm.classList.toggle("active");
  toggleFormBtn.textContent = addProfileForm.classList.contains("active") 
    ? "Close Form" 
    : "Add My Profile";
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
}

// Search & Filter Functionality
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

// Insert Profile into Supabase Database
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

  // Refresh list and reset form
  profileForm.reset();
  addProfileForm.classList.remove("active");
  toggleFormBtn.textContent = "Add My Profile";
  fetchPartners();
});

// Load profiles on startup
fetchPartners();