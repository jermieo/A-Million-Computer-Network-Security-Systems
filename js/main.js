/* A Million — shared site scripts */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initReveal();
  initContactForms();
  initServiceDetails();
  initHeroCarousel();
  initClickAssist();
  initYear();
});

function initHeroCarousel() {
  const el = document.getElementById("homeCarousel");
  if (!el || !window.bootstrap?.Carousel) return;

  const carousel = bootstrap.Carousel.getOrCreateInstance(el, {
    interval: false,
    pause: false,
    wrap: true,
    // Swipe capture often cancels button taps on mobile; dots + autoplay handle navigation
    touch: false,
    keyboard: true,
  });

  const syncIndicators = () => {
    const activeIdx = [...el.querySelectorAll(".carousel-item")].findIndex((item) =>
      item.classList.contains("active")
    );
    el.querySelectorAll(".hero-indicators button").forEach((btn, i) => {
      const on = i === activeIdx;
      btn.classList.toggle("active", on);
      btn.toggleAttribute("aria-current", on);
    });
  };

  el.addEventListener("slid.bs.carousel", syncIndicators);
  syncIndicators();

  // Custom interval — works on mobile and when OS reduced-motion disables Bootstrap ride
  const INTERVAL_MS = 5000;
  let timer = null;

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => {
      if (document.hidden) return;
      carousel.next();
    }, INTERVAL_MS);
  };

  start();
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  // Restart timer after swipe/manual control so autoplay continues
  el.addEventListener("slid.bs.carousel", start);
}

function initNavbar() {
  const nav = document.querySelector(".site-navbar");
  if (!nav) return;

  // Solid black navbar on all pages except home hero
  const isHome = Boolean(document.querySelector(".hero-slider"));
  if (!isHome) {
    nav.classList.add("nav-solid");
  }

  const onScroll = () => {
    if (isHome) {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    }
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Keep menu inside the navbar (body-mount broke desktop layout).
  // Close mobile side menu after navigation.
  document.querySelectorAll(".navbar-nav .nav-link, .nav-cta").forEach((link) => {
    link.addEventListener("click", () => {
      const open = document.querySelector(".nav-offcanvas.show");
      if (open && window.bootstrap) {
        bootstrap.Offcanvas.getInstance(open)?.hide();
      }
    });
  });
}

function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length || !("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el) => io.observe(el));
}

function initContactForms() {
  document.querySelectorAll("[data-contact-form]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      const original = btn?.textContent;
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Sending...";
      }

      setTimeout(() => {
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.textContent = original;
        }
        showToast("Thank you! We will contact you shortly.");
      }, 700);
    });
  });
}

