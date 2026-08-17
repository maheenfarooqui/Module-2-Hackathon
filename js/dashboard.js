document.addEventListener("DOMContentLoaded", () => {
  const profileTrigger = document.getElementById("profileTrigger");
  const profileDropdown = document.getElementById("profileDropdown");
  const profilePicInput = document.getElementById("profilePicInput");
  const avatarInitials = document.getElementById("avatarInitials");
  const avatarImage = document.getElementById("avatarImage");
  const mobileToggle = document.getElementById("mobileToggle");
  const navMenu = document.getElementById("navMenu");
  const logoutBtn = document.getElementById("logoutBtn");

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
        color: "#ffffff"
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "index.html";
        }
      });
    });
  }
});