(() => {
  const BASE_W = 1080;
  const BASE_H = 1920;

  function setScale() {
    const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    // Escala para que la página ENTERA entre (sin recorte)
    const scale = Math.min(vw / BASE_W, vh / BASE_H);

    document.documentElement.style.setProperty("--page-scale", scale.toFixed(4));
  }

  window.addEventListener("resize", setScale);
  window.addEventListener("orientationchange", setScale);

  // En algunos móviles el viewport cambia al mostrar/ocultar barra
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", setScale);
  }

  setScale();
})();
