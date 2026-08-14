//   for dashboard

// 1. Container aur settings configure karien
const container = document.getElementById("particle-container");
const numParticles = 50; // Kitne particles chaye

// 2. Loop chala kr particles create karien
for (let i = 0; i < numParticles; i++) {
  createParticle();
}

function createParticle() {
  // A. Element create karien
  const particle = document.createElement("div");
  particle.className = "particle";
  container.appendChild(particle);

  // B. Random size set karien (small)
  const size = Math.random() * 2 + 2; // 2px se 7px tak

  // C. Initial position random set karien (screen ke bahr ya edge par)
  gsap.set(particle, {
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    width: size,
    height: size,
    opacity: Math.random() * 0.5 + 0.2, // Random dhundla-pan
  });

  // D. GSAP Animation apply karien (Slow floating movement)
  animateParticle(particle);
}

function animateParticle(particle) {
  // GSAP se random movement create karien
  gsap.to(particle, {
    // Random destination position
    x: `+=${Math.random() * 200 - 100}`, // -100px se +100px tak movement
    y: `+=${Math.random() * 200 - 100}`,

    // Random animation duration (slow)
    duration: Math.random() * 10 + 5, // 5s se 15s tak

    // Linear ease taake movement constant rhe
    ease: "none",

    // Jab animation khtm ho, dobara start karo new random values ke sath
    onComplete: () => animateParticle(particle),
  });

  // Fade in/out animation alag se taake wo chamakte hue lagein
  gsap.to(particle, {
    opacity: Math.random() * 0.8 + 0.1,
    duration: Math.random() * 2 + 1,
    repeat: -1, // Infinite loop
    yoyo: true, // Fade in phir fade out
    ease: "sine.inOut",
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // GSAP TextPlugin register karein
  gsap.registerPlugin(TextPlugin);

  // Jo words aap display karwana chahte hain
  const words = [
    "AI Word Navigator",
    "Smart Reading Assistant",
    "Next-Gen AI Interface"
  ];

  // Master Timeline banayein
  const masterTl = gsap.timeline({ repeat: -1 }); // -1 means Infinite Loop

  words.forEach((word) => {
    // Har word ke liye sub-timeline
    let tl = gsap.timeline({ repeat: 1, yoyo: true, repeatDelay: 1.5 });
    
    tl.to("#text", {
      duration: word.length * 0.1, // Word length ke hisab se typing speed
      text: word,
      ease: "none"
    });

    masterTl.add(tl);
  });
});
