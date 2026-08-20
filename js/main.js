(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined";

  document.getElementById("footer-year").textContent = new Date().getFullYear();

  /* ---------------- media skeleton / lazy load ---------------- */
  document.querySelectorAll(".media").forEach(function (wrap) {
    var img = wrap.querySelector("img");
    if (!img) return;
    var markLoaded = function () { wrap.classList.add("is-loaded"); };
    if (img.complete && img.naturalWidth > 0) {
      markLoaded();
    } else {
      img.addEventListener("load", markLoaded, { once: true });
      img.addEventListener("error", markLoaded, { once: true });
    }
  });

  /* ---------------- number formatting ---------------- */
  function formatNumber(intPart, decimals) {
    var s = Math.round(intPart).toLocaleString("pt-BR");
    if (decimals !== undefined && decimals !== null) {
      s += "," + String(decimals).padStart(2, "0");
    }
    return s;
  }

  var countEls = document.querySelectorAll("[data-count-to]");

  function setFinalCounts() {
    countEls.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = el.getAttribute("data-decimals");
      el.textContent = formatNumber(target, decimals);
    });
  }

  /* ---------------- testimonial carousel ---------------- */
  var carouselTrack = document.querySelector("[data-carousel-track]");
  if (carouselTrack) {
    var scrollByCard = function (dir) {
      var card = carouselTrack.querySelector(".carousel__item");
      var step = card ? card.getBoundingClientRect().width + 20 : 300;
      carouselTrack.scrollBy({ left: dir * step, behavior: "smooth" });
    };
    var prevBtn = document.querySelector("[data-carousel-prev]");
    var nextBtn = document.querySelector("[data-carousel-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { scrollByCard(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollByCard(1); });
  }

  if (!hasGsap) {
    /* graceful fallback: no animation library available, just show final state */
    setFinalCounts();
    document.querySelectorAll("[data-reveal], [data-reveal-lines]").forEach(function (el) {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------------- scroll reveals ---------------- */
  var revealTargets = gsap.utils.toArray("[data-reveal], [data-reveal-lines]");

  if (reduceMotion) {
    setFinalCounts();
  } else {
    var DIR_OFFSETS = {
      top: { y: -34, x: 0 },
      bottom: { y: 34, x: 0 },
      left: { y: 0, x: -44 },
      right: { y: 0, x: 44 },
    };
    revealTargets.forEach(function (el, i) {
      var dir = el.getAttribute("data-reveal-dir");
      var offset = DIR_OFFSETS[dir] || { y: 26, x: 0 };
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: offset.x, y: offset.y },
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    });

    /* stagger children of grids for a slightly more choreographed feel */
    [".feature-grid", ".bonus-grid", ".credential-list"].forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (grid) {
        var items = grid.children;
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 20 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: { trigger: grid, start: "top 88%", once: true },
          }
        );
      });
    });

    /* count-up stats */
    countEls.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var decimals = el.getAttribute("data-decimals");
      var proxy = { val: 0 };
      gsap.to(proxy, {
        val: target,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: function () {
          el.textContent = formatNumber(proxy.val, decimals !== null ? decimals : undefined);
        },
        onComplete: function () {
          el.textContent = formatNumber(target, decimals);
        },
      });
    });

    /* header + hero content show immediately, no load-in sequence */
    gsap.set([".site-header", ".hero .eyebrow", ".hero__title", ".hero__lede", ".hero__text", ".hero__content .btn"], { autoAlpha: 1, y: 0 });
    gsap.set(".hero__photo-wrap", { autoAlpha: 1, scale: 1 });
  }
})();
