function animateBellRing() {
  gsap.to("#bellIcon", {
    rotation: 15,
    duration: 0.1,
    yoyo: true,
    repeat: 5,
    ease: "power1.inOut",
    onComplete: () => gsap.to("#bellIcon", { rotation: 0 })
  });
}

function animateDropdownOpen() {
  gsap.to("#notifDropdown", {
    duration: 0.3,
    opacity: 1,
    y: 5,
    ease: "power2.out"
  });
}