// Simple 3D tilt effect for glass cards
function initTilt() {
  const tiltCards = document.querySelectorAll(".tilt-card");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!tiltCards.length || prefersReduced) return;

  const maxTilt = 10; // degrees

  tiltCards.forEach((card) => {
    card.dataset.tiltActive = "true";

    function handleMove(e) {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const dx = (x - centerX) / centerX;
      const dy = (y - centerY) / centerY;

      const tiltX = dy * -maxTilt;
      const tiltY = dx * maxTilt;

      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(4px)`;
    }

    function resetTilt() {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    }

    card.addEventListener("mousemove", handleMove);
    card.addEventListener("mouseleave", resetTilt);
  });
}

// Mobile nav toggle
function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    nav.classList.toggle("is-open");
  });

  nav.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
    }
  });
}

// Smooth scroll for internal links (extra polish)
function initSmoothAnchors() {
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.pageYOffset - (window.innerWidth < 720 ? 80 : 96);

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  });
}

// Footer year
function initYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initTilt();
  initNavToggle();
  initSmoothAnchors();
  initYear();
});

