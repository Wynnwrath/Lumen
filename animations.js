// ReactBits-inspired Animation & Micro-Interaction Engine for Lumen

document.addEventListener("DOMContentLoaded", () => {
  initReactBitsAnimations();
});

function initReactBitsAnimations() {
  initSpotlightCards();
  initBlurTextReveals();
}

/**
 * 1. Spotlight Cards Mouse Tracker
 * Tracks cursor position relative to cards and sets CSS custom properties
 */
function initSpotlightCards() {
  const cards = document.querySelectorAll(".spotlight-card, .product-card, .category-card");
  cards.forEach((card) => {
    if (!card.hasAttribute("data-spotlight-attached")) {
      card.setAttribute("data-spotlight-attached", "true");
      card.classList.add("spotlight-card");
      
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    }
  });
}

/**
 * 2. Blur Text & Staggered Scroll Reveals
 */
function initBlurTextReveals() {
  const reveals = document.querySelectorAll(".blur-text-reveal, [data-reveal]");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.1 }
  );

  reveals.forEach((el) => {
    if (!el.classList.contains("blur-text-reveal") && !el.classList.contains("reveal")) {
      el.classList.add("blur-text-reveal");
    }
    observer.observe(el);
  });
}

// Global hook to refresh animations on dynamic content updates (e.g., after product rendering)
window.refreshLumenAnimations = function () {
  initSpotlightCards();
  initBlurTextReveals();
};
