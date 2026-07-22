/* ANTOINE FABRE — shared behaviour */
(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- sticky nav ---- */
  var nav = document.getElementById("nav");
  if (nav) {
    var onScroll = function () { nav.classList.toggle("solid", window.scrollY > 40); };
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- accessible mobile menu ---- */
  var btn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  if (btn && menu) {
    var closeMenu = function (returnFocus) {
      menu.classList.remove("open");
      document.body.classList.remove("menu-open");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Ouvrir le menu");
      btn.textContent = "MENU";
      if (returnFocus) btn.focus();
    };
    var openMenu = function () {
      menu.classList.add("open");
      document.body.classList.add("menu-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fermer le menu");
      btn.textContent = "FERMER";
      var firstLink = menu.querySelector("a");
      if (firstLink) firstLink.focus();
    };

    btn.addEventListener("click", function () {
      if (menu.classList.contains("open")) closeMenu(false);
      else openMenu();
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { closeMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.classList.contains("open")) closeMenu(true);
    });
    document.addEventListener("click", function (event) {
      if (menu.classList.contains("open") && !menu.contains(event.target) && !btn.contains(event.target)) {
        closeMenu(false);
      }
    });
    addEventListener("resize", function () {
      if (innerWidth > 900 && menu.classList.contains("open")) closeMenu(false);
    }, { passive: true });
  }

  /* ---- hero parallax ---- */
  var heroTopo = document.getElementById("heroTopo");
  if (heroTopo && !reduce) {
    addEventListener("scroll", function () {
      heroTopo.style.transform = "translate3d(0," + (window.scrollY * 0.18) + "px,0) scale(1.05)";
    }, { passive: true });
  }

  /* ---- reveal on scroll, with a no-Observer fallback ---- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if (!("IntersectionObserver" in window) || reduce) {
      reveals.forEach(function (el) { el.classList.add("in"); });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -4%" });
      reveals.forEach(function (el, index) {
        el.style.transitionDelay = (Math.min(index, 4) * 0.045) + "s";
        io.observe(el);
      });
    }
  }

  /* ---- image fallback state ---- */
  document.querySelectorAll(".ph > img").forEach(function (img) {
    img.addEventListener("error", function () {
      var parent = img.parentElement;
      if (parent) parent.classList.add("is-missing");
      img.remove();
    }, { once: true });
  });

  /* ---- skill bars (CV) ---- */
  var bars = document.querySelectorAll(".bar .bfill");
  if (bars.length) {
    var fill = function (bar) { bar.style.width = (bar.getAttribute("data-lvl") || "0") + "%"; };
    if (!("IntersectionObserver" in window) || reduce) {
      bars.forEach(fill);
    } else {
      var bio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { fill(entry.target); bio.unobserve(entry.target); }
        });
      }, { threshold: 0.4 });
      bars.forEach(function (bar) { bio.observe(bar); });
    }
  }

  /* ---- portfolio filtering ---- */
  var grid = document.getElementById("pfGrid");
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".pf-card"));
    var chips = Array.prototype.slice.call(document.querySelectorAll(".chip"));
    var countEl = document.getElementById("pfCount");
    var emptyEl = document.getElementById("pfEmpty");

    function labelFor(tag) {
      var chip = chips.filter(function (item) { return item.getAttribute("data-tag") === tag; })[0];
      return chip ? chip.textContent.trim() : tag;
    }

    function apply(tag, focusGrid) {
      var shown = 0;
      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").split(" ");
        var match = tag === "all" || tags.indexOf(tag) !== -1;
        card.classList.toggle("hide", !match);
        card.setAttribute("aria-hidden", match ? "false" : "true");
        if (match) shown += 1;
      });
      chips.forEach(function (chip) {
        chip.setAttribute("aria-pressed", chip.getAttribute("data-tag") === tag ? "true" : "false");
      });
      if (countEl) {
        countEl.innerHTML = tag === "all"
          ? "<b>" + shown + "</b> projets"
          : "<b>" + shown + "</b> projet" + (shown > 1 ? "s" : "") + " · " + labelFor(tag);
      }
      if (emptyEl) emptyEl.style.display = shown === 0 ? "block" : "none";

      var url = new URL(location.href);
      if (tag === "all") url.searchParams.delete("tag");
      else url.searchParams.set("tag", tag);
      history.replaceState(null, "", url);

      if (focusGrid) {
        var firstVisible = cards.filter(function (card) { return !card.classList.contains("hide"); })[0];
        var link = firstVisible && firstVisible.querySelector("h3 a");
        if (link) link.focus({ preventScroll: true });
      }
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () { apply(chip.getAttribute("data-tag"), false); });
    });

    var initial = new URLSearchParams(location.search).get("tag") || "all";
    if (initial !== "all" && !chips.some(function (chip) { return chip.getAttribute("data-tag") === initial; })) {
      initial = "all";
    }
    apply(initial, false);
  }
})();
