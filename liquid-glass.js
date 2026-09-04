(() => {
  const BACKGROUND_URL = "assets/university-rocket.jpg";
  const GLASS_SELECTOR = ".hero-card, .panel:not(.search-panel), .search-box, .modal-card, .teacher-modal-card";
  const backgroundImage = new Image();
  const lenses = new Map();
  let imageReady = false;

  const vertexShaderSource = `
    attribute vec2 a_position;
    varying vec2 v_uv;

    void main() {
      v_uv = (a_position + 1.0) * 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    varying vec2 v_uv;
    uniform sampler2D u_image;
    uniform vec2 u_viewport;
    uniform vec2 u_rect_position;
    uniform vec2 u_rect_size;
    uniform vec2 u_image_size;

    float roundedBoxSdf(vec2 point, vec2 halfSize, float radius) {
      vec2 distanceToEdge = abs(point) - (halfSize - vec2(radius));
      return length(max(distanceToEdge, 0.0))
        + min(max(distanceToEdge.x, distanceToEdge.y), 0.0)
        - radius;
    }

    void main() {
      vec2 local = vec2(v_uv.x, 1.0 - v_uv.y);
      vec2 pixelPosition = local * u_rect_size;
      vec2 halfSize = u_rect_size * 0.5;
      float cornerRadius = min(26.0, min(halfSize.x, halfSize.y));
      vec2 glassPoint = pixelPosition - halfSize;
      float signedDistance = roundedBoxSdf(glassPoint, halfSize, cornerRadius);
      float insideDistance = max(0.0, -signedDistance);
      float edgeLens = 1.0 - smoothstep(0.0, 8.0, insideDistance);
      float normalStep = 0.75;
      vec2 edgeNormal = normalize(vec2(
        roundedBoxSdf(glassPoint + vec2(normalStep, 0.0), halfSize, cornerRadius)
          - roundedBoxSdf(glassPoint - vec2(normalStep, 0.0), halfSize, cornerRadius),
        roundedBoxSdf(glassPoint + vec2(0.0, normalStep), halfSize, cornerRadius)
          - roundedBoxSdf(glassPoint - vec2(0.0, normalStep), halfSize, cornerRadius)
      ) + vec2(0.0001));
      vec2 screenPosition = u_rect_position + local * u_rect_size - edgeNormal * edgeLens * 7.0;

      float coverScale = max(u_viewport.x / u_image_size.x, u_viewport.y / u_image_size.y);
      vec2 drawnSize = u_image_size * coverScale;
      vec2 drawnOffset = (u_viewport - drawnSize) * 0.5;
      vec2 imageUv = clamp((screenPosition - drawnOffset) / drawnSize, 0.001, 0.999);
      vec2 textureUv = vec2(imageUv.x, 1.0 - imageUv.y);
      vec2 blurStep = vec2(4.0) / u_image_size;
      vec4 color = texture2D(u_image, textureUv) * 0.24;
      color += texture2D(u_image, textureUv + vec2(blurStep.x, 0.0)) * 0.12;
      color += texture2D(u_image, textureUv - vec2(blurStep.x, 0.0)) * 0.12;
      color += texture2D(u_image, textureUv + vec2(0.0, blurStep.y)) * 0.12;
      color += texture2D(u_image, textureUv - vec2(0.0, blurStep.y)) * 0.12;
      color += texture2D(u_image, textureUv + blurStep) * 0.07;
      color += texture2D(u_image, textureUv - blurStep) * 0.07;
      color += texture2D(u_image, textureUv + vec2(blurStep.x, -blurStep.y)) * 0.07;
      color += texture2D(u_image, textureUv + vec2(-blurStep.x, blurStep.y)) * 0.07;

      float rimLight = pow(edgeLens, 3.0) * 0.04;
      color.rgb = mix(color.rgb * 1.025, vec3(0.025, 0.075, 0.105), 0.22)
        + vec3(rimLight * 0.78, rimLight * 0.9, rimLight);
      color.a = 0.84;
      gl_FragColor = color;
    }
  `;

  function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message || "Не удалось собрать шейдер жидкого стекла");
    }
    return shader;
  }

  function createProgram(gl) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(message || "Не удалось связать шейдер жидкого стекла");
    }
    return program;
  }

  function createLens(element) {
    if (lenses.has(element) || !imageReady) return lenses.get(element);

    const canvas = document.createElement("canvas");
    canvas.className = "liquid-lens";
    canvas.setAttribute("aria-hidden", "true");
    element.prepend(canvas);
    element.classList.add("liquid-glass");

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) {
      canvas.remove();
      return null;
    }

    const program = createProgram(gl);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backgroundImage);

    const lens = {
      canvas,
      gl,
      program,
      viewportLocation: gl.getUniformLocation(program, "u_viewport"),
      rectPositionLocation: gl.getUniformLocation(program, "u_rect_position"),
      rectSizeLocation: gl.getUniformLocation(program, "u_rect_size"),
      imageSizeLocation: gl.getUniformLocation(program, "u_image_size"),
    };
    lenses.set(element, lens);
    return lens;
  }

  function renderLens(element) {
    const rect = element.getBoundingClientRect();
    if (
      element.classList.contains("is-hidden") ||
      rect.width < 2 ||
      rect.height < 2 ||
      rect.bottom < -30 ||
      rect.top > window.innerHeight + 30
    ) {
      return;
    }

    const lens = createLens(element);
    if (!lens) return;
    const { canvas, gl, program } = lens;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(1, Math.round(rect.width * pixelRatio));
    const height = Math.max(1, Math.round(rect.height * pixelRatio));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }

    gl.useProgram(program);
    gl.uniform2f(lens.viewportLocation, window.innerWidth, window.innerHeight);
    gl.uniform2f(lens.rectPositionLocation, rect.left, rect.top);
    gl.uniform2f(lens.rectSizeLocation, rect.width, rect.height);
    gl.uniform2f(lens.imageSizeLocation, backgroundImage.naturalWidth, backgroundImage.naturalHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function renderFrame() {
    if (imageReady && !document.hidden) {
      document.querySelectorAll(GLASS_SELECTOR).forEach(renderLens);
    }
    requestAnimationFrame(renderFrame);
  }

  const observer = new MutationObserver(() => {
    document.querySelectorAll(GLASS_SELECTOR).forEach((element) => {
      if (!element.classList.contains("is-hidden")) createLens(element);
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });

  backgroundImage.addEventListener(
    "load",
    () => {
      imageReady = true;
      document.documentElement.classList.add("has-live-refraction");
    },
    { once: true }
  );
  backgroundImage.src = BACKGROUND_URL;
  requestAnimationFrame(renderFrame);
})();
