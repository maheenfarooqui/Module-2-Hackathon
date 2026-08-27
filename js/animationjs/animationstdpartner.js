// Register ScrollTrigger Plugin
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  initTypewriterHeading();
  initInitialAnimations();
  initHoverAnimations();
  initCardTiltEffect();
});

/* ----------------------------------------------------------
   0. TYPEWRITER HEADING
   Types the hero heading out character by character with a
   blinking cursor, instead of just fading the whole line in.
   ---------------------------------------------------------- */
function initTypewriterHeading() {
  const heading = document.querySelector(".header-anim h1");
  if (!heading) return;

  const fullText = heading.textContent.trim();
  heading.textContent = "";
  heading.classList.add("typewriter-active");

  const typeSpeed = 45; // ms per character
  let i = 0;

  function typeNext() {
    heading.textContent = fullText.slice(0, i);
    i++;
    if (i <= fullText.length) {
      setTimeout(typeNext, typeSpeed);
    } else {
      // Let the cursor blink a couple more times, then remove it
      setTimeout(() => heading.classList.remove("typewriter-active"), 1200);
    }
  }

  typeNext();
}

/* ----------------------------------------------------------
   1. INITIAL PAGE LOAD ANIMATIONS
   The heading types itself out (above); everything else still
   rises/sweeps in on a refined choreography.
   ---------------------------------------------------------- */
function initInitialAnimations() {
  const tl = gsap.timeline({ defaults: { ease: "power4.out" }, delay: 0.2 });

  tl.from(".header-anim p", {
    y: -24,
    opacity: 0,
    duration: 0.7
  })
    .from(".filter-card-anim", {
      x: -60,
      opacity: 0,
      rotateZ: -1.2,
      duration: 0.8
    }, "-=0.25")
    .from(".action-card-anim", {
      x: 60,
      opacity: 0,
      rotateZ: 1.2,
      duration: 0.8
    }, "-=0.7")
    .from(".action-card-icon", {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      ease: "back.out(2.4)"
    }, "-=0.35");
}

/* ----------------------------------------------------------
   2. CARDS GRID — SCROLL-AWARE STAGGER ENTRANCE
   Called every time the partner list re-renders (initial
   load, search/filter, publish, edit, delete). Cards already
   in view animate in immediately; anything further down the
   page reveals itself as the person scrolls to it.
   ---------------------------------------------------------- */
let cardScrollTriggers = [];

function animatePartnerCards() {
  const cards = document.querySelectorAll(".partner-card");
  if (cards.length === 0) return;

  // Clean up triggers/tweens from the previous render — the old
  // card elements no longer exist once the grid re-renders, and
  // stale ScrollTriggers left pointing at removed nodes would
  // otherwise pile up on every search/filter/publish.
  cardScrollTriggers.forEach((st) => st.kill());
  cardScrollTriggers = [];
  gsap.killTweensOf(cards);

  gsap.set(cards, { y: 45, opacity: 0, scale: 0.94 });

  const batchTriggers = ScrollTrigger.batch(cards, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => {
      gsap.to(batch, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.6,
        stagger: 0.08,
        ease: "power3.out",
        clearProps: "transform,opacity",
        overwrite: true
      });
    }
  });

  cardScrollTriggers = batchTriggers;

  // Recalculate trigger positions now that the DOM has changed
  ScrollTrigger.refresh();
}

/* ----------------------------------------------------------
   3. PARTNER CARD MOUSE-TILT INTERACTION
   A subtle 3D tilt + lift that follows the cursor, delegated
   on the grid container so it keeps working after every
   re-render without needing to re-bind listeners per card.
   ---------------------------------------------------------- */
let currentTiltCard = null;

function initCardTiltEffect() {
  const container = document.getElementById("partnersContainer");
  if (!container) return;

  container.addEventListener("mousemove", (e) => {
    const card = e.target.closest(".partner-card");
    if (!card) return;

    if (currentTiltCard && currentTiltCard !== card) {
      resetCardTilt(currentTiltCard);
    }
    currentTiltCard = card;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -5;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 5;

    gsap.to(card, {
      y: -6,
      rotateX,
      rotateY,
      transformPerspective: 700,
      duration: 0.4,
      ease: "power2.out"
    });
  });

  container.addEventListener("mouseleave", () => {
    if (currentTiltCard) {
      resetCardTilt(currentTiltCard);
      currentTiltCard = null;
    }
  });
}

function resetCardTilt(card) {
  gsap.to(card, {
    y: 0,
    rotateX: 0,
    rotateY: 0,
    duration: 0.5,
    ease: "power2.out"
  });
}

/* ----------------------------------------------------------
   4. COLLAPSIBLE FORM
   Smoother open/close with a subtle scale for a softer, more
   physical feel, plus the existing staggered field reveal.
   ---------------------------------------------------------- */
function animateFormToggle(isOpen) {
  const form = document.getElementById("addProfileForm");
  if (!form) return;

  if (isOpen) {
    gsap.set(form, {
      display: "block",
      opacity: 0,
      height: 0,
      scale: 0.98,
      transformOrigin: "top center"
    });
    gsap.to(form, {
      height: "auto",
      opacity: 1,
      scale: 1,
      duration: 0.55,
      ease: "power3.out",
      onComplete: () => {
        gsap.from("#profileForm .form-group", {
          y: 18,
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
      scale: 0.98,
      duration: 0.35,
      ease: "power3.in",
      onComplete: () => {
        gsap.set(form, { display: "none" });
      }
    });
  }
}

/* ----------------------------------------------------------
   5. BUTTON INTERACTIONS
   Hover lift plus a quick tactile press-down/release, so
   buttons feel more physical and responsive to click.
   ---------------------------------------------------------- */
function initHoverAnimations() {
  document.querySelectorAll(".btn").forEach((btn) => {
    btn.addEventListener("mouseenter", () => {
      gsap.to(btn, { scale: 1.03, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mouseleave", () => {
      gsap.to(btn, { scale: 1, duration: 0.2, ease: "power1.out" });
    });
    btn.addEventListener("mousedown", () => {
      gsap.to(btn, { scale: 0.97, duration: 0.1, ease: "power1.out" });
    });
    btn.addEventListener("mouseup", () => {
      gsap.to(btn, { scale: 1.03, duration: 0.15, ease: "power1.out" });
    });
  });
}