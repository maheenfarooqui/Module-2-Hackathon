/* ==========================================================
   GSAP & SCROLLTRIGGER ANIMATIONS FOR CAMPUS CONNECT
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Register ScrollTrigger Plugin
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    initHeroAnimations();
    initScrollTriggers();
  }
});

/* ----------------------------------------------------------
   1. HERO SECTION ENTRY ANIMATION
   ---------------------------------------------------------- */
function initHeroAnimations() {
  var heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });

  heroTimeline
    .from(".hero-heading", {
      y: 40,
      opacity: 0,
      duration: 0.9
    })
    .from(".hero-subtext", {
      y: 25,
      opacity: 0,
      duration: 0.8
    }, "-=0.6")
    .from(".hero-action-btn", {
      scale: 0.85,
      opacity: 0,
      duration: 0.6,
      ease: "back.out(1.7)"
    }, "-=0.5");
}

/* ----------------------------------------------------------
   2. SCROLLTRIGGER PARALLAX & REVEALS
   ---------------------------------------------------------- */
function initScrollTriggers() {
  // Sticky/Floating Filter Bar Reveal
  if (document.querySelector(".filter-section")) {
    gsap.from(".filter-section", {
      scrollTrigger: {
        trigger: ".filter-section",
        start: "top 88%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  }

  // Section Header Scroll Reveal
  var sectionTitle = document.querySelector(".section-title");
  if (sectionTitle) {
    gsap.from(sectionTitle, {
      scrollTrigger: {
        trigger: sectionTitle,
        start: "top 85%",
        toggleActions: "play none none reverse"
      },
      y: 30,
      opacity: 0,
      duration: 0.7,
      ease: "power2.out"
    });
  }
}

/* ----------------------------------------------------------
   3. CARDS STAGGER ENTRANCE (Triggered on Dynamic Render)
   ---------------------------------------------------------- */
function animateCards() {
  if (typeof gsap === "undefined") return;

  var cards = document.querySelectorAll(".event-card");
  if (cards.length === 0) return;

  // Clear previous animations if re-rendering
  gsap.killTweensOf(cards);

  gsap.fromTo(
    cards,
    {
      y: 50,
      opacity: 0,
      scale: 0.96
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: 0.55,
      stagger: 0.08,
      ease: "power2.out",
      clearProps: "transform,opacity"
    }
  );
}

/* ----------------------------------------------------------
   4. MODAL ANIMATIONS
   ---------------------------------------------------------- */
function animateModalOpen() {
  if (typeof gsap === "undefined") return;

  var modalOverlay = document.querySelector(".modal-overlay");
  var modalContainer = document.querySelector(".modal-container");

  if (!modalContainer || !modalOverlay) return;

  gsap.fromTo(
    modalOverlay,
    { opacity: 0 },
    { opacity: 1, duration: 0.3, ease: "power1.out" }
  );

  gsap.fromTo(
    modalContainer,
    { y: -40, scale: 0.9, opacity: 0 },
    { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.5)" }
  );
}

function animateModalClose(callback) {
  if (typeof gsap === "undefined") {
    if (callback) callback();
    return;
  }

  var modalOverlay = document.querySelector(".modal-overlay");
  var modalContainer = document.querySelector(".modal-container");

  if (!modalContainer || !modalOverlay) {
    if (callback) callback();
    return;
  }

  gsap.to(modalContainer, {
    y: -30,
    scale: 0.9,
    opacity: 0,
    duration: 0.25,
    ease: "power2.in"
  });

  gsap.to(modalOverlay, {
    opacity: 0,
    duration: 0.25,
    delay: 0.05,
    ease: "power1.in",
    onComplete: function () {
      if (callback) callback();
    }
  });
}