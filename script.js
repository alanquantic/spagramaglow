function trackEvent(name, params) {
  if (typeof window.gtag === "function") {
    window.gtag("event", name, params || {});
  }
}

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

    const summary = detail.querySelector("summary");
    trackEvent("faq_open", {
      question: summary ? summary.textContent.trim() : "",
    });
  });
});

document.querySelectorAll('a[href="#comprar"]').forEach((link) => {
  link.addEventListener("click", () => {
    let location = "otros";
    if (link.classList.contains("header-cta")) {
      location = "header";
    } else if (link.closest(".hero-actions")) {
      location = "hero";
    }

    trackEvent("cta_comprar_click", { cta_location: location });
  });
});

document.querySelectorAll(".site-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    trackEvent("nav_click", {
      nav_target: link.getAttribute("href"),
      nav_label: link.textContent.trim(),
    });
  });
});

const buySection = document.querySelector("#comprar");

if (buySection) {
  const buyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          trackEvent("view_item", {
            currency: "MXN",
            value: 999,
            items: [
              {
                item_id: "glowage-150ml",
                item_name: "GlowAge 150 ml",
                item_brand: "SPAGRAMA",
                price: 999,
                quantity: 1,
              },
            ],
          });
          buyObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  buyObserver.observe(buySection);
}

const quantitySelect = document.querySelector("#checkout-quantity");

if (quantitySelect) {
  quantitySelect.addEventListener("change", () => {
    trackEvent("select_quantity", {
      quantity: Number(quantitySelect.value),
    });
  });
}

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

    trackEvent("begin_checkout", {
      currency: "MXN",
      value: quantity * 999,
      items: [
        {
          item_id: "glowage-150ml",
          item_name: "GlowAge 150 ml",
          item_brand: "SPAGRAMA",
          price: 999,
          quantity,
        },
      ],
    });

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
      trackEvent("checkout_error", { error_message: error.message || "unknown" });
      checkoutButton.disabled = false;
      checkoutButton.textContent = "Comprar con Stripe";
      checkoutStatus.textContent =
        "No pudimos abrir el pago en este momento. Intenta de nuevo en unos segundos.";
    }
  });
}
