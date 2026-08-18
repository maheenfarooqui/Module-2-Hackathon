// Register ScrollTrigger Plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initInitialAnimations();
  initHoverAnimations();
});

// Initial Page Load Animations
function initInitialAnimations() {
  const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 1 } });

  // Header Animation
  tl.from(".header-anim h1", {
    y: -40,
    opacity: 0,
    duration: 0.8
  })
  .from(".header-anim p", {
    y: -20,
    opacity: 0,
    duration: 0.6
  }, "-=0.4")

  // Controls Wrapper Animation
  .from(".filter-card-anim", {
    x: -50,
    opacity: 0,
    duration: 0.8
  }, "-=0.3")
  .from(".action-card-anim", {
    x: 50,
    opacity: 0,
    duration: 0.8
  }, "-=0.8");
}

// Cards Grid Stagger Animation (Called by script.js after rendering)
function animatePartnerCards() {
  const cards = document.querySelectorAll(".partner-card");
  if (cards.length === 0) return;

  gsap.fromTo(cards, 
    {
      y: 40,
      opacity: 0,
      scale: 0.96
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.6,
      stagger: 0.1,
      ease: "power2.out"
    }
  );
}

// Collapsible Form GSAP Animation
function animateFormToggle(isOpen) {
  const form = document.getElementById("addProfileForm");

  if (isOpen) {
    gsap.set(form, { display: "block", opacity: 0, height: 0 });
    gsap.to(form, {
      height: "auto",
      opacity: 1,
      duration: 0.6,
      ease: "power3.out",
      onComplete: () => {
        gsap.from("#profileForm .form-group", {
          y: 20,
          opacity: 0,
          stagger: 0.05,
          duration: 0.4,
          ease: "power2.out"
        });
      }
    });
  } else {
    gsap.to(form, {
      height: 0,
      opacity: 0,
      duration: 0.4,
      ease: "power3.in",
      onComplete: () => {
        gsap.set(form, { display: "none" });
      }
    });
  }
}

// Button Hover Interactions
function initHoverAnimations() {
  document.querySelectorAll(".btn").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.03, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
    });
  });
}