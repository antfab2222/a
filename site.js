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

  /* ---- project image lightbox: fullscreen, zoom, drag and navigation ---- */
  var lightboxImages = Array.prototype.slice.call(document.querySelectorAll(
    "main figure img, main .proj-cover img"
  )).filter(function (img) {
    return !img.closest("a") && !img.closest(".related") && !img.closest(".rel-card");
  });

  if (lightboxImages.length) {
    var lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Visionneuse d’image");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML =
      '<div class="lightbox-toolbar">' +
        '<span class="lightbox-count" aria-live="polite"></span>' +
        '<button type="button" class="lightbox-btn" data-action="zoom-out" aria-label="Dézoomer">−</button>' +
        '<button type="button" class="lightbox-btn" data-action="reset" aria-label="Réinitialiser le zoom">100%</button>' +
        '<button type="button" class="lightbox-btn" data-action="zoom-in" aria-label="Zoomer">+</button>' +
        '<button type="button" class="lightbox-btn lightbox-close" data-action="close" aria-label="Fermer">×</button>' +
      '</div>' +
      '<button type="button" class="lightbox-nav lightbox-prev" data-action="prev" aria-label="Image précédente">‹</button>' +
      '<div class="lightbox-stage">' +
        '<img class="lightbox-image" alt="" draggable="false" />' +
        '<iframe class="lightbox-pdf" title="Plan PDF agrandi" loading="eager"></iframe>' +
      '</div>' +
      '<button type="button" class="lightbox-nav lightbox-next" data-action="next" aria-label="Image suivante">›</button>' +
      '<div class="lightbox-caption"></div>';
    document.body.appendChild(lightbox);

    var lbImage = lightbox.querySelector(".lightbox-image");
    var lbStage = lightbox.querySelector(".lightbox-stage");
    var lbPdf = lightbox.querySelector(".lightbox-pdf");
    var lbCount = lightbox.querySelector(".lightbox-count");
    var lbReset = lightbox.querySelector('[data-action="reset"]');
    var lbCaption = lightbox.querySelector(".lightbox-caption");
    var currentIndex = 0;
    var scale = 1;
    var x = 0;
    var y = 0;
    var dragging = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var originX = 0;
    var originY = 0;
    var lastFocus = null;

    function captionFor(img) {
      var figure = img.closest("figure");
      var caption = figure && figure.querySelector("figcaption");
      return caption ? caption.textContent.trim() : (img.alt || "");
    }

    function applyTransform() {
      lbImage.style.transform = "translate3d(" + x + "px," + y + "px,0) scale(" + scale + ")";
      lbImage.classList.toggle("is-zoomed", scale > 1);
      lbReset.textContent = Math.round(scale * 100) + "%";
    }

    function resetZoom() {
      scale = 1;
      x = 0;
      y = 0;
      applyTransform();
    }

    function setZoom(nextScale) {
      scale = Math.min(5, Math.max(1, nextScale));
      if (scale === 1) { x = 0; y = 0; }
      applyTransform();
    }

    function fullSourceFor(img) {
      /* data-full permet d'indiquer un PDF vectoriel précis pour les plans.
         Pour les autres images, la visionneuse cherche automatiquement une
         version WebP HD : image.jpg devient image-hd.webp. */
      if (img.dataset.full) {
        return {
          src: img.dataset.full,
          type: img.dataset.fullType || (/\.pdf(?:[?#].*)?$/i.test(img.dataset.full) ? "pdf" : "image")
        };
      }

      var original = img.currentSrc || img.src;
      try {
        var url = new URL(original, document.baseURI);
        var match = url.pathname.match(/^(.*?)(\.[^./]+)$/);
        if (!match || /-hd$/i.test(match[1])) return { src: original, type: "image" };
        url.pathname = match[1] + "-hd.webp";
        return { src: url.href, type: "image" };
      } catch (error) {
        return {
          src: original.replace(/\.[^./?#]+([?#].*)?$/, "-hd.webp$1"),
          type: "image"
        };
      }
    }


    function showImage(index) {
      currentIndex = (index + lightboxImages.length) % lightboxImages.length;
      var source = lightboxImages[currentIndex];
      var originalSource = source.currentSrc || source.src;
      var full = fullSourceFor(source);

      resetZoom();
      lbImage.alt = source.alt || "Image agrandie";
      lbCount.textContent = (currentIndex + 1) + " / " + lightboxImages.length;
      lbCaption.textContent = captionFor(source);
      lightbox.classList.add("is-loading");
      lightbox.classList.toggle("is-pdf", full.type === "pdf");

      lbImage.hidden = full.type === "pdf";
      lbPdf.hidden = full.type !== "pdf";
      lbReset.disabled = full.type === "pdf";
      lightbox.querySelector('[data-action="zoom-in"]').disabled = full.type === "pdf";
      lightbox.querySelector('[data-action="zoom-out"]').disabled = full.type === "pdf";

      if (full.type === "pdf") {
        lbImage.removeAttribute("src");
        lbPdf.src = full.src + (/\?/.test(full.src) ? "&" : "?") + "view=FitH";
        lbPdf.onload = function () { lightbox.classList.remove("is-loading"); };
        return;
      }

      lbPdf.removeAttribute("src");
      var loader = new Image();
      loader.onload = function () {
        lbImage.src = loader.src;
        lightbox.classList.remove("is-loading");
      };
      loader.onerror = function () {
        lbImage.src = originalSource;
        lightbox.classList.remove("is-loading");
      };
      loader.src = full.src;
    }


    function openLightbox(index) {
      lastFocus = document.activeElement;
      showImage(index);
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
      lightbox.querySelector('[data-action="close"]').focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
      resetZoom();
      lbImage.removeAttribute("src");
      lbPdf.removeAttribute("src");
      lightbox.classList.remove("is-pdf", "is-loading");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    lightboxImages.forEach(function (img, index) {
      img.classList.add("lightbox-trigger");
      img.dataset.lightboxIndex = String(index);
      img.setAttribute("tabindex", "0");
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", (img.alt || "Image") + " — cliquer pour ouvrir en grand");

      var holder = img.parentElement;
      if (holder) holder.classList.add("has-lightbox");

      img.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(index);
        }
      });
    });

    /* Capture le clic au plus tôt : la visionneuse fonctionne même si un autre
       effet de galerie intercepte ensuite l’événement. */
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("img.lightbox-trigger");
      if (!trigger || lightbox.contains(trigger)) return;
      event.preventDefault();
      event.stopPropagation();
      openLightbox(Number(trigger.dataset.lightboxIndex));
    }, true);

    lightbox.addEventListener("click", function (event) {
      var action = event.target.closest("[data-action]");
      if (action) {
        var name = action.getAttribute("data-action");
        if (name === "close") closeLightbox();
        if (name === "prev") showImage(currentIndex - 1);
        if (name === "next") showImage(currentIndex + 1);
        if (name === "zoom-in") setZoom(scale + 0.25);
        if (name === "zoom-out") setZoom(scale - 0.25);
        if (name === "reset") resetZoom();
        return;
      }
      if (event.target === lightbox || event.target === lbStage) closeLightbox();
    });

    lbStage.addEventListener("wheel", function (event) {
      if (!lightbox.classList.contains("is-open") || lightbox.classList.contains("is-pdf")) return;
      event.preventDefault();
      setZoom(scale + (event.deltaY < 0 ? 0.2 : -0.2));
    }, { passive: false });

    lbImage.addEventListener("dblclick", function () {
      if (lightbox.classList.contains("is-pdf")) return;
      setZoom(scale > 1 ? 1 : 2);
    });

    lbImage.addEventListener("pointerdown", function (event) {
      if (scale <= 1) return;
      dragging = true;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      originX = x;
      originY = y;
      lbImage.setPointerCapture(event.pointerId);
      lbImage.classList.add("is-dragging");
    });
    lbImage.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      x = originX + event.clientX - dragStartX;
      y = originY + event.clientY - dragStartY;
      applyTransform();
    });
    function endDrag(event) {
      if (!dragging) return;
      dragging = false;
      lbImage.classList.remove("is-dragging");
      if (event.pointerId !== undefined && lbImage.hasPointerCapture(event.pointerId)) {
        lbImage.releasePointerCapture(event.pointerId);
      }
    }
    lbImage.addEventListener("pointerup", endDrag);
    lbImage.addEventListener("pointercancel", endDrag);

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showImage(currentIndex - 1);
      if (event.key === "ArrowRight") showImage(currentIndex + 1);
      if (event.key === "+" || event.key === "=") setZoom(scale + 0.25);
      if (event.key === "-") setZoom(scale - 0.25);
      if (event.key === "0") resetZoom();
    });
  }

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
