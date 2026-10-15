
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  // 1. Update footer year
  const copyright = $(".copyright");
  if (copyright) {
    copyright.textContent =
      `© ${new Date().getFullYear()} BEDORA. All rights reserved.`;
  }

  // 2. Reveal content while scrolling
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    $$(".block-head, .product, .comfort-text, .story-text, .material, .about, .questions-list details")
      .forEach(el => {
        el.classList.add("reveal");
        observer.observe(el);
      });
  }

  // 3. Smooth image movement on hover
  $$(".img-box").forEach(frame => {
    const img = frame.querySelector("img");
    if (!img) return;

    let x = 0;
    let targetX = 0;
    let scale = 1;
    let targetScale = 1;
    let raf = null;
    let last = 0;

    img.style.transition = "none";
    img.style.willChange = "transform";

    function animate(time) {
      const dt = last ? Math.min((time - last) / 1000, 0.05) : 0;
      last = time;

      const ease = 1 - Math.exp(-7 * dt);
      x += (targetX - x) * ease;
      scale += (targetScale - scale) * ease;

      img.style.transform = `translate3d(${x}px,0,0) scale(${scale})`;

      if (Math.abs(targetX - x) > 0.02 ||
          Math.abs(targetScale - scale) > 0.001) {
        raf = requestAnimationFrame(animate);
      } else {
        x = targetX;
        scale = targetScale;
        raf = null;
        last = 0;
      }
    }

    function start() {
      if (raf === null) raf = requestAnimationFrame(animate);
    }

    frame.addEventListener("pointerenter", e => {
      if (e.pointerType === "touch") return;
      targetX = 2;
      targetScale = 1.025;
      start();
    });

    frame.addEventListener("pointermove", e => {
      if (e.pointerType === "touch") return;
      const rect = frame.getBoundingClientRect();
      targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
      start();
    });

    frame.addEventListener("pointerleave", () => {
      targetX = 0;
      targetScale = 1;
      start();
    });
  });

  const beds = {
    soft: {
      label: "SOFT COLLECTION",
      title: "The Cloud Bed",
      description:
        "A generously padded headboard, tactile upholstery and a warm, inviting look for your bedroom.",
      features: [
        "Soft padded headboard",
        "Tactile upholstery",
        "Calm neutral colours"
      ],
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",
      alt: "Soft upholstered bed"
    },

    premium: {
      label: "PREMIUM COLLECTION",
      title: "The Haven Bed",
      description:
        "An elegant bedroom style with refined details, generous padding and a luxurious atmosphere.",
      features: [
        "Deep cushioned look",
        "Refined styling",
        "Elegant neutral palette"
      ],
      image:
        "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85",
      alt: "Premium-inspired bedroom"
    },

    modern: {
      label: "MODERN COLLECTION",
      title: "The Luna Bed",
      description:
        "Clean lines, understated shapes and contemporary inspiration for a modern bedroom.",
      features: [
        "Contemporary silhouette",
        "Minimalist styling",
        "Versatile colours"
      ],
      image:
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1200&q=85",
      alt: "Modern bedroom design"
    }
  };

  function selectBed(key) {
    const bed = beds[key];
    if (!bed) return;

    const photo = $("#detail-image");
    const copy = $(".preview-text");

    $$(".tab").forEach(button => {
      const active = button.dataset.style === key;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    $$(".btn-detail").forEach(button => {
      button.classList.toggle("selected", button.dataset.style === key);
    });
    $("#detail-label").textContent = bed.label;
    $("#detail-title").textContent = bed.title;
    $("#detail-description").textContent = bed.description;

    $("#detail-features").replaceChildren(
      ...bed.features.map(feature => {
        const span = document.createElement("span");
        span.textContent = `✓ ${feature}`;
        return span;
      })
    );

    photo.classList.add("is-changing");
    const nextImage = new Image();

    nextImage.onload = () => {
      photo.src = bed.image;
      photo.alt = bed.alt;
      photo.classList.remove("is-changing");
    };

    nextImage.onerror = () => {
      photo.classList.remove("is-changing");
    };

    nextImage.src = bed.image;

    if (copy) {
      copy.classList.add("changing");
      requestAnimationFrame(() => copy.classList.remove("changing"));
    }
  }

  $$(".tab, .btn-detail").forEach(button => {
    button.addEventListener("click", event => {
      event.preventDefault();
      selectBed(button.dataset.style);
    });
  });
  const questions = $$(".questions-list details");

  questions.forEach(item => {
    item.addEventListener("toggle", () => {
      if (item.open) {
        questions.forEach(other => {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const links = $$(".nav a[href^='#']");
    const sections = links
      .map(link => $(link.getAttribute("href")))
      .filter(Boolean);

    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        links.forEach(link => {
          link.classList.toggle(
            "active-link",
            link.hash === `#${entry.target.id}`
          );
        });
      });
    }, { rootMargin: "-25% 0px -60% 0px" });

    sections.forEach(section => navObserver.observe(section));
  }
  const topButton = document.createElement("button");
  topButton.className = "back-to-top";
  topButton.textContent = "↑";
  topButton.setAttribute("aria-label", "Back to top");
  document.body.appendChild(topButton);

  function updateTopButton() {
    topButton.classList.toggle("show", window.scrollY > 500);
  }

  window.addEventListener("scroll", updateTopButton, { passive: true });
  updateTopButton();

  topButton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  const bar = document.createElement("div");
  bar.className = "scroll-progress";
  document.body.appendChild(bar);

  let scheduled = false;

  window.addEventListener("scroll", () => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      bar.style.width =
        `${max > 0 ? window.scrollY / max * 100 : 0}%`;

      scheduled = false;
    });
  }, { passive: true });

  $$(".img-box img").forEach(img => {
    img.addEventListener("error", () => {
      img.alt = "Image unavailable";
    }, { once: true });
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      questions.forEach(item => item.open = false);
    }
  });

  console.log("BEDORA is ready.");
});
