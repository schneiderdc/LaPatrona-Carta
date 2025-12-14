(() => {
  const chips = Array.from(document.querySelectorAll(".chip"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const searchHint = document.getElementById("searchHint");
  const cards = Array.from(document.querySelectorAll(".card"));

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
      // busca la que esté más visible
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

  // estado inicial
  clearBtn.style.opacity = "0";
  clearBtn.style.pointerEvents = "none";
})();
