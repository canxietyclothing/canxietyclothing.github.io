"use strict";

const SITE_CONFIG = Object.freeze({
  founderEmail: "hello@canxiety.co.uk",
  checkoutLinks: Object.freeze({
    hoodie: "YOUR_STRIPE_PAYMENT_LINK_HERE",
    tee: "YOUR_SHOPIFY_PRODUCT_LINK_HERE",
    bundle: "YOUR_PAYPAL_CHECKOUT_LINK_HERE",
    founderPass: "YOUR_STRIPE_FOUNDER_PASS_LINK_HERE"
  })
});

const isLiveCheckoutLink = (value) => {
  if (typeof value !== "string" || !value.startsWith("https://")) return false;
  return !value.includes("YOUR_") && !value.includes("_HERE");
};

const buildFounderMailto = ({ name, email, size, item }) => {
  const subject = "CANxiety Founder List Request";
  const body = [
    "Hello CANxiety Clothing,",
    "",
    "I would like to join the Founder Drop list.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Preferred size: ${size}`,
    `Favourite item: ${item}`,
    "",
    "I consent to receiving CANxiety pre-drop and launch updates."
  ].join("\n");

  return `mailto:${SITE_CONFIG.founderEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

window.CANXIETY_SITE = Object.freeze({ SITE_CONFIG, isLiveCheckoutLink, buildFounderMailto });

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const mobileMenu = document.querySelector("#mobile-menu");
const menuBackgroundTargets = document.querySelectorAll("main, .site-footer, .mobile-cta");
const year = document.querySelector("[data-year]");
const founderForm = document.querySelector("#founder-form");
const founderItem = document.querySelector("#founder-item");
const toast = document.querySelector("#reservation-toast");
const toastClose = toast?.querySelector("button");
let toastTimer;

const setMenuOpen = (open, returnFocus = false) => {
  if (!menuToggle || !mobileMenu) return;
  menuToggle.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
  mobileMenu.classList.toggle("is-open", open);
  mobileMenu.inert = !open;
  document.body.classList.toggle("menu-open", open);
  menuBackgroundTargets.forEach((target) => {
    target.inert = open;
    if (open) target.setAttribute("aria-hidden", "true");
    else target.removeAttribute("aria-hidden");
  });
  if (returnFocus) menuToggle.focus();
};

if (mobileMenu) mobileMenu.inert = true;

menuToggle?.addEventListener("click", () => {
  setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (menuToggle?.getAttribute("aria-expanded") !== "true") return;

  if (event.key === "Escape") {
    setMenuOpen(false, true);
    return;
  }

  if (event.key !== "Tab" || !mobileMenu) return;
  const focusable = [menuToggle, ...mobileMenu.querySelectorAll("a")];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

const desktopMenuQuery = window.matchMedia("(min-width: 50.01rem)");
const closeMenuOnDesktop = (event) => {
  if (event.matches) setMenuOpen(false);
};

if (typeof desktopMenuQuery.addEventListener === "function") {
  desktopMenuQuery.addEventListener("change", closeMenuOnDesktop);
} else {
  desktopMenuQuery.addListener(closeMenuOnDesktop);
}

if (year) year.textContent = String(new Date().getFullYear());

const updateHeader = () => {
  header?.classList.toggle("is-compact", window.scrollY > 24);
};

updateHeader();
window.addEventListener("scroll", updateHeader, { passive: true });

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");
let revealObserver;

const revealVisibleItems = () => {
  revealItems.forEach((item) => {
    const bounds = item.getBoundingClientRect();
    if (bounds.top < window.innerHeight * 1.08 && bounds.bottom > -48) {
      item.classList.add("is-visible");
      revealObserver?.unobserve(item);
    }
  });
};

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
  window.requestAnimationFrame(revealVisibleItems);
  window.setTimeout(revealVisibleItems, 160);
  window.addEventListener("hashchange", () => window.setTimeout(revealVisibleItems, 120));
  window.addEventListener("pageshow", () => window.setTimeout(revealVisibleItems, 120));
}

const showToast = () => {
  if (!toast) return;
  window.clearTimeout(toastTimer);
  toast.classList.add("is-visible");
  toast.setAttribute("aria-hidden", "false");
  toastTimer = window.setTimeout(() => {
    toast.classList.remove("is-visible");
    toast.setAttribute("aria-hidden", "true");
  }, 6000);
};

toastClose?.addEventListener("click", () => {
  window.clearTimeout(toastTimer);
  toast.classList.remove("is-visible");
  toast.setAttribute("aria-hidden", "true");
});

document.querySelectorAll(".reserve-button").forEach((button) => {
  button.addEventListener("click", () => {
    const checkoutKey = button.dataset.checkout;
    const checkoutUrl = SITE_CONFIG.checkoutLinks[checkoutKey];

    if (isLiveCheckoutLink(checkoutUrl)) {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const productCard = button.closest("[data-product-card]");
    const size = productCard?.querySelector("[data-size]")?.value;
    const product = button.dataset.product || "CANxiety first drop";

    if (founderItem) founderItem.value = product;

    const founderSize = document.querySelector("#founder-size");
    if (founderSize && size && [...founderSize.options].some((option) => option.value === size)) {
      founderSize.value = size;
    }

    showToast();
    document.querySelector("#founder")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  });
});

founderForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!founderForm.checkValidity()) {
    founderForm.reportValidity();
    return;
  }

  const data = new FormData(founderForm);
  const mailto = buildFounderMailto({
    name: String(data.get("name") || ""),
    email: String(data.get("email") || ""),
    size: String(data.get("preferred-size") || ""),
    item: String(data.get("favourite-item") || "")
  });

  const status = document.querySelector("#form-status");
  if (status) status.textContent = "Your email app is opening. Send the prepared message to complete your founder request.";

  window.setTimeout(() => {
    window.location.href = mailto;
  }, 100);
});
