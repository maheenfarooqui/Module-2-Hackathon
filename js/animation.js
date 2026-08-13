document.addEventListener("DOMContentLoaded", () => {

  gsap.registerPlugin(TextPlugin, ScrollTrigger);

  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  tl.from("#authHeader, #authLogo", {
    yPercent: -100,
    duration: 0.8,
  })})