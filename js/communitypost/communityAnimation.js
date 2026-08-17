// =========================================================
// animation.js — GSAP animations only.
// No Supabase / app logic lives here.
// =========================================================

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

// ---------------- "Post Now" button — border draw on hover ----------------
function initButtonHoverLine() {
  const btn = document.getElementById("upBtn");
  if (!btn) return;
  const hlLine = btn.querySelector(".hl-line");
  if (!hlLine) return;

  btn.addEventListener("mouseenter", () => {
    gsap.to(hlLine, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: "power2.out",
    });
    gsap.to(btn, { scale: 1.02, duration: 0.3 });
  });

  btn.addEventListener("mouseleave", () => {
    gsap.to(hlLine, {
      strokeDashoffset: 480,
      duration: 0.6,
      ease: "power2.in",
    });
    gsap.to(btn, { scale: 1, duration: 0.3 });
  });
}

// ---------------- Scroll-direction arrow flip ----------------
function initScrollArrow() {
  window.addEventListener("wheel", function (e) {
    if (e.deltaY > 0) {
      gsap.to("#arrow", { rotate: 180, duration: 0.3, ease: "power1.out" });
    } else if (e.deltaY < 0) {
      gsap.to("#arrow", { rotate: 0, duration: 0.3, ease: "power1.out" });
    }
  });
}

// ---------------- Page load — subtle nav + form entrance ----------------
function initPageIntro() {
  const nav = document.querySelector(".navbar");
  const formCard = document.querySelector(".postCard");

  if (nav) {
    gsap.from(nav, { y: -16, opacity: 0, duration: 0.5, ease: "power2.out" });
  }
  if (formCard) {
    gsap.from(formCard, {
      y: 14,
      opacity: 0,
      duration: 0.5,
      delay: 0.1,
      ease: "power2.out",
    });
  }
}

// ---------------- Profile dropdown — fade + scale on open ----------------
function initDropdownAnimation() {
  const dropdownWrap = document.getElementById("iconAnim");
  if (!dropdownWrap) return;
  const menu = dropdownWrap.querySelector(".dropdown-menu");
  if (!menu) return;

  dropdownWrap.addEventListener("show.bs.dropdown", () => {
    gsap.fromTo(
      menu,
      { opacity: 0, y: -6, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" },
    );
  });
}

// ---------------- "Post Now" button — press feedback on click ----------------
function initButtonTapFeedback() {
  const btn = document.getElementById("upBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    gsap.fromTo(
      btn,
      { scale: 0.97 },
      { scale: 1, duration: 0.25, ease: "power2.out" },
    );
  });
}

// ---------------- Comment box — smooth open/close ----------------
// app.js calls this (window.animateCommentBox) instead of an instant d-none toggle
window.animateCommentBox = function (el, opening, onComplete) {
  if (opening) {
    gsap.fromTo(
      el,
      { opacity: 0, y: -8 },
      { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
    );
  } else {
    gsap.to(el, {
      opacity: 0,
      y: -8,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => {
        if (onComplete) onComplete();
        gsap.set(el, { opacity: 1, y: 0 });
      },
    });
  }
};

// ---------------- Image upload preview — fade + scale in ----------------
// app.js calls this (window.animateImagePreview) when a new preview image loads
window.animateImagePreview = function (el) {
  gsap.fromTo(
    el,
    { opacity: 0, scale: 0.95 },
    { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
  );
};

// ---------------- Feed cards — scroll-in entrance ----------------
// app.js calls this (window.animateFeedCards) after every renderPosts()
window.animateFeedCards = function () {
  gsap.utils.toArray(".cardWraper").forEach((card) => {
    gsap.from(card, {
      opacity: 0,
      y: 50,
      duration: 0.5,
      scrollTrigger: {
        trigger: card,
        start: "top 95%",
      },
    });
  });
};

// ---------------- Like button — pulse feedback ----------------
// app.js calls this (window.animateLike) on every like/unlike click
window.animateLike = function (btnEl, isLiking) {
  const icon = btnEl.querySelector("i");
  if (!icon) return;

  if (isLiking) {
    gsap.fromTo(
      icon,
      { scale: 1 },
      { scale: 1.5, duration: 0.15, yoyo: true, repeat: 1, ease: "power1.out" },
    );
  } else {
    gsap.fromTo(icon, { scale: 1.2 }, { scale: 1, duration: 0.2, ease: "power1.out" });
  }
};