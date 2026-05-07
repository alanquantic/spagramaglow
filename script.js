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

const checkoutForm = document.querySelector("[data-checkout-form]");

if (checkoutForm) {
  const checkoutButton = checkoutForm.querySelector(".checkout-button");
  const checkoutStatus = checkoutForm.querySelector("[data-checkout-status]");

  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(checkoutForm);
    const quantity = Number(formData.get("quantity") || 1);

    checkoutButton.disabled = true;
    checkoutButton.textContent = "Abriendo pago seguro...";
    checkoutStatus.textContent = "Estamos preparando tu sesión de pago.";

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || "No se pudo crear la sesión de pago.");
      }

      window.location.href = payload.url;
    } catch (error) {
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Comprar con Stripe";
      checkoutStatus.textContent =
        "No pudimos abrir el pago en este momento. Intenta de nuevo en unos segundos.";
    }
  });
}
