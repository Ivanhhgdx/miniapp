(() => {
  const BACKGROUND_URL = "assets/university-rocket.jpg";
  const GLASS_SELECTOR = [
    ".hero-card",
    ".panel",
    ".class-card",
    ".session-item",
    ".search-item",
    ".modal-card",
    ".modal-section",
    ".teacher-modal-card",
    ".teacher-modal-block",
    ".teacher-item",
  ].join(", ");
  const sourceCanvas = document.createElement("canvas");
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  const backgroundImage = new Image();
  let sourcePixels = null;
  let pixelRatio = 1;
  let renderFrame = 0;
  let scrollTimer = 0;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function smoothstep(edge0, edge1, value) {
    const progress = clamp((value - edge0) / (edge1 - edge0), 0, 1);
    return progress * progress * (3 - 2 * progress);
  }

  function drawBlurredBackground() {
    if (!backgroundImage.naturalWidth || !sourceContext) return;

    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.25);
    const viewportWidth = Math.max(1, Math.round(window.innerWidth * pixelRatio));
    const viewportHeight = Math.max(1, Math.round(window.innerHeight * pixelRatio));
    sourceCanvas.width = viewportWidth;
    sourceCanvas.height = viewportHeight;

    const imageRatio = backgroundImage.naturalWidth / backgroundImage.naturalHeight;
    const viewportRatio = viewportWidth / viewportHeight;
    const drawWidth = viewportRatio > imageRatio ? viewportWidth : viewportHeight * imageRatio;
    const drawHeight = viewportRatio > imageRatio ? viewportWidth / imageRatio : viewportHeight;
    const offsetX = (viewportWidth - drawWidth) / 2;
    const offsetY = (viewportHeight - drawHeight) / 2;

    sourceContext.clearRect(0, 0, viewportWidth, viewportHeight);
    sourceContext.save();
    sourceContext.filter = `blur(${Math.round(4 * pixelRatio)}px) saturate(1.1)`;
    sourceContext.drawImage(
      backgroundImage,
      offsetX - 12 * pixelRatio,
      offsetY - 12 * pixelRatio,
      drawWidth + 24 * pixelRatio,
      drawHeight + 24 * pixelRatio
    );
    sourceContext.restore();
    sourcePixels = sourceContext.getImageData(0, 0, viewportWidth, viewportHeight);
    scheduleRender();
  }

  function roundedRectDistance(x, y, width, height, radius) {
    const px = Math.abs(x - width / 2) - (width / 2 - radius);
    const py = Math.abs(y - height / 2) - (height / 2 - radius);
    const outside = Math.hypot(Math.max(px, 0), Math.max(py, 0));
    const inside = Math.min(Math.max(px, py), 0);
    return outside + inside - radius;
  }

  function attachLens(element) {
    if (element.dataset.liquidLens === "ready") return;
    const canvas = document.createElement("canvas");
    canvas.className = "liquid-lens";
    canvas.setAttribute("aria-hidden", "true");
    element.prepend(canvas);
    element.classList.add("liquid-glass");
    element.dataset.liquidLens = "ready";
  }

  function renderLens(element) {
    if (!sourcePixels || element.classList.contains("is-hidden")) return;
    const rect = element.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2 || rect.bottom < 0 || rect.top > window.innerHeight) return;

    attachLens(element);
    const canvas = element.querySelector(":scope > .liquid-lens");
    if (!canvas) return;

    const quality = rect.width * rect.height > 220000 ? 0.82 : 1;
    const width = Math.max(1, Math.round(rect.width * quality));
    const height = Math.max(1, Math.round(rect.height * quality));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const context = canvas.getContext("2d");
    if (!context) return;
    const output = context.createImageData(width, height);
    const outputData = output.data;
    const sourceData = sourcePixels.data;
    const sourceWidth = sourcePixels.width;
    const sourceHeight = sourcePixels.height;
    const radius = Math.min(width, height, 42 * quality) * 0.48;
    const bezel = Math.max(12, Math.min(width, height) * 0.38);
    const strength = 38 * quality;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const signedDistance = roundedRectDistance(x, y, width, height, radius);
        if (signedDistance > 0) continue;

        const insideDistance = -signedDistance;
        const edge = 1 - smoothstep(0, bezel, insideDistance);
        const nx = (x - width / 2) / Math.max(1, width / 2);
        const ny = (y - height / 2) / Math.max(1, height / 2);
        const normalLength = Math.hypot(nx, ny) || 1;
        const normalX = nx / normalLength;
        const normalY = ny / normalLength;
        const lensBulge = Math.max(0, 1 - nx * nx * 0.82 - ny * ny * 1.26);
        const refraction = edge * strength * 0.96 + lensBulge * strength * 0.48;
        const zoom = 0.91 - lensBulge * 0.05;
        const localX = width / 2 + (x - width / 2) * zoom - normalX * refraction;
        const localY = height / 2 + (y - height / 2) * zoom - normalY * refraction * 0.72;
        const screenX = (rect.left + localX / quality) * pixelRatio;
        const screenY = (rect.top + localY / quality) * pixelRatio;
        const sampleX = clamp(Math.round(screenX), 0, sourceWidth - 1);
        const sampleY = clamp(Math.round(screenY), 0, sourceHeight - 1);
        const sourceIndex = (sampleY * sourceWidth + sampleX) * 4;
        const redX = clamp(Math.round(screenX - normalX * 2.2 * pixelRatio), 0, sourceWidth - 1);
        const blueX = clamp(Math.round(screenX + normalX * 2.6 * pixelRatio), 0, sourceWidth - 1);
        const redIndex = (sampleY * sourceWidth + redX) * 4;
        const blueIndex = (sampleY * sourceWidth + blueX) * 4;
        const outputIndex = (y * width + x) * 4;
        const rim = edge * 24;

        outputData[outputIndex] = clamp(sourceData[redIndex] * 1.05 + rim, 0, 255);
        outputData[outputIndex + 1] = clamp(sourceData[sourceIndex + 1] * 1.06 + rim, 0, 255);
        outputData[outputIndex + 2] = clamp(sourceData[blueIndex + 2] * 1.09 + rim * 1.18, 0, 255);
        outputData[outputIndex + 3] = 244;
      }
    }

    context.putImageData(output, 0, 0);
  }

  function renderAll() {
    renderFrame = 0;
    document.querySelectorAll(GLASS_SELECTOR).forEach(renderLens);
  }

  function scheduleRender() {
    if (renderFrame) cancelAnimationFrame(renderFrame);
    renderFrame = requestAnimationFrame(renderAll);
  }

  const observer = new MutationObserver(() => scheduleRender());
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

  window.addEventListener("resize", drawBlurredBackground, { passive: true });
  window.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(scheduleRender, 70);
    },
    { passive: true }
  );

  backgroundImage.addEventListener("load", drawBlurredBackground, { once: true });
  backgroundImage.src = BACKGROUND_URL;
})();
