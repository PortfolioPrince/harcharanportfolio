(function () {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------------
     Graceful fallback for not-yet-uploaded media (media1.jpg ... media15.jpg)
     Falls back to the studio placeholder so the layout never shows a
     broken-image icon before real files are dropped in.
  --------------------------------------------------------------------- */
  document.addEventListener(
    "error",
    (e) => {
      const el = e.target;
      if (
        el.tagName === "IMG" &&
        el.src.includes("/static/images/media/") &&
        !el.dataset.fallbackApplied
      ) {
        el.dataset.fallbackApplied = "true";
        el.src = "/static/images/projects/placeholder.svg";
      }
    },
    true
  );

  /* ---------------------------------------------------------------------
     Loader
  --------------------------------------------------------------------- */
  window.addEventListener("load", () => {
    const loader = document.getElementById("loader");
    if (!loader) return;
    setTimeout(() => loader.classList.add("is-hidden"), 500);
  });

  /* ---------------------------------------------------------------------
     Custom cursor
  --------------------------------------------------------------------- */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  if (dot && ring && !reducedMotion && window.matchMedia("(hover:hover)").matches) {
    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + "px";
      dot.style.top = mouseY + "px";
    });
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + "px";
      ring.style.top = ringY + "px";
      requestAnimationFrame(animateRing);
    }
    animateRing();

    document.querySelectorAll("a, button, [data-magnetic]").forEach((el) => {
      el.addEventListener("mouseenter", () => ring.classList.add("is-active"));
      el.addEventListener("mouseleave", () => ring.classList.remove("is-active"));
    });
  }

  /* ---------------------------------------------------------------------
     Magnetic buttons
  --------------------------------------------------------------------- */
  if (!reducedMotion && window.matchMedia("(hover:hover)").matches) {
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "translate(0,0)";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Page transition curtain (internal navigation)
  --------------------------------------------------------------------- */
  if (!reducedMotion) {
    const curtain = document.createElement("div");
    curtain.className = "page-transition";
    document.body.appendChild(curtain);

    document.addEventListener("click", (e) => {
      const link = e.target.closest("a");
      if (!link || !link.href) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      if (link.href.startsWith("mailto:") || link.href.startsWith("tel:")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (err) {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return; // same-page anchors, in-page controls

      e.preventDefault();
      curtain.classList.add("is-active");
      setTimeout(() => {
        window.location.href = link.href;
      }, 420);
    });
  }

  /* ---------------------------------------------------------------------
     Tilt-on-hover cards
  --------------------------------------------------------------------- */
  if (!reducedMotion && window.matchMedia("(hover:hover)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(700px) rotateX(${-y * 6}deg) rotateY(${x * 8}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------------------------------------------------------------------
     Scroll reveal
  --------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal, .reveal-up, .text-wipe");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------------------------------------------------------------------
     Header hide-on-scroll
  --------------------------------------------------------------------- */
  const header = document.getElementById("siteHeader");
  let lastScroll = 0;
  window.addEventListener("scroll", () => {
    const current = window.scrollY;
    if (header) {
      if (current > lastScroll && current > 160) {
        header.classList.add("is-hidden");
      } else {
        header.classList.remove("is-hidden");
      }
    }
    lastScroll = current;
  });

  /* ---------------------------------------------------------------------
     Mobile nav toggle
  --------------------------------------------------------------------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  if (navToggle && mainNav) {
    navToggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mainNav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        mainNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      })
    );
  }

  /* ---------------------------------------------------------------------
     Back to top
  --------------------------------------------------------------------- */
  const backToTop = document.getElementById("backToTop");
  if (backToTop) {
    backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------------------------------------------------------------------
     Animated counters
  --------------------------------------------------------------------- */
  const counters = document.querySelectorAll(".stat-num[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const counterIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10) || 0;
          const duration = 1200;
          const start = performance.now();
          function tick(now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target);
            if (progress < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counterIo.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterIo.observe(c));
  }

  /* ---------------------------------------------------------------------
     Skill bars
  --------------------------------------------------------------------- */
  const skillBars = document.querySelectorAll(".skill-bar-fill[data-level]");
  if (skillBars.length && "IntersectionObserver" in window) {
    const skillIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.width = entry.target.dataset.level + "%";
            skillIo.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    skillBars.forEach((b) => skillIo.observe(b));
  }

  /* ---------------------------------------------------------------------
     Testimonial carousel
  --------------------------------------------------------------------- */
  const carousel = document.getElementById("testimonialCarousel");
  if (carousel) {
    const track = carousel.querySelector(".testimonial-track");
    const cards = carousel.querySelectorAll(".testimonial-card");
    const dotsWrap = document.getElementById("carouselDots");
    let index = 0;

    cards.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap.appendChild(dot);
    });

    function goTo(i) {
      index = (i + cards.length) % cards.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dotsWrap.querySelectorAll("button").forEach((d, di) => d.classList.toggle("active", di === index));
    }

    let autoplay = setInterval(() => goTo(index + 1), 6000);
    carousel.addEventListener("mouseenter", () => clearInterval(autoplay));
    carousel.addEventListener("mouseleave", () => (autoplay = setInterval(() => goTo(index + 1), 6000)));
  }

  /* ---------------------------------------------------------------------
     Portfolio filters + search (client side)
  --------------------------------------------------------------------- */
  const grid = document.getElementById("portfolioGrid");
  if (grid) {
    const chips = document.querySelectorAll("#filterChips .chip");
    const searchInput = document.getElementById("searchInput");
    const cards = grid.querySelectorAll(".portfolio-card");

    function applyFilters() {
      const activeChip = document.querySelector("#filterChips .chip.active");
      const category = activeChip ? activeChip.dataset.category : "all";
      const query = (searchInput.value || "").toLowerCase().trim();

      cards.forEach((card) => {
        const matchesCategory = category === "all" || card.dataset.category === category;
        const matchesQuery = !query || card.dataset.title.includes(query);
        card.classList.toggle("is-hidden", !(matchesCategory && matchesQuery));
      });
    }

    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        document.getElementById("categoryInput").value = chip.dataset.category;
        applyFilters();
      });
    });

    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    // Keyboard navigation across cards
    const focusable = Array.from(cards);
    grid.addEventListener("keydown", (e) => {
      if (!["ArrowRight", "ArrowLeft"].includes(e.key)) return;
      const currentIndex = focusable.indexOf(document.activeElement);
      if (currentIndex === -1) return;
      e.preventDefault();
      const next = e.key === "ArrowRight" ? currentIndex + 1 : currentIndex - 1;
      const target = focusable[(next + focusable.length) % focusable.length];
      if (target) target.focus();
    });
  }

  /* ---------------------------------------------------------------------
     Growth chart draw-in (digital marketing page)
  --------------------------------------------------------------------- */
  const chartLines = document.querySelectorAll(".growth-chart .chart-line");
  if (chartLines.length && "IntersectionObserver" in window) {
    chartLines.forEach((line) => {
      const length = line.getTotalLength();
      line.style.strokeDasharray = String(length);
      line.style.strokeDashoffset = String(length);
    });
    const chartIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.16,.84,.44,1)";
          entry.target.style.strokeDashoffset = "0";
          chartIo.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    chartLines.forEach((line) => chartIo.observe(line));
  }

  /* ---------------------------------------------------------------------
     Showreel play button
  --------------------------------------------------------------------- */
  const showreelVideo = document.getElementById("showreelVideo");
  const showreelPlay = document.getElementById("showreelPlay");
  if (showreelVideo && showreelPlay) {
    showreelPlay.addEventListener("click", () => {
      showreelVideo.play();
    });
    showreelVideo.addEventListener("play", () => showreelPlay.classList.add("is-hidden"));
    showreelVideo.addEventListener("pause", () => showreelPlay.classList.remove("is-hidden"));
  }

  /* ---------------------------------------------------------------------
     Lightbox
  --------------------------------------------------------------------- */
  const lightbox = document.getElementById("lightbox");
  if (lightbox) {
    const lbImage = document.getElementById("lightboxImage");
    const lbTitle = document.getElementById("lightboxTitle");
    const lbClose = document.getElementById("lightboxClose");

    function openLightbox(src, title) {
      lbImage.src = src;
      lbImage.alt = title || "";
      lbTitle.textContent = title || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }
    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
    }

    document.querySelectorAll(".lightbox-trigger").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        openLightbox(btn.dataset.src, btn.dataset.title);
      });
    });
    lbClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLightbox();
    });
  }
})();
