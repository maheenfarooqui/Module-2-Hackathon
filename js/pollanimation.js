// GSAP Animations for Polls
function animatePollCards() {
  gsap.from(".poll-card", {
    duration: 0.6,
    y: 30,
    opacity: 0,
    stagger: 0.15,
    ease: "power2.out"
  });
}

function animateModalOpen() {
  gsap.from("#createPollModal .modal-content", {
    duration: 0.4,
    scale: 0.7,
    opacity: 0,
    ease: "back.out(1.5)"
  });
}

function animateVoteProgress(element, percentage) {
  gsap.to(element, {
    width: percentage + "%",
    duration: 1,
    ease: "power2.out"
  });
}