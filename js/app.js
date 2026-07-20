(() => {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const searchHint = document.getElementById("searchHint");
  const cards = Array.from(document.querySelectorAll(".card"));

  // Placeholder 1x1 transparente
  const EMPTY_SRC = "data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=";

  // ===== Scroll a sección al tocar chip =====
  chips.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetSel = btn.getAttribute("data-target");
      const el = document.querySelector(targetSel);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ===== Resaltar chip según scroll =====
  const setActiveChip = (id) => {
    chips.forEach(c => c.classList.toggle("is-active", c.getAttribute("data-target") === `#${id}`));
  };

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActiveChip(visible.target.id);
    },
    { root: null, threshold: [0.15, 0.25, 0.4, 0.6] }
  );

  sections.forEach(s => io.observe(s));

  // ===== Buscador (filtra por data-name + texto) =====
  const normalize = (s) =>
    (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const filterCards = () => {
    const q = normalize(searchInput.value);
    let shown = 0;

    cards.forEach(card => {
      const hay = normalize(card.getAttribute("data-name")) + " " + normalize(card.innerText);
      const ok = q === "" || hay.includes(q);
      card.style.display = ok ? "" : "none";
      if (ok) shown++;
    });

    if (q === "") {
      searchHint.textContent = "";
      clearBtn.style.opacity = "0";
      clearBtn.style.pointerEvents = "none";
      return;
    }

    clearBtn.style.opacity = "1";
    clearBtn.style.pointerEvents = "auto";
    searchHint.textContent = `Mostrando ${shown} resultado(s) para: "${searchInput.value}"`;
  };

  searchInput.addEventListener("input", filterCards);

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    filterCards();
    searchInput.focus();
  });

  clearBtn.style.opacity = "0";
  clearBtn.style.pointerEvents = "none";

  // ===== Auto-detección de imágenes (card--auto) =====
  const setupMenuImages = () => {
    const imgs = Array.from(document.querySelectorAll(".card__media img"));

    const updateState = (img) => {
      const card = img.closest(".card");
      const media = img.closest(".card__media");
      if (!card || !media) return;

      // Revisamos la ruta configurada directamente.
      // No usamos naturalWidth porque las imágenes lazy están dentro
      // de un contenedor oculto y el navegador todavía no las carga.
      const configuredSrc = img.getAttribute("src") || "";
      const hasRealImage = configuredSrc !== "" && configuredSrc !== EMPTY_SRC;

      if (hasRealImage) {
        card.classList.add("has-img");
        media.classList.remove("media--placeholder");
      } else {
        card.classList.remove("has-img");
        media.classList.add("media--placeholder");
      }
    };

    imgs.forEach(img => {
      // Estado inicial
      updateState(img);

      img.addEventListener("load", () => updateState(img));

      img.addEventListener("error", () => {
        // Si la ruta está mal, caemos al placeholder sin romper el layout
        img.src = EMPTY_SRC;
        updateState(img);
      });
    });
  };

  // ===== Visor ampliado de imágenes =====
  const setupImageLightbox = () => {
    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Imagen ampliada del plato");
    overlay.innerHTML = `
      <button class="image-lightbox__close" type="button" aria-label="Cerrar imagen">✕</button>
      <div class="image-lightbox__content">
        <img class="image-lightbox__img" src="" alt="" />
        <p class="image-lightbox__hint">Toca la imagen para cerrar</p>
      </div>
    `;

    document.body.appendChild(overlay);

    const enlargedImg = overlay.querySelector(".image-lightbox__img");
    const closeBtn = overlay.querySelector(".image-lightbox__close");
    let lastFocusedElement = null;

    const openLightbox = (img) => {
      const src = img.getAttribute("src") || "";
      if (!src || src === EMPTY_SRC) return;

      lastFocusedElement = img;
      enlargedImg.src = src;
      enlargedImg.alt = img.alt || "Imagen ampliada del plato";
      overlay.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      closeBtn.focus();
    };

    const closeLightbox = () => {
      if (!overlay.classList.contains("is-open")) return;

      overlay.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      enlargedImg.src = "";
      lastFocusedElement?.focus();
    };

    document.querySelectorAll(".card__media img").forEach(img => {
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `${img.alt || "Imagen del plato"}. Toca para ampliar`);

      img.addEventListener("click", () => openLightbox(img));
      img.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openLightbox(img);
        }
      });
    });

    overlay.addEventListener("click", closeLightbox);
    closeBtn.addEventListener("click", closeLightbox);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLightbox();
    });
  };

  setupMenuImages();
  setupImageLightbox();
})();