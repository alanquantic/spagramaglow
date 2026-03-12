const revealItems = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: "0px 0px -6% 0px",
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

const detailItems = document.querySelectorAll(".faq-item");

detailItems.forEach((detail) => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) {
      return;
    }

    detailItems.forEach((other) => {
      if (other !== detail) {
        other.open = false;
      }
    });
  });
});