function showToast(message) {
  let toast = document.querySelector(".am-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "am-toast";
    toast.style.cssText = `
      position: fixed; bottom: 24px; right: 24px; z-index: 2000;
      background: #0a0a0a; color: #fff; border: 1px solid rgba(255,255,255,.12);
      border-left: 4px solid #e4002b; padding: 14px 18px; border-radius: 12px;
      box-shadow: 0 16px 40px rgba(0,0,0,.35); max-width: min(320px, calc(100vw - 32px));
      transform: translateY(20px); opacity: 0; transition: all .3s ease;
      font-weight: 700;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
  }, 3200);
}

function initYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
}

/* Service details page content */
const SERVICES = {
  networking: {
    title: "Networking Solutions",
    eyebrow: "Structured Connectivity",
    image: "images/services/Networking.avif",
    intro:
      "We design, deploy, and maintain enterprise-grade network infrastructure that keeps your business connected, secure, and ready to scale.",
    points: [
      "LAN / WAN design and implementation",
      "Managed switches, routers, and wireless access points",
      "Fiber optic cabling and structured cabling",
      "Network security, VLAN segmentation, and monitoring",
      "Bandwidth optimization and performance audits",
    ],
    process: [
      "Site survey & requirement analysis",
      "Architecture & capacity planning",
      "Installation, configuration & testing",
      "Documentation, training & ongoing support",
    ],
  },
  cctv: {
    title: "CCTV & Biometric Systems",
    eyebrow: "Surveillance & Access",
    image: "images/services/CCTV & Biometric.avif",
    intro:
      "Protect people and property with intelligent video surveillance and biometric access control tailored to your premises.",
    points: [
      "HD / IP CCTV camera systems",
      "NVR / DVR setup with remote viewing",
      "Fingerprint, face, and card access control",
      "Attendance and visitor management",
      "Night vision, analytics, and motion alerts",
    ],
    process: [
      "Risk assessment & camera mapping",
      "Hardware selection & coverage design",
      "Installation, wiring & system integration",
      "App setup, training & maintenance plans",
    ],
  },
  "fire-alarm": {
    title: "Fire Alarm Systems",
    eyebrow: "Life Safety",
    image: "images/services/Fire Alarm Systems.jpg",
    intro:
      "Compliant fire detection and alarm solutions that give early warning and help you meet safety standards with confidence.",
    points: [
      "Conventional and addressable fire alarm systems",
      "Smoke, heat, and multi-sensor detectors",
      "Manual call points, sounders, and control panels",
      "Integration with building management systems",
      "Periodic testing, inspection, and AMC support",
    ],
    process: [
      "Compliance review & hazard analysis",
      "System design & detector zoning",
      "Panel installation & device commissioning",
      "Certification support & scheduled servicing",
    ],
  },
  electrical: {
    title: "Electrical Panel Solutions",
    eyebrow: "Power Distribution",
    image: "images/services/Electrical Panels.avif",
    intro:
      "Reliable electrical panel design, assembly, and upgrades for commercial and industrial power distribution.",
    points: [
      "Main distribution boards (MDB) & sub-panels",
      "Control panels and motor starter panels",
      "MCB / MCCB / RCCB protection schemes",
      "Panel upgrades, load balancing & fault tracing",
      "Safety audits and preventive maintenance",
    ],
    process: [
      "Load calculation & single-line diagrams",
      "Panel fabrication & component selection",
      "On-site installation & energization",
      "Testing, labeling & handover documentation",
    ],
  },
};

function initServiceDetails() {
  const root = document.querySelector("[data-service-detail]");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const key = params.get("service") || "networking";
  const data = SERVICES[key] || SERVICES.networking;

  const setText = (sel, value) => {
    document.querySelectorAll(sel).forEach((el) => {
      el.textContent = value;
    });
  };

  setText("[data-sd-eyebrow]", data.eyebrow);
  setText("[data-sd-title]", data.title);
  setText("[data-sd-intro]", data.intro);

  const image = root.querySelector("[data-sd-image]");
  if (image) {
    image.src = data.image;
    image.alt = data.title;
  }

  document.title = `${data.title} | A Million Network & Security`;

  const points = root.querySelector("[data-sd-points]");
  if (points) {
    points.innerHTML = data.points
      .map((p) => `<li><i class="bi bi-check-circle-fill"></i><span>${p}</span></li>`)
      .join("");
  }

  const process = root.querySelector("[data-sd-process]");
  if (process) {
    process.innerHTML = data.process
      .map(
        (p, i) => `
      <div class="col-md-6 reveal">
        <div class="info-card p-4 h-100">
          <div class="icon-badge">${String(i + 1).padStart(2, "0")}</div>
          <h3 class="h5 mb-0">${p}</h3>
        </div>
      </div>`
      )
      .join("");
  }

  document.querySelectorAll("[data-service-link]").forEach((link) => {
    const id = link.getAttribute("data-service-link");
    link.classList.toggle("active", id === key);
  });

  initReveal();
}

function initClickAssist() {
  if (document.querySelector(".click-assist")) return;

  const phoneDisplay = "+91 95662 46802";
  const phoneTel = "+919566246802";
  const landlineDisplay = "+91-44-31698811";
  const landlineTel = "+914431698811";
  const email = "visweswaran2001@yahoo.com";
  const mapsUrl = "https://maps.app.goo.gl/9XvPoND4kaquSp547?g_st=awb";

  const root = document.createElement("div");
  root.className = "click-assist";
  root.innerHTML = `
    <div class="click-assist-panel" role="dialog" aria-label="Contact options" aria-hidden="true">
      <div class="click-assist-head">
        <span class="click-assist-badge"><i class="bi bi-stars" aria-hidden="true"></i> AI Assistant</span>
        <strong class="click-assist-title">How can we help?</strong>
        <p class="click-assist-sub">Tap an option to connect instantly</p>
      </div>
      <div class="click-assist-list">
        <a class="click-assist-item" href="https://wa.me/${phoneTel.replace("+", "")}" target="_blank" rel="noopener noreferrer">
          <span class="click-assist-icon is-whatsapp"><i class="bi bi-whatsapp" aria-hidden="true"></i></span>
          <span class="click-assist-text">
            <strong>WhatsApp</strong>
            <small>${phoneDisplay}</small>
          </span>
        </a>
        <a class="click-assist-item" href="mailto:${email}">
          <span class="click-assist-icon is-email"><i class="bi bi-envelope-fill" aria-hidden="true"></i></span>
          <span class="click-assist-text">
            <strong>Email</strong>
            <small>${email}</small>
          </span>
        </a>
        <a class="click-assist-item" href="tel:${phoneTel}">
          <span class="click-assist-icon is-call"><i class="bi bi-phone-fill" aria-hidden="true"></i></span>
          <span class="click-assist-text">
            <strong>Mobile</strong>
            <small>${phoneDisplay}</small>
          </span>
        </a>
        <a class="click-assist-item" href="tel:${landlineTel}">
          <span class="click-assist-icon is-call"><i class="bi bi-telephone-fill" aria-hidden="true"></i></span>
          <span class="click-assist-text">
            <strong>Landline</strong>
            <small>${landlineDisplay}</small>
          </span>
        </a>
        <a class="click-assist-item" href="${mapsUrl}" target="_blank" rel="noopener noreferrer">
          <span class="click-assist-icon is-map"><i class="bi bi-geo-alt-fill" aria-hidden="true"></i></span>
          <span class="click-assist-text">
            <strong>Office</strong>
            <small>Guindy, Chennai - 600032</small>
          </span>
        </a>
      </div>
    </div>
    <button type="button" class="click-assist-fab" aria-expanded="false" aria-label="Open contact assistant">
      <img src="images/ai-assistant.png" alt="" width="72" height="88" />
    </button>
  `;

  document.body.appendChild(root);

  const fab = root.querySelector(".click-assist-fab");
  const panel = root.querySelector(".click-assist-panel");

  const setOpen = (open) => {
    root.classList.toggle("is-open", open);
    fab.setAttribute("aria-expanded", String(open));
    fab.setAttribute("aria-label", open ? "Close contact assistant" : "Open contact assistant");
    panel.setAttribute("aria-hidden", String(!open));
  };

  fab.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!root.classList.contains("is-open"));
  });

  panel.addEventListener("click", (e) => e.stopPropagation());

  document.addEventListener("click", () => {
    if (root.classList.contains("is-open")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && root.classList.contains("is-open")) setOpen(false);
  });

  const menu = document.getElementById("mainNav");
  if (menu) {
    menu.addEventListener("show.bs.offcanvas", () => {
      setOpen(false);
      document.body.classList.add("nav-drawer-open");
    });
    menu.addEventListener("hidden.bs.offcanvas", () => {
      document.body.classList.remove("nav-drawer-open");
      // Remove any leftover backdrop that can block all page taps
      document.querySelectorAll(".offcanvas-backdrop").forEach((backdrop) => backdrop.remove());
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    });
  }
}
