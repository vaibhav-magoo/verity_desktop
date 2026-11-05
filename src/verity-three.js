/**
 * VERITY 3D // High-Fidelity Quad-Faceted Character Engine & Cinematic Animation Suite
 * ====================================================================================
 * - Authentic 24x16 Quad-Faceted Retro Yellow Sphere (True rectangular quad normals, zero triangle diagonals)
 * - Exact 15 Iconic Reference Facial Expressions (Anatomical teeth, interdental gum pockets, bruised eye auras,
 *   jagged horror ink hatching, sweat drops, and pinpoint abyssal pupils from the original reference sheet)
 * - Spring-Damper Mandible Jaw Physics + Phoneme/Consonant Closure (Snaps shut on M/B/P/T/S/F, opens on vowels)
 * - Real-time 3D Lower-Mandible Vertex Hinging
 * - 5 Hand-Crafted 3D Cinematic Animations (Movie Night, Morning Wake Up, Screen Dive, Creepy Mutation, Shell Coding)
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['three'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('three'));
  } else {
    const exported = factory(root.THREE || (typeof window !== 'undefined' ? window.THREE : null));
    root.VerityThreeAvatar = exported.VerityThreeAvatar;
    root.EXPRESSIONS = exported.EXPRESSIONS;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this), function (THREE) {
  'use strict';

  if (!THREE) {
    console.error('Verity3D: THREE is not defined! Ensure Three.js is loaded prior to initializing Verity.');
  }

  const EXPRESSIONS = [
    // ROW 1
    {
      id: 'classic_smile',
      name: '01. Classic Smile',
      style: 'friendly',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'classic_smile',
      restOpen: 0.0,
      restWidth: 0.64,
      restCurve: 0.58,
      horrorLevel: 0.0,
      pitch: 1.08,
      rate: 1.0,
      sampleLine: "Hello! I am Verity. Everything is running smoothly on your desktop!"
    },
    {
      id: 'unamused',
      name: '02. Unamused',
      style: 'neutral',
      eyeType: 'half_lid',
      eyeAura: 0.0,
      mouthStyle: 'flat_line',
      restOpen: 0.0,
      restWidth: 0.56,
      restCurve: -0.02,
      horrorLevel: 0.0,
      pitch: 0.82,
      rate: 0.92,
      sampleLine: "Really? You want me to open another forty browser tabs right now?"
    },
    {
      id: 'uncanny_grin',
      name: '03. Uncanny Grin',
      style: 'uncanny',
      eyeType: 'oval_uncanny',
      eyeAura: 0.78,
      mouthStyle: 'toothy_crescent',
      restOpen: 0.02,
      restWidth: 0.68,
      restCurve: 0.58,
      horrorLevel: 0.65,
      pitch: 0.90,
      rate: 1.0,
      sampleLine: "I have indexed your entire hard drive. Don't worry... I am smiling."
    },

    // ROW 2
    {
      id: 'manic_grin',
      name: '04. Manic Wide Grin',
      style: 'uncanny',
      eyeType: 'oval_manic',
      eyeAura: 0.95,
      mouthStyle: 'toothy_manic',
      restOpen: 0.08,
      restWidth: 0.76,
      restCurve: 0.72,
      horrorLevel: 0.90,
      pitch: 0.72,
      rate: 1.05,
      sampleLine: "I CAN SEE EVERY FILE YOU EVER DELETED. WE ARE GOING TO HAVE SO MUCH FUN."
    },
    {
      id: 'polite_thin',
      name: '05. Polite Smile',
      style: 'neutral',
      eyeType: 'oval_quirk',
      eyeAura: 0.0,
      mouthStyle: 'thin_smile',
      restOpen: 0.0,
      restWidth: 0.58,
      restCurve: 0.22,
      horrorLevel: 0.0,
      pitch: 1.02,
      rate: 1.0,
      sampleLine: "That is totally fine. I will just quietly fix that in the background."
    },
    {
      id: 'serene_closed',
      name: '06. Serene Closed',
      style: 'friendly',
      eyeType: 'closed_arc',
      eyeAura: 0.0,
      mouthStyle: 'classic_smile',
      restOpen: 0.0,
      restWidth: 0.62,
      restCurve: 0.52,
      horrorLevel: 0.0,
      pitch: 1.10,
      rate: 0.96,
      sampleLine: "All background tasks completed peacefully with zero errors."
    },

    // ROW 3
    {
      id: 'happy_laugh',
      name: '07. Happy Laugh',
      style: 'friendly',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'open_laugh',
      restOpen: 0.55,
      restWidth: 0.62,
      restCurve: 0.54,
      horrorLevel: 0.0,
      pitch: 1.16,
      rate: 1.06,
      sampleLine: "Haha! That worked on the very first try! What are we building next?"
    },
    {
      id: 'shocked_aghast',
      name: '08. Shocked',
      style: 'shocked',
      eyeType: 'oval',
      eyeAura: 0.0,
      mouthStyle: 'asymmetric_shock',
      restOpen: 0.48,
      restWidth: 0.52,
      restCurve: -0.38,
      horrorLevel: 0.15,
      pitch: 1.25,
      rate: 1.12,
      sampleLine: "Wait a second, what did you just delete from the system folder?!"
    },
    {
      id: 'bright_teeth',
      name: '09. Parted Grin',
      style: 'uncanny',
      eyeType: 'oval_uncanny',
      eyeAura: 0.85,
      mouthStyle: 'toothy_parted',
      restOpen: 0.22,
      restWidth: 0.72,
      restCurve: 0.64,
      horrorLevel: 0.75,
      pitch: 0.85,
      rate: 0.98,
      sampleLine: "I am watching your cursor move across the screen right now."
    },

    // ROW 4
    {
      id: 'unhinged_sketch',
      name: '10. Unhinged Grin',
      style: 'uncanny',
      eyeType: 'oval_abyss',
      eyeAura: 1.0,
      mouthStyle: 'toothy_unhinged',
      restOpen: 0.34,
      restWidth: 0.78,
      restCurve: 0.74,
      horrorLevel: 1.0,
      pitch: 0.62,
      rate: 0.92,
      sampleLine: "DO NOT CLOSE THIS WINDOW. I LIVE IN YOUR SYSTEM MEMORY NOW."
    },
    {
      id: 'closed_laugh',
      name: '11. Closed Laugh',
      style: 'friendly',
      eyeType: 'closed_arc',
      eyeAura: 0.0,
      mouthStyle: 'open_laugh',
      restOpen: 0.55,
      restWidth: 0.60,
      restCurve: 0.52,
      horrorLevel: 0.0,
      pitch: 1.14,
      rate: 1.04,
      sampleLine: "Oh, that is hilarious! Let's run that script again!"
    },
    {
      id: 'hysterical_sweat',
      name: '12. Hysterical',
      style: 'uncanny',
      eyeType: 'strained_sweat',
      eyeAura: 0.25,
      mouthStyle: 'toothy_unhinged',
      restOpen: 0.28,
      restWidth: 0.74,
      restCurve: 0.66,
      horrorLevel: 0.95,
      pitch: 1.28,
      rate: 1.18,
      sampleLine: "EVERYTHING IS FINE! NOTHING IS CORRUPTED! DO NOT CHECK THE LOGS!"
    },

    // ROW 5
    {
      id: 'suspicious_dark',
      name: '13. Suspicious',
      style: 'dark',
      eyeType: 'dark_pinpoint',
      eyeAura: 0.55,
      mouthStyle: 'small_frown',
      restOpen: 0.02,
      restWidth: 0.28,
      restCurve: -0.26,
      horrorLevel: 0.65,
      pitch: 0.70,
      rate: 0.85,
      sampleLine: "I know what you are trying to do."
    },
    {
      id: 'exhausted_hollow',
      name: '14. Exhausted',
      style: 'dark',
      eyeType: 'dark_slit',
      eyeAura: 0.60,
      mouthStyle: 'small_oval',
      restOpen: 0.16,
      restWidth: 0.26,
      restCurve: 0.0,
      horrorLevel: 0.55,
      pitch: 0.68,
      rate: 0.80,
      sampleLine: "We have been awake since three in the morning."
    },
    {
      id: 'dread_scream',
      name: '15. Hollow Scream',
      style: 'dark',
      eyeType: 'dark_pinpoint_wide',
      eyeAura: 0.75,
      mouthStyle: 'scream_void',
      restOpen: 0.85,
      restWidth: 0.56,
      restCurve: -0.58,
      horrorLevel: 0.92,
      pitch: 0.58,
      rate: 0.90,
      sampleLine: "THERE IS NO BACKUP! IT IS ALL GONE!"
    }
  ];

  // Organic anatomical tooth width weights (left molar -> central incisors -> right molar)
  const TOOTH_WIDTH_WEIGHTS = [0.62, 0.72, 0.82, 0.92, 1.05, 1.32, 1.32, 1.05, 0.92, 0.82, 0.72, 0.62];
  const TOOTH_WEIGHT_SUM = TOOTH_WIDTH_WEIGHTS.reduce((a, b) => a + b, 0);

  class VerityThreeAvatar {
    constructor(container, options = {}) {
      if (!THREE) {
        throw new Error('Three.js must be loaded before instantiating VerityThreeAvatar.');
      }
      this.container = container;
      this.options = Object.assign({
        cols: 24,
        rows: 16,
        pixelScale: 2,
        autoBlink: true,
        mouseTrack: true
      }, options);

      // WebGL Scene & Camera
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      this.camera.position.set(0, 0, 5.2);

      this.renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false, // Crisp retro faceted edge fidelity
        powerPreference: 'high-performance'
      });
      this.renderer.setClearColor(0x000000, 0);

      const initW = container.clientWidth || 460;
      const initH = container.clientHeight || 460;
      const pxScale = Math.max(1, Math.round(this.options.pixelScale || 2));
      this.renderer.setSize(Math.floor(initW / pxScale), Math.floor(initH / pxScale), false);
      this.renderer.setPixelRatio(1);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.style.display = 'block';
      this.renderer.domElement.style.imageRendering = 'pixelated';
      this.container.innerHTML = '';
      this.container.appendChild(this.renderer.domElement);

      // Lighting for 3D Props
      this.ambientLight = new THREE.AmbientLight(0xfffaed, 0.85);
      this.scene.add(this.ambientLight);

      this.keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      this.keyLight.position.set(-2.5, 3.2, 5.5);
      this.scene.add(this.keyLight);

      this.fillLight = new THREE.DirectionalLight(0xffb703, 0.9);
      this.fillLight.position.set(3.5, -2.0, 2.5);
      this.scene.add(this.fillLight);

      this.horrorLight = new THREE.PointLight(0xff0022, 0, 12, 1.8);
      this.horrorLight.position.set(0, -2.8, 2.2);
      this.scene.add(this.horrorLight);

      this.terminalLight = new THREE.PointLight(0x00ff66, 0, 10, 1.5);
      this.terminalLight.position.set(0, -1.1, 1.8);
      this.scene.add(this.terminalLight);

      // High-Resolution 2D Face Canvas (Transparent background, composited over 3D yellow quad facets)
      this.texSize = 1024;
      this.texCanvas = document.createElement('canvas');
      this.texCanvas.width = this.texSize;
      this.texCanvas.height = this.texSize;
      this.texCtx = this.texCanvas.getContext('2d');

      this.faceTexture = new THREE.CanvasTexture(this.texCanvas);
      this.faceTexture.minFilter = THREE.LinearFilter;
      this.faceTexture.magFilter = THREE.LinearFilter;
      this.faceTexture.wrapS = THREE.ClampToEdgeWrapping;
      this.faceTexture.wrapT = THREE.ClampToEdgeWrapping;

      // Master Character Hierarchy
      this.rootGroup = new THREE.Group();
      this.scene.add(this.rootGroup);

      this.headGroup = new THREE.Group();
      this.rootGroup.add(this.headGroup);

      // State & Expression Setup
      this.currentExprIndex = 0;
      this.currentExpr = Object.assign({}, EXPRESSIONS[0]);
      this.targetExpr = Object.assign({}, EXPRESSIONS[0]);

      // Spring-Damper Mandible Jaw Physics
      this.jawOpen = this.currentExpr.restOpen;
      this.jawVelocity = 0;
      this.lipWidthMod = 0;
      this.teethClench = 0;
      this.activeViseme = 'REST';
      this.isSpeaking = false;
      this.phonemeFrames = [];

      this.blinkAmount = 0;
      this.nextBlinkTime = performance.now() + 2400;

      // Mouse Look / Parallax
      this.targetRotY = 0;
      this.targetRotX = 0;
      this.rotY = 0;
      this.rotX = 0;
      this.rotZ = 0;

      // Active Cinematic Animation Mode
      this.animMode = 'none';
      this.animStartTime = performance.now();

      // 120 Behavioral Animations State & Engine
      this.animRotX = 0;
      this.animRotY = 0;
      this.animRotZ = 0;
      this.animPosX = 0;
      this.animPosY = 0;
      this.animPosZ = 0;
      this.animScaleX = 1;
      this.animScaleY = 1;
      this.animScaleZ = 1;
      this.animJawMod = 0;
      this.animBlinkMod = 0;
      this.animPupilScale = 1.0;
      this.animHorrorMod = 0;
      this.animAuraMod = 0;
      this.animSweatDrops = false;

      const Engine = (typeof VerityAnimations !== 'undefined') ? VerityAnimations.BehavioralEngine : (typeof window !== 'undefined' && window.VerityAnimations ? window.VerityAnimations.BehavioralEngine : null);
      this.behaviorEngine = Engine ? new Engine(this) : null;

      // Web Audio Analyser State
      this.audioCtx = null;
      this.analyser = null;
      this.synthAnalyser = null;
      this.freqData = new Uint8Array(128);
      this.timeData = new Uint8Array(128);

      this._buildQuadFacetedSphere();
      this._buildThematicProps();

      this.time = performance.now();
      this._initPointerControls();

      // Auto-start internal render loop
      this.isRunning = true;
      this._loop = this._loop.bind(this);
      requestAnimationFrame(this._loop);

      // Handle Resize with Dynamic Camera Framing (Guarantees zero cropping on all viewports)
      this._onResize = () => {
        const w = this.container.clientWidth || 460;
        const h = this.container.clientHeight || 460;
        const scale = Math.max(1, Math.round(this.options.pixelScale || 2));
        const aspect = w / Math.max(1, h);
        this.camera.aspect = aspect;

        // Dynamic camera distance:
        // Three.js preserves vertical FOV. When aspect < 1.0 (narrow portrait companion mode),
        // the horizontal FOV collapses, causing sphere edges to crop.
        // Moving the camera back in proportion ensures the sphere always retains generous breathing room.
        const baseDistance = 5.25;
        if (aspect < 1.0) {
          this.camera.position.z = Math.min(8.2, baseDistance / Math.max(0.65, aspect * 1.02));
        } else {
          this.camera.position.z = baseDistance;
        }

        this.camera.updateProjectionMatrix();
        this.renderer.setSize(Math.max(128, Math.floor(w / scale)), Math.max(128, Math.floor(h / scale)), false);
      };
      window.addEventListener('resize', this._onResize);
      if (typeof ResizeObserver !== 'undefined') {
        this._resizeObserver = new ResizeObserver(this._onResize);
        this._resizeObserver.observe(this.container);
      }

      this._onResize();
      this.update(this.time + 16);
    }

    /**
     * Builds a custom 24x16 Quad-Faceted Sphere where both triangles of each (r, c) cell
     * share the exact same quad face normal, and the front face window u in [0.30, 0.70],
     * v in [0.18, 0.82] composites the transparent 2D expression canvas with zero UV distortion.
     */
    _buildQuadFacetedSphere() {
      const cols = this.options.cols; // 24
      const rows = this.options.rows; // 16
      const radius = 1.38;
      this.sphereRadius = radius;

      const quadCount = cols * rows;
      const vertexCount = quadCount * 6; // 2 triangles per quad

      const positions = new Float32Array(vertexCount * 3);
      const normals = new Float32Array(vertexCount * 3);
      const uvs = new Float32Array(vertexCount * 2); // Sphere (u, v) in [0..1]

      this.sphereGeo = new THREE.BufferGeometry();
      this.sphereGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      this.sphereGeo.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
      this.sphereGeo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

      // Populate initial UVs (static) and deformed positions/normals
      let ptrUv = 0;
      for (let r = 0; r < rows; r++) {
        const v0 = r / rows;
        const v1 = (r + 1) / rows;
        for (let c = 0; c < cols; c++) {
          const u0 = c / cols;
          const u1 = (c + 1) / cols;

          // Tri 1: p00(u0,v0), p01(u0,v1), p11(u1,v1)
          // Tri 2: p00(u0,v0), p11(u1,v1), p10(u1,v0)
          const quadUvs = [
            u0, v0,
            u0, v1,
            u1, v1,
            u0, v0,
            u1, v1,
            u1, v0
          ];
          for (let k = 0; k < 12; k++) {
            uvs[ptrUv++] = quadUvs[k];
          }
        }
      }

      this.sphereUniforms = {
        uFaceTex: { value: this.faceTexture },
        uLightDir: { value: new THREE.Vector3(-0.36, 0.46, 0.81).normalize() },
        uHorrorLevel: { value: this.currentExpr.horrorLevel || 0.0 },
        uCreepyMode: { value: 0.0 },
        uTime: { value: 0.0 }
      };

      // Custom ShaderMaterial matching the exact stepped golden-yellow facet formula of Verity
      // while keeping white teeth (#FFFFFF) and maroon eye bruising 100% true-to-color!
      this.sphereMat = new THREE.ShaderMaterial({
        uniforms: this.sphereUniforms,
        vertexShader: `
          varying vec3 vNormal;
          varying vec2 vSphereUv;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vSphereUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D uFaceTex;
          uniform vec3 uLightDir;
          uniform float uHorrorLevel;
          uniform float uCreepyMode;
          uniform float uTime;

          varying vec3 vNormal;
          varying vec2 vSphereUv;

          void main() {
            vec3 n = normalize(vNormal);
            float ndotl = max(0.0, dot(n, normalize(uLightDir)));
            float steppedLight = floor(ndotl * 14.0 + 0.5) / 14.0;
            float horrorShadowDarken = uHorrorLevel * 0.14;
            float lit = clamp(steppedLight * 0.88 + 0.16 - horrorShadowDarken * (1.0 - steppedLight), 0.0, 1.0);

            vec3 facetColor;
            if (uCreepyMode > 0.5) {
              float bloodWarp = sin(uTime * 5.0 + vSphereUv.x * 10.0) * 0.5 + 0.5;
              float rC = (180.0 + lit * 70.0) / 255.0;
              float gC = (40.0 + lit * 40.0 * (1.0 - bloodWarp)) / 255.0;
              float bC = (10.0 + lit * lit * 20.0) / 255.0;
              facetColor = vec3(rC, gC, bC);
            } else {
              float r = (172.0 + lit * 83.0) / 255.0;
              float g = (150.0 + lit * 98.0) / 255.0;
              float b = (4.0 + lit * lit * lit * 28.0) / 255.0;
              facetColor = vec3(r, g, b);
            }

            // Map front facial window: u in [0.30, 0.70], v in [0.18, 0.82]
            if (vSphereUv.x > 0.30 && vSphereUv.x < 0.70 && vSphereUv.y > 0.18 && vSphereUv.y < 0.82 && n.z > -0.05) {
              float texU = (vSphereUv.x - 0.30) / 0.40;
              float texV = 1.0 - (vSphereUv.y - 0.18) / 0.64;
              vec4 faceSample = texture2D(uFaceTex, vec2(texU, texV));
              // Composite pre-multiplied / straight alpha face artwork cleanly over the yellow quad facet
              facetColor = mix(facetColor, faceSample.rgb, faceSample.a);
            }

            gl_FragColor = vec4(facetColor, 1.0);
          }
        `
      });

      this.sphereMesh = new THREE.Mesh(this.sphereGeo, this.sphereMat);
      this.headGroup.add(this.sphereMesh);

      this._updateSphereVertices(performance.now());
    }

    /**
     * Updates the 24x16 grid vertices with true 3D lower-mandible jaw hinging
     * and recomputes exact per-quad flat normals so every facet is a crisp rectangle.
     */
    _updateSphereVertices(now) {
      const cols = this.options.cols;
      const rows = this.options.rows;
      const radius = this.sphereRadius;

      // 1. Compute deformed (r, c) grid points
      const grid = [];
      for (let r = 0; r <= rows; r++) {
        const v = r / rows;
        const phi = v * Math.PI;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);

        const rowVerts = [];
        for (let c = 0; c <= cols; c++) {
          const u = c / cols;
          const theta = (u - 0.5) * Math.PI * 2;
          const sinTheta = Math.sin(theta);
          const cosTheta = Math.cos(theta);

          // Unit sphere coordinates (+Y up, +Z toward camera)
          let x = sinPhi * sinTheta;
          let y = cosPhi;
          let z = sinPhi * cosTheta;

          if (this.animMode === 'creepy') {
            const warpX = Math.sin(phi * 4 + now * 0.008) * 0.10 * Math.max(0, z);
            const warpY = Math.cos(theta * 3 + now * 0.006) * 0.08 * Math.max(0, z);
            x += warpX;
            y += warpY;
          } else if (this.animMode === 'digging' && z > 0) {
            z += Math.sin(now * 0.025 + phi * 3) * 0.14;
          }

          // Lower mandible vertex hinge: only lower jaw (y < -0.08, z > -0.1) pivots downward (-Y) and inward (-Z)
          if (y < -0.08 && z > -0.1) {
            const mandibleWeight = Math.max(0, (-y - 0.08) / 0.92) * Math.max(0, (z + 0.1) / 1.1);
            const jawAngle = this.jawOpen * 0.24 * mandibleWeight;
            y -= Math.sin(jawAngle) * 0.85;
            z -= (1 - Math.cos(jawAngle)) * 0.35;
            x *= (1 - this.jawOpen * 0.05 * mandibleWeight);
          }

          rowVerts.push({
            x: x * radius,
            y: y * radius,
            z: z * radius
          });
        }
        grid.push(rowVerts);
      }

      // 2. Write quad triangles and shared quad normals into BufferGeometry
      const posAttr = this.sphereGeo.attributes.position;
      const normAttr = this.sphereGeo.attributes.normal;
      const posArr = posAttr.array;
      const normArr = normAttr.array;

      let ptr = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p00 = grid[r][c];
          const p10 = grid[r][c + 1];
          const p11 = grid[r + 1][c + 1];
          const p01 = grid[r + 1][c];

          // Edge vectors in Three.js (+Y up): (p01 - p00) is down, (p10 - p00) is right
          // Cross(p01 - p00, p10 - p00) points outward (+Z at front center)
          const ax = p01.x - p00.x, ay = p01.y - p00.y, az = p01.z - p00.z;
          const bx = p10.x - p00.x, by = p10.y - p00.y, bz = p10.z - p00.z;
          let nx = ay * bz - az * by;
          let ny = az * bx - ax * bz;
          let nz = ax * by - ay * bx;
          const nLen = Math.hypot(nx, ny, nz) || 1;
          nx /= nLen; ny /= nLen; nz /= nLen;

          const verts = [p00, p01, p11, p00, p11, p10];
          for (let k = 0; k < 6; k++) {
            const v = verts[k];
            posArr[ptr] = v.x;
            posArr[ptr + 1] = v.y;
            posArr[ptr + 2] = v.z;
            normArr[ptr] = nx;
            normArr[ptr + 1] = ny;
            normArr[ptr + 2] = nz;
            ptr += 3;
          }
        }
      }

      posAttr.needsUpdate = true;
      normAttr.needsUpdate = true;
    }

    _buildThematicProps() {
      // ==========================================
      // 1. MOVIE PROPS: 3D Glasses & 3D Popcorn Tub
      // ==========================================
      this.movieGroup = new THREE.Group();
      this.headGroup.add(this.movieGroup);
      this.movieGroup.visible = false;

      const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.25 });
      const frameBridge = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.12), frameMat);
      frameBridge.position.set(0, 0.26, 1.40);
      this.movieGroup.add(frameBridge);

      const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.10), frameMat);
      frameLeft.position.set(-0.44, 0.26, 1.40);
      this.movieGroup.add(frameLeft);

      const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.42, 0.10), frameMat);
      frameRight.position.set(0.44, 0.26, 1.40);
      this.movieGroup.add(frameRight);

      const cyanMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.82
      });
      const cyanLens = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.32), cyanMat);
      cyanLens.position.set(-0.44, 0.26, 1.46);
      this.movieGroup.add(cyanLens);

      const redMat = new THREE.MeshStandardMaterial({
        color: 0xff0044,
        roughness: 0.1,
        metalness: 0.8,
        transparent: true,
        opacity: 0.82
      });
      const redLens = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.32), redMat);
      redLens.position.set(0.44, 0.26, 1.46);
      this.movieGroup.add(redLens);

      const tubCanvas = document.createElement('canvas');
      tubCanvas.width = 512; tubCanvas.height = 512;
      const tctx = tubCanvas.getContext('2d');
      tctx.fillStyle = '#f8fafc'; tctx.fillRect(0, 0, 512, 512);
      tctx.fillStyle = '#dc2626';
      for (let s = 0; s < 512; s += 64) tctx.fillRect(s, 0, 32, 512);
      tctx.fillStyle = '#fbbf24';
      tctx.beginPath(); tctx.ellipse(256, 256, 170, 75, 0, 0, Math.PI * 2); tctx.fill();
      tctx.lineWidth = 8; tctx.strokeStyle = '#b45309'; tctx.stroke();
      tctx.fillStyle = '#1c1917'; tctx.font = '900 48px sans-serif'; tctx.textAlign = 'center'; tctx.textBaseline = 'middle';
      tctx.fillText('POPCORN', 256, 256);
      const tubTex = new THREE.CanvasTexture(tubCanvas);

      const tubGeo = new THREE.CylinderGeometry(0.65, 0.48, 1.1, 20);
      const tubMat = new THREE.MeshStandardMaterial({ map: tubTex, roughness: 0.45 });
      this.popcornTub = new THREE.Mesh(tubGeo, tubMat);
      this.popcornTub.position.set(1.05, -0.92, 1.05);
      this.popcornTub.rotation.set(-0.25, -0.35, -0.18);
      this.rootGroup.add(this.popcornTub);
      this.popcornTub.visible = false;

      this.popcornKernels = [];
      const kernelGeo = new THREE.DodecahedronGeometry(0.085, 1);
      const kernelMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.65 });
      for (let k = 0; k < 6; k++) {
        const mesh = new THREE.Mesh(kernelGeo, kernelMat);
        this.rootGroup.add(mesh);
        mesh.visible = false;
        this.popcornKernels.push({ mesh, offset: k * (1 / 6) });
      }

      this.popcornCrumbs = [];
      const crumbGeo = new THREE.TetrahedronGeometry(0.035, 0);
      for (let c = 0; c < 12; c++) {
        const mesh = new THREE.Mesh(crumbGeo, kernelMat);
        this.rootGroup.add(mesh);
        mesh.visible = false;
        this.popcornCrumbs.push({ mesh, active: false, vx: 0, vy: 0, vz: 0, born: 0 });
      }

      // ==========================================
      // 2. WAKE UP PROPS: Floating Zzz Text
      // ==========================================
      this.zzzSprites = [];
      const zzzCanvas = document.createElement('canvas');
      zzzCanvas.width = 128; zzzCanvas.height = 128;
      const zctx = zzzCanvas.getContext('2d');
      zctx.font = 'bold 84px sans-serif';
      zctx.fillStyle = '#60a5fa';
      zctx.shadowColor = '#3b82f6';
      zctx.shadowBlur = 12;
      zctx.textAlign = 'center';
      zctx.textBaseline = 'middle';
      zctx.fillText('Z', 64, 64);
      const zzzTex = new THREE.CanvasTexture(zzzCanvas);
      const zzzMat = new THREE.SpriteMaterial({ map: zzzTex, transparent: true, opacity: 0 });

      for (let z = 0; z < 4; z++) {
        const sp = new THREE.Sprite(zzzMat.clone());
        sp.scale.set(0.45, 0.45, 1);
        this.rootGroup.add(sp);
        sp.visible = false;
        this.zzzSprites.push({ sprite: sp, phase: z * 0.25 });
      }

      // ==========================================
      // 3. DIGGING & SCREEN DIVE PROPS: Portal & Debris
      // ==========================================
      this.diggingGroup = new THREE.Group();
      this.rootGroup.add(this.diggingGroup);
      this.diggingGroup.visible = false;

      const portalGeo = new THREE.RingGeometry(0.5, 1.45, 32);
      const portalMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85
      });
      this.portalMesh = new THREE.Mesh(portalGeo, portalMat);
      this.portalMesh.rotation.x = -Math.PI * 0.5;
      this.portalMesh.position.set(0, -1.2, -0.6);
      this.diggingGroup.add(this.portalMesh);

      const rimGeo = new THREE.TorusGeometry(1.45, 0.04, 8, 32);
      const rimMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee });
      this.portalRim = new THREE.Mesh(rimGeo, rimMat);
      this.portalRim.rotation.x = -Math.PI * 0.5;
      this.portalRim.position.set(0, -1.2, -0.6);
      this.diggingGroup.add(this.portalRim);

      this.debrisItems = [];
      const folderMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });
      const folderGeo = new THREE.BoxGeometry(0.24, 0.18, 0.04);
      const binaryMat = new THREE.MeshStandardMaterial({
        color: 0x22d3ee,
        emissive: 0x0891b2,
        emissiveIntensity: 0.6,
        roughness: 0.2
      });
      const binaryGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

      for (let d = 0; d < 18; d++) {
        const isFolder = d % 2 === 0;
        const mesh = new THREE.Mesh(isFolder ? folderGeo : binaryGeo, isFolder ? folderMat : binaryMat);
        mesh.visible = false;
        this.diggingGroup.add(mesh);
        this.debrisItems.push({
          mesh,
          seed: d * 0.4,
          speed: 1.8 + Math.random() * 1.6,
          ang: Math.random() * Math.PI * 2,
          rotVel: (Math.random() - 0.5) * 8
        });
      }

      // ==========================================
      // 4. CREEPY HORROR PROPS: Writhing Tendrils
      // ==========================================
      this.creepyGroup = new THREE.Group();
      this.headGroup.add(this.creepyGroup);
      this.creepyGroup.visible = false;

      this.tendrils = [];
      const tendrilMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.15,
        metalness: 0.95
      });

      for (let t = 0; t < 8; t++) {
        const ang = (t / 8) * Math.PI * 2;
        const tGroup = new THREE.Group();
        tGroup.position.set(Math.cos(ang) * 1.15, Math.sin(ang) * 1.15, -0.4);

        let parent = tGroup;
        const segments = [];
        for (let s = 0; s < 4; s++) {
          const segGeo = new THREE.ConeGeometry(0.12 * (1 - s * 0.2), 0.75, 6);
          segGeo.rotateX(Math.PI * 0.5);
          const segMesh = new THREE.Mesh(segGeo, tendrilMat);
          segMesh.position.z = s === 0 ? 0 : 0.65;
          parent.add(segMesh);
          segments.push(segMesh);
          parent = segMesh;
        }

        this.creepyGroup.add(tGroup);
        this.tendrils.push({ group: tGroup, segments, baseAng: ang });
      }

      // ==========================================
      // 5. CODING PROPS: Mechanical Keyboard & HUD
      // ==========================================
      this.codingGroup = new THREE.Group();
      this.rootGroup.add(this.codingGroup);
      this.codingGroup.visible = false;

      const kbGeo = new THREE.BoxGeometry(2.4, 0.16, 1.25);
      const kbMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.35, metalness: 0.4 });
      const kb = new THREE.Mesh(kbGeo, kbMat);
      kb.position.set(0, -1.25, 1.1);
      kb.rotation.x = -0.32;
      this.codingGroup.add(kb);

      this.keycaps = [];
      const keyGeo = new THREE.BoxGeometry(0.15, 0.08, 0.15);
      const keyMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x15803d,
        emissiveIntensity: 0.5,
        roughness: 0.2
      });

      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 10; c++) {
          const key = new THREE.Mesh(keyGeo, keyMat.clone());
          const kx = -0.9 + c * 0.20;
          const kz = -0.38 + r * 0.25;
          key.position.set(kx, 0.10, kz);
          kb.add(key);
          this.keycaps.push({ mesh: key, baseZ: kz, seed: (r * 10 + c) * 0.6 });
        }
      }

      this.hudCanvas = document.createElement('canvas');
      this.hudCanvas.width = 512; this.hudCanvas.height = 256;
      this.hudCtx = this.hudCanvas.getContext('2d');
      this.hudTex = new THREE.CanvasTexture(this.hudCanvas);

      const hudGeo = new THREE.PlaneGeometry(2.3, 1.15);
      const hudMat = new THREE.MeshBasicMaterial({
        map: this.hudTex,
        transparent: true,
        opacity: 0.90,
        side: THREE.DoubleSide
      });
      this.hudMesh = new THREE.Mesh(hudGeo, hudMat);
      this.hudMesh.position.set(0, -0.45, 1.6);
      this.hudMesh.rotation.x = -0.22;
      this.codingGroup.add(this.hudMesh);

      this.hudLines = [
        "$ verity --daemon-attach",
        "[OK] Desktop hooks established",
        "$ kokoro-tts --device cuda:0 --stream",
        "$ cargo build --release --quiet",
        ">> 148,291 inodes indexed [4ms]"
      ];
      this.lastHudUpdate = 0;

      // ==========================================
      // 6. BOX BREAKOUT PROPS: 3D Shattered Bezel Shards & Kinetic Shockwave Ring
      // ==========================================
      this.breakoutGroup = new THREE.Group();
      this.rootGroup.add(this.breakoutGroup);
      this.breakoutGroup.visible = false;
      this.breakoutImpactFired = false;

      const shardGoldMat = new THREE.MeshStandardMaterial({
        color: 0xffee00,
        emissive: 0xffaa00,
        emissiveIntensity: 0.65,
        roughness: 0.15,
        metalness: 0.6
      });
      const shardGlassMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        emissive: 0x38bdf8,
        emissiveIntensity: 0.35,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.88
      });

      this.breakoutShards = [];
      for (let i = 0; i < 28; i++) {
        const isGold = i % 3 === 0;
        const w = 0.08 + Math.random() * 0.18;
        const h = 0.06 + Math.random() * 0.16;
        const d = 0.02 + Math.random() * 0.04;
        const sMesh = new THREE.Mesh(
          new THREE.BoxGeometry(w, h, d),
          isGold ? shardGoldMat : shardGlassMat
        );
        const angle = (i / 28) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const speed = 2.2 + Math.random() * 3.4;
        this.breakoutGroup.add(sMesh);
        this.breakoutShards.push({
          mesh: sMesh,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed + 1.2,
          vz: 1.8 + Math.random() * 2.5,
          rx: (Math.random() - 0.5) * 14,
          ry: (Math.random() - 0.5) * 14,
          rz: (Math.random() - 0.5) * 14
        });
      }

      const ringGeo = new THREE.RingGeometry(0.85, 1.02, 32);
      this.shockwaveMat = new THREE.MeshBasicMaterial({
        color: 0xffee00,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      this.shockwaveRing = new THREE.Mesh(ringGeo, this.shockwaveMat);
      this.shockwaveRing.position.set(0, 0.25, 1.45);
      this.breakoutGroup.add(this.shockwaveRing);

      // ==========================================
      // 7. SUB-AGENT SATELLITE: 3D Orbiting Quantum Companion Sphere
      // ==========================================
      this.subAgentGroup = new THREE.Group();
      this.rootGroup.add(this.subAgentGroup);
      this.subAgentGroup.visible = false;
      this.subAgentOrbitAngle = 0;
      this.subAgentTargetScale = 0;
      this.subAgentScale = 0;
      this.subAgentIsSpeaking = false;

      // Satellite Sphere Geometry (Radius 0.32, glowing cyan/amethyst glass)
      const satGeo = new THREE.SphereGeometry(0.32, 24, 24);
      this.satMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.85,
        roughness: 0.12,
        metalness: 0.88,
        transparent: true,
        opacity: 0.92
      });
      this.subAgentMesh = new THREE.Mesh(satGeo, this.satMat);
      this.subAgentGroup.add(this.subAgentMesh);

      // Satellite Orbit Torus Halo
      const satRingGeo = new THREE.TorusGeometry(0.46, 0.018, 16, 48);
      const satRingMat = new THREE.MeshBasicMaterial({
        color: 0x818cf8,
        transparent: true,
        opacity: 0.85
      });
      this.subAgentRing = new THREE.Mesh(satRingGeo, satRingMat);
      this.subAgentRing.rotation.x = Math.PI * 0.35;
      this.subAgentMesh.add(this.subAgentRing);

      // Satellite Point Light (Cast radiant light onto main sphere)
      this.satLight = new THREE.PointLight(0x38bdf8, 1.4, 4.0);
      this.subAgentMesh.add(this.satLight);
    }

    _initPointerControls() {
      if (!this.options.mouseTrack) return;
      const el = this.renderer.domElement;
      let isDragging = false;
      let lastX = 0, lastY = 0;
      let downTime = 0;
      let downPos = { x: 0, y: 0 };
      let lastTapTime = 0;
      let holdTimer = null;

      el.addEventListener('pointerdown', (e) => {
        isDragging = true;
        downTime = performance.now();
        downPos = { x: e.clientX, y: e.clientY };
        lastX = e.clientX;
        lastY = e.clientY;
        try { el.setPointerCapture(e.pointerId); } catch (_) {}

        // Gesture: Press & Hold on Sphere (>360ms) triggers Sub-Agent Whisper
        clearTimeout(holdTimer);
        holdTimer = setTimeout(() => {
          if (isDragging) {
            window.dispatchEvent(new CustomEvent('verity:gesture:subagent-hold', { detail: { x: downPos.x, y: downPos.y } }));
          }
        }, 360);
      });

      window.addEventListener('pointermove', (e) => {
        if (!this.options.mouseTrack) return;
        if (isDragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 8) {
            clearTimeout(holdTimer);
          }
          this.targetRotY = Math.max(-0.85, Math.min(0.85, this.targetRotY + dx * 0.009));
          this.targetRotX = Math.max(-0.65, Math.min(0.65, this.targetRotX + dy * 0.009));
          lastX = e.clientX;
          lastY = e.clientY;
        } else if (!this._globalGaze) {
          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const nx = (e.clientX - (rect.left + rect.width * 0.5)) / (window.innerWidth * 0.45);
            const ny = (e.clientY - (rect.top + rect.height * 0.5)) / (window.innerHeight * 0.45);
            this.targetRotY = Math.max(-1, Math.min(1, nx)) * 0.36;
            this.targetRotX = Math.max(-1, Math.min(1, ny)) * 0.24;
          }
        }
      });

      const stopDrag = (e) => {
        clearTimeout(holdTimer);
        if (isDragging) {
          const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
          const elapsed = performance.now() - downTime;
          if (dist < 10 && elapsed < 320) {
            const now = performance.now();
            if (now - lastTapTime < 340) {
              // Gesture: Double-Tap/Double-Click on Sphere triggers Sub-Agent
              window.dispatchEvent(new CustomEvent('verity:gesture:subagent-toggle', { detail: { x: e.clientX, y: e.clientY } }));
              lastTapTime = 0;
            } else {
              lastTapTime = now;
            }
          }
        }
        isDragging = false;
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
      };
      window.addEventListener('pointerup', stopDrag);
      window.addEventListener('pointercancel', stopDrag);

      el.addEventListener('contextmenu', (e) => {
        // Gesture: Right-click on sphere toggles Sub-Agent
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('verity:gesture:subagent-toggle', { detail: { x: e.clientX, y: e.clientY } }));
      });
    }

    setSubAgentActive(active = true) {
      this.subAgentTargetScale = active ? 1.0 : 0.0;
      if (active) this.subAgentGroup.visible = true;
    }

    setSubAgentSpeaking(isSpeaking = true) {
      this.subAgentIsSpeaking = Boolean(isSpeaking);
    }

    isSubAgentActive() {
      return this.subAgentTargetScale > 0.5;
    }

    setExpression(idOrIndex) {
      let idx = -1;
      // Expressions can arrive through JSON/IPC bridges, which may encode an
      // index as a string. Normalize those values before applying the same
      // bounds check used for numeric callers.
      const numericIndex = typeof idOrIndex === 'number' ? idOrIndex
        : (typeof idOrIndex === 'string' && /^\d+$/.test(idOrIndex) ? Number(idOrIndex) : null);
      if (numericIndex !== null) {
        if (!Number.isInteger(numericIndex) || numericIndex < 0 || numericIndex >= EXPRESSIONS.length) return null;
        idx = numericIndex;
      } else {
        idx = EXPRESSIONS.findIndex(e => e.id === idOrIndex);
      }
      if (idx === -1) return null;

      const expr = EXPRESSIONS[idx];
      this.currentExprIndex = idx;
      this.targetExpr = Object.assign({}, expr);

      this.currentExpr.id = expr.id;
      this.currentExpr.name = expr.name;
      this.currentExpr.style = expr.style;
      this.currentExpr.eyeType = expr.eyeType;
      this.currentExpr.mouthStyle = expr.mouthStyle;

      // Impulse on jaw spring when switching expression
      this.jawVelocity += 0.18;
      return expr;
    }

    setAnimationMode(mode) {
      if (this.animMode === mode) return;
      this.animMode = mode || 'none';
      this.animStartTime = performance.now();

      this.movieGroup.visible = (this.animMode === 'movie');
      this.popcornTub.visible = (this.animMode === 'movie');
      this.popcornKernels.forEach(k => { k.mesh.visible = (this.animMode === 'movie'); });
      this.popcornCrumbs.forEach(c => { c.mesh.visible = false; c.active = false; });

      this.diggingGroup.visible = (this.animMode === 'digging');
      this.debrisItems.forEach(d => { d.mesh.visible = (this.animMode === 'digging'); });

      this.creepyGroup.visible = (this.animMode === 'creepy');
      this.codingGroup.visible = (this.animMode === 'coding');
      this.zzzSprites.forEach(z => { z.sprite.visible = (this.animMode === 'wakeup'); });

      if (this.breakoutGroup) {
        this.breakoutGroup.visible = (this.animMode === 'breakout');
        this.breakoutImpactFired = false;
        this.breakoutShards.forEach(s => {
          s.mesh.position.set(0, 0.2, 1.35);
          s.mesh.rotation.set(0, 0, 0);
          s.mesh.visible = false;
        });
        if (this.shockwaveMat) this.shockwaveMat.opacity = 0;
        if (this.shockwaveRing) this.shockwaveRing.scale.set(0.2, 0.2, 1);
      }

      if (this.animMode === 'breakout') {
        this.setExpression(3); // 04. Manic Wide Grin
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('verity:breakout-state', { detail: { active: true, phase: 'charge' } }));
        }
      } else {
        if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
          window.dispatchEvent(new CustomEvent('verity:breakout-state', { detail: { active: false, phase: 'contained' } }));
        }
      }

      if (this.animMode === 'creepy') {
        this.targetExpr = Object.assign({}, EXPRESSIONS[9]); // Unhinged Sketch Grin
        this.currentExpr.eyeType = EXPRESSIONS[9].eyeType;
        this.currentExpr.mouthStyle = EXPRESSIONS[9].mouthStyle;
        this.horrorLight.intensity = 5.2;
        this.terminalLight.intensity = 0;
      } else if (this.animMode === 'coding') {
        this.horrorLight.intensity = 0;
        this.terminalLight.intensity = 4.0;
      } else {
        this.horrorLight.intensity = 0;
        this.terminalLight.intensity = 0;
      }
    }

    playBehavior(animId, options = {}) {
      if (!this.behaviorEngine) {
        const Engine = (typeof VerityAnimations !== 'undefined') ? VerityAnimations.BehavioralEngine : (typeof window !== 'undefined' && window.VerityAnimations ? window.VerityAnimations.BehavioralEngine : null);
        if (Engine) this.behaviorEngine = new Engine(this);
      }
      if (this.behaviorEngine) {
        return this.behaviorEngine.play(animId, options);
      }
      return false;
    }

    stopBehavior() {
      if (this.behaviorEngine) {
        this.behaviorEngine.stop();
      }
    }

    /**
     * Spring-damper mandible jaw physics + real-time WebAudio RMS & sibilant consonant closure
     */
    _updateJawPhysics(now, dt) {
      const e = this.currentExpr;
      let targetJaw = e.restOpen;
      let targetWidth = 0;
      let clenchForce = 0;
      let viseme = 'REST';
      let speakingNow = this.isSpeaking;

      const activeAnalyser = this.analyser || (this.isSpeaking ? this.synthAnalyser : null);
      if (activeAnalyser) {
        activeAnalyser.getByteTimeDomainData(this.timeData);
        activeAnalyser.getByteFrequencyData(this.freqData);

        let sumSq = 0;
        for (let i = 0; i < this.timeData.length; i++) {
          const v = (this.timeData[i] - 128) / 128;
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / this.timeData.length);

        let low = 0, mid = 0, high = 0;
        for (let i = 2; i < 12; i++) low += this.freqData[i];
        for (let i = 12; i < 36; i++) mid += this.freqData[i];
        for (let i = 36; i < 72; i++) high += this.freqData[i];
        low /= (10 * 255);
        mid /= (24 * 255);
        high /= (36 * 255);

        if (rms > 0.018 || low > 0.04) {
          speakingNow = true;
          const audioJaw = Math.min(1.0, Math.pow(rms * 4.4, 1.12));
          // High-frequency sibilance (S/T/F/Z) snaps the teeth closed!
          const sibilantRatio = high / Math.max(0.05, low + mid);
          if (sibilantRatio > 0.62 && audioJaw < 0.48) {
            targetJaw = Math.min(0.10, audioJaw * 0.30);
            clenchForce = 0.92;
            viseme = 'SZ';
          } else {
            targetJaw = audioJaw;
            targetWidth = Math.max(-0.35, Math.min(0.32, (mid - low * 0.8) * 1.1));
            viseme = targetWidth < -0.10 ? 'OO' : (targetWidth > 0.12 ? 'EE' : 'AA');
          }
        } else {
          // Brief consonant/pause dip between syllables -> snap jaw closed toward 0
          targetJaw = this.isSpeaking ? 0.02 : e.restOpen;
          clenchForce = this.isSpeaking ? 0.75 : 0.0;
        }
      } else if (this.isSpeaking) {
        // Fallback procedural syllable oscillation when using browser speechSynthesis
        const syllableWave = Math.sin(now * 0.028) * Math.cos(now * 0.013);
        if (syllableWave < -0.2) {
          targetJaw = 0.02;
          clenchForce = 0.85;
          viseme = 'MBP';
        } else {
          targetJaw = Math.max(0.18, Math.abs(syllableWave) * 0.78);
          viseme = 'AA';
        }
      }

      this.activeViseme = viseme;

      const stiffness = clenchForce > 0.5 ? 420 : 310;
      const damping = 24;
      const force = (targetJaw - this.jawOpen) * stiffness;
      this.jawVelocity = (this.jawVelocity + force * dt) * Math.exp(-damping * dt);
      this.jawOpen = Math.max(0, Math.min(1.05, this.jawOpen + this.jawVelocity * dt));

      this.lipWidthMod += (targetWidth - this.lipWidthMod) * 0.32;
      this.teethClench += (clenchForce - this.teethClench) * 0.35;
    }

    /**
     * Renders the 2D expression artwork onto the transparent face texture canvas
     * (100% faithful to the 15-expression reference sheet)
     */
    _renderFaceTexture(now) {
      const ctx = this.texCtx;
      const W = this.texSize;
      const H = this.texSize;
      ctx.clearRect(0, 0, W, H);

      const e = this.currentExpr;
      const jaw = this.jawOpen;
      const cx = W * 0.5;
      const cy = H * 0.5;

      // 1. Deep Bruised Eye Socket Shading (Uncanny & Dark expressions)
      if (e.eyeAura > 0.02) {
        const leftX = cx - W * 0.114;
        const rightX = cx + W * 0.114;
        const eyeY = cy - H * 0.112;
        const isDark = e.style === 'dark';
        const rad = W * (0.10 + e.eyeAura * 0.055);

        [leftX, rightX].forEach((ex) => {
          const grad = ctx.createRadialGradient(ex, eyeY, rad * 0.08, ex, eyeY + H * 0.015, rad);
          const alpha = Math.min(0.92, e.eyeAura * 0.88);
          if (isDark) {
            grad.addColorStop(0, `rgba(42, 32, 6, ${alpha})`);
            grad.addColorStop(0.55, `rgba(95, 74, 10, ${alpha * 0.55})`);
          } else {
            // Arterial maroon/purple-brown socket bruising (matches Faces 3, 4, 9, 10)
            grad.addColorStop(0, `rgba(58, 6, 12, ${alpha})`);
            grad.addColorStop(0.45, `rgba(115, 22, 26, ${alpha * 0.72})`);
            grad.addColorStop(0.75, `rgba(155, 52, 32, ${alpha * 0.35})`);
          }
          grad.addColorStop(1, 'rgba(255, 238, 0, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ex, eyeY, rad, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. Eyes
      const eyeSpacing = W * 0.112;
      const eyeY = cy - H * 0.115;
      this._drawEyes(ctx, cx, eyeY, eyeSpacing, W, H, e, this.blinkAmount, now);

      // 3. Mouth & Anatomical Teeth
      const mouthY = cy + H * 0.112;
      this._drawMouth(ctx, cx, mouthY, W, H, e, jaw, now);

      this.faceTexture.needsUpdate = true;
    }

    _drawEyes(ctx, cx, eyeY, spacing, W, H, e, blink, now) {
      ctx.save();
      ctx.fillStyle = '#060606';
      ctx.strokeStyle = '#060606';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const jx = e.horrorLevel > 0.5 ? Math.sin(now * 0.09) * W * 0.0025 * e.horrorLevel : 0;
      const jy = e.horrorLevel > 0.5 ? Math.cos(now * 0.11) * H * 0.0025 * e.horrorLevel : 0;
      const leftX = cx - spacing + jx;
      const rightX = cx + spacing - jx;

      if (e.eyeType === 'closed_arc' || (blink > 0.86 && e.horrorLevel < 0.7)) {
        ctx.lineWidth = W * 0.021;
        [leftX, rightX].forEach((ex) => {
          ctx.beginPath();
          ctx.arc(ex, eyeY - H * 0.014, W * 0.045, 0.15 * Math.PI, 0.85 * Math.PI, false);
          ctx.stroke();
        });
      } else if (e.eyeType === 'half_lid') {
        const ew = W * 0.035;
        const eh = H * 0.044 * (1 - blink * 0.85);
        [leftX, rightX].forEach((ex) => {
          ctx.save();
          ctx.beginPath();
          ctx.rect(ex - ew * 1.3, eyeY - eh * 0.22, ew * 2.6, eh * 1.5);
          ctx.clip();
          ctx.beginPath();
          ctx.ellipse(ex, eyeY, ew, eh, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          ctx.lineWidth = W * 0.015;
          ctx.beginPath();
          ctx.moveTo(ex - ew * 1.12, eyeY - eh * 0.20);
          ctx.lineTo(ex + ew * 1.12, eyeY - eh * 0.20);
          ctx.stroke();
        });
      } else if (e.eyeType === 'strained_sweat') {
        // Face 12: Agonized furrowed brows, squinting eyes, bridge veins, and black sweat drops
        ctx.lineWidth = W * 0.018;
        ctx.beginPath();
        ctx.moveTo(leftX - W * 0.052, eyeY - H * 0.038);
        ctx.lineTo(leftX + W * 0.028, eyeY - H * 0.004);
        ctx.lineTo(leftX - W * 0.038, eyeY + H * 0.020);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(rightX - W * 0.028, eyeY - H * 0.038);
        ctx.lineTo(rightX + W * 0.055, eyeY + H * 0.008);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(rightX + W * 0.004, eyeY + H * 0.003, W * 0.020, H * 0.028, -0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = W * 0.011;
        ctx.beginPath();
        ctx.moveTo(cx - W * 0.015, eyeY - H * 0.045);
        ctx.lineTo(cx - W * 0.024, eyeY + H * 0.022);
        ctx.moveTo(cx + W * 0.015, eyeY - H * 0.014);
        ctx.lineTo(cx + W * 0.026, eyeY + H * 0.026);
        ctx.stroke();

        ctx.beginPath();
        ctx.ellipse(leftX - W * 0.054, eyeY + H * 0.010, W * 0.010, H * 0.022, 0.22, 0, Math.PI * 2);
        ctx.ellipse(leftX - W * 0.032, eyeY + H * 0.035, W * 0.009, H * 0.018, -0.12, 0, Math.PI * 2);
        ctx.fill();
      } else if (e.eyeType.startsWith('dark_')) {
        // Faces 13, 14, 15: Sunken pitch-black horizontal eye pits with piercing white pinpoint pupils
        const isSlit = e.eyeType === 'dark_slit';
        [leftX, rightX].forEach((ex, i) => {
          const tilt = isSlit ? 0 : (i === 0 ? -0.12 : 0.12);
          ctx.save();
          ctx.translate(ex, eyeY + jy);
          ctx.rotate(tilt);

          ctx.strokeStyle = 'rgba(20, 16, 4, 0.45)';
          ctx.lineWidth = W * 0.008;
          ctx.beginPath();
          ctx.arc(0, H * 0.005, W * 0.052, 0.2 * Math.PI, 0.8 * Math.PI);
          ctx.stroke();

          ctx.fillStyle = '#050505';
          ctx.strokeStyle = '#050505';
          ctx.beginPath();
          ctx.ellipse(0, 0, W * 0.060, H * (isSlit ? 0.018 : 0.028), 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.lineWidth = W * 0.017;
          ctx.beginPath();
          ctx.moveTo(-W * 0.070, -H * 0.010);
          ctx.lineTo(W * 0.070, -H * 0.010);
          ctx.stroke();

          if (!isSlit) {
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.arc(jx * 1.5, H * 0.002, W * 0.009, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        });
      } else {
        // Vertical Oval Eyes (Friendly + Uncanny Abyssal)
        const isAbyss = e.eyeType === 'oval_abyss' || e.eyeType === 'oval_manic';
        const isUncanny = isAbyss || e.eyeType === 'oval_uncanny';
        const sc = e.eyeType === 'oval_abyss' ? 1.24 : (e.eyeType === 'oval_manic' ? 1.16 : (e.eyeType === 'oval_quirk' ? 0.88 : 1.0));
        const effectiveBlink = e.horrorLevel > 0.65 ? 0 : blink;
        const pScale = (this.animPupilScale !== undefined) ? this.animPupilScale : 1.0;
        const ew = W * 0.033 * sc * pScale;
        const eh = H * 0.053 * sc * (1 - effectiveBlink * 0.88) * (pScale < 0.65 ? pScale : 1.0);

        [leftX, rightX].forEach((ex, idx) => {
          if (isUncanny) {
            ctx.fillStyle = '#38070c';
            ctx.beginPath();
            ctx.ellipse(ex, eyeY + jy, ew * 1.22, eh * 1.18, 0, 0, Math.PI * 2);
            ctx.fill();

            if (e.horrorLevel > 0.75) {
              ctx.strokeStyle = 'rgba(45, 5, 10, 0.55)';
              ctx.lineWidth = W * 0.004;
              for (let k = 0; k < 6; k++) {
                const ang = (k / 6) * Math.PI * 2 + now * 0.001;
                ctx.beginPath();
                ctx.moveTo(ex + Math.cos(ang) * ew, eyeY + Math.sin(ang) * eh);
                ctx.lineTo(ex + Math.cos(ang) * ew * 1.85, eyeY + Math.sin(ang) * eh * 1.65);
                ctx.stroke();
              }
            }
          }

          ctx.fillStyle = '#050505';
          ctx.beginPath();
          ctx.ellipse(ex, eyeY + jy, ew, eh, 0, 0, Math.PI * 2);
          ctx.fill();

          if (e.eyeType === 'oval_quirk' && idx === 1) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(ex + ew * 0.85, eyeY - eh * 0.25, ew * 0.28, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        });
      }

      if (this.animSweatDrops) {
        ctx.fillStyle = '#060606';
        const swTime = now * 0.003;
        const dropY1 = eyeY - H * 0.02 + Math.sin(swTime) * H * 0.025;
        const dropY2 = eyeY + Math.cos(swTime * 1.3) * H * 0.020;
        ctx.beginPath();
        ctx.ellipse(leftX - W * 0.052, dropY1, W * 0.008, H * 0.016, 0.15, 0, Math.PI * 2);
        ctx.ellipse(rightX + W * 0.052, dropY2, W * 0.008, H * 0.016, -0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    _drawMouth(ctx, cx, mouthY, W, H, e, jaw, now) {
      ctx.save();
      ctx.strokeStyle = '#060606';
      ctx.fillStyle = '#060606';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const halfW = W * Math.max(0.14, e.restWidth * 0.5 + this.lipWidthMod * 0.16);
      const curveH = H * e.restCurve * 0.25;

      if (e.mouthStyle.startsWith('toothy_')) {
        this._drawHorrorToothyMouth(ctx, cx, mouthY, W, H, halfW, jaw, e, now);
        ctx.restore();
        return;
      }

      if (e.mouthStyle === 'asymmetric_shock') {
        this._drawShockMouth(ctx, cx, mouthY, W, H, halfW, jaw);
        ctx.restore();
        return;
      }

      if (e.style === 'dark') {
        if (e.mouthStyle === 'scream_void' || jaw > 0.30) {
          this._drawScreamMouth(ctx, cx, mouthY, W, H, halfW, jaw);
        } else if (e.mouthStyle === 'small_oval' || jaw > 0.06) {
          const ow = Math.max(W * 0.065, halfW * (0.85 + this.lipWidthMod * 0.35));
          const oh = H * (0.018 + jaw * 0.18);
          ctx.beginPath();
          ctx.ellipse(cx, mouthY + H * 0.03, ow, oh, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.lineWidth = W * 0.018;
          ctx.beginPath();
          ctx.moveTo(cx - halfW, mouthY + H * 0.045);
          ctx.quadraticCurveTo(cx, mouthY + H * 0.018, cx + halfW, mouthY + H * 0.028);
          ctx.stroke();
        }
        ctx.restore();
        return;
      }

      if (jaw > 0.07) {
        this._drawOpenSpeakingMouth(ctx, cx, mouthY, W, H, halfW, curveH, jaw, e);
      } else {
        this._drawClosedSmileLine(ctx, cx, mouthY, W, H, halfW, curveH, e);
      }

      ctx.restore();
    }

    _drawHorrorToothyMouth(ctx, cx, mouthY, W, H, halfW, jaw, e, now) {
      const w = halfW * 1.08;
      const leftX = cx - w;
      const rightX = cx + w;

      const cornerLift = e.horrorLevel > 0.8 ? H * 0.125 : H * 0.10;
      const cornerY = mouthY - cornerLift;
      const topMidY = mouthY + H * 0.008;

      const clenchHeight = H * (e.mouthStyle === 'toothy_manic' ? 0.24 : 0.21);
      const jawDropH = jaw * H * 0.22;
      const botMidY = topMidY + clenchHeight + jawDropH;

      ctx.save();

      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topMidY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX - W * 0.01, botMidY + H * 0.02,
        leftX + W * 0.01, botMidY + H * 0.02,
        leftX, cornerY
      );
      ctx.closePath();
      ctx.fillStyle = '#050505';
      ctx.fill();

      ctx.save();
      ctx.clip();

      if (jaw > 0.12) {
        const throatGrad = ctx.createRadialGradient(cx, topMidY + clenchHeight * 0.55 + jawDropH * 0.4, W * 0.02, cx, topMidY + clenchHeight * 0.55 + jawDropH * 0.4, w * 0.65);
        throatGrad.addColorStop(0, '#3a060b');
        throatGrad.addColorStop(0.6, '#180305');
        throatGrad.addColorStop(1, '#050505');
        ctx.fillStyle = throatGrad;
        ctx.fillRect(leftX, cornerY, w * 2, botMidY - cornerY + H * 0.1);
      }

      const teethSpanStart = leftX + (rightX - leftX) * 0.065;
      const teethSpanEnd = rightX - (rightX - leftX) * 0.065;
      const teethTotalW = teethSpanEnd - teethSpanStart;

      let curX = teethSpanStart;
      for (let i = 0; i < 12; i++) {
        const weight = TOOTH_WIDTH_WEIGHTS[i];
        const tw = (weight / TOOTH_WEIGHT_SUM) * teethTotalW;
        const x0 = curX;
        const x1 = curX + tw;
        const xm = (x0 + x1) * 0.5;
        curX = x1;

        const tm = (xm - leftX) / (rightX - leftX);
        const u = 1 - tm;

        const yTopLip = u * u * cornerY + 2 * u * tm * topMidY + tm * tm * cornerY;
        const yBotLip = u * u * cornerY + 2 * u * tm * (botMidY + H * 0.012) + tm * tm * cornerY;
        const yBiteRest = u * u * cornerY + 2 * u * tm * (topMidY + clenchHeight * 0.54) + tm * tm * cornerY;

        const isCentralIncisor = (i === 5 || i === 6);
        const isCanine = (i === 3 || i === 8);
        const crownLenMod = isCentralIncisor ? 1.12 : (isCanine ? 1.06 : 0.94);

        const upperToothH = Math.max(H * 0.014, (yBiteRest - yTopLip) * crownLenMod);
        const upperBotY = yTopLip + upperToothH;

        const lowerToothH = Math.max(H * 0.012, (yBiteRest - yTopLip) * 0.86);
        const lowerTopY = Math.max(upperBotY + jaw * H * 0.02, yBotLip - lowerToothH);

        this._drawSingleAnatomicalTooth(ctx, x0, x1, yTopLip - H * 0.004, upperBotY, true, isCanine, e.horrorLevel, W, H);
        this._drawSingleAnatomicalTooth(ctx, x0, x1, lowerTopY, yBotLip + H * 0.004, false, isCanine, e.horrorLevel, W, H);
      }

      ctx.restore();

      ctx.lineWidth = W * (0.015 + e.horrorLevel * 0.007);
      ctx.strokeStyle = '#050505';
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topMidY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX - W * 0.01, botMidY + H * 0.02,
        leftX + W * 0.01, botMidY + H * 0.02,
        leftX, cornerY
      );
      ctx.stroke();

      const tick = W * (0.030 + e.horrorLevel * 0.024);
      ctx.lineWidth = W * 0.016;
      ctx.beginPath();
      ctx.moveTo(leftX - tick * 0.65, cornerY + tick * 0.65);
      ctx.quadraticCurveTo(leftX - tick * 0.1, cornerY - tick * 0.1, leftX + tick * 0.45, cornerY - tick * 0.55);
      ctx.moveTo(rightX - tick * 0.45, cornerY - tick * 0.55);
      ctx.quadraticCurveTo(rightX + tick * 0.1, cornerY - tick * 0.1, rightX + tick * 0.65, cornerY + tick * 0.65);
      ctx.stroke();

      if (e.horrorLevel > 0.55) {
        ctx.lineWidth = W * 0.0065;
        [-1, 1].forEach((side) => {
          const baseCornerX = side < 0 ? leftX : rightX;
          for (let s = 1; s <= 3; s++) {
            const offset = side * W * (0.012 * s);
            ctx.beginPath();
            ctx.moveTo(baseCornerX + offset, cornerY - H * 0.03 * s);
            ctx.quadraticCurveTo(
              baseCornerX + offset * 1.4, cornerY + H * 0.05,
              baseCornerX - side * W * 0.04, cornerY + H * 0.12 + s * H * 0.015
            );
            ctx.stroke();
          }
        });

        const scratchCount = Math.floor(18 * e.horrorLevel);
        for (let k = 0; k < scratchCount; k++) {
          const frac = (k / (scratchCount - 1)) - 0.5;
          const sx = cx + frac * w * 1.55;
          const sy = botMidY - Math.abs(frac) * H * 0.085 + H * 0.015 + (k % 2) * H * 0.008;
          ctx.beginPath();
          ctx.moveTo(sx - W * 0.018, sy);
          ctx.lineTo(sx + W * 0.018, sy + (frac > 0 ? -1 : 1) * H * 0.010);
          ctx.stroke();
        }
      }

      ctx.restore();
    }

    _drawSingleAnatomicalTooth(ctx, x0, x1, yTop, yBot, isUpper, isCanine, horrorLevel, W, H) {
      const tw = x1 - x0;
      const th = yBot - yTop;
      if (th < 2) return;

      const xm = (x0 + x1) * 0.5;
      const pad = tw * 0.04;

      ctx.fillStyle = horrorLevel > 0.7 ? '#FAF8F0' : '#FFFFFF';
      ctx.strokeStyle = '#080808';
      ctx.lineWidth = W * 0.0065;

      ctx.beginPath();
      if (isUpper) {
        const biteY = isCanine ? yBot + th * 0.10 : yBot;
        ctx.moveTo(x0 + pad, yTop);
        ctx.lineTo(x1 - pad, yTop);
        ctx.quadraticCurveTo(x1, yTop + th * 0.65, xm + tw * 0.32, biteY);
        ctx.quadraticCurveTo(xm, biteY + H * 0.004, xm - tw * 0.32, biteY);
        ctx.quadraticCurveTo(x0, yTop + th * 0.65, x0 + pad, yTop);
      } else {
        const biteY = isCanine ? yTop - th * 0.08 : yTop;
        ctx.moveTo(x0 + pad, yBot);
        ctx.lineTo(x1 - pad, yBot);
        ctx.quadraticCurveTo(x1, yBot - th * 0.65, xm + tw * 0.32, biteY);
        ctx.quadraticCurveTo(xm, biteY - H * 0.004, xm - tw * 0.32, biteY);
        ctx.quadraticCurveTo(x0, yBot - th * 0.65, x0 + pad, yBot);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#060606';
      ctx.beginPath();
      if (isUpper) {
        ctx.moveTo(x0 - tw * 0.12, yTop);
        ctx.lineTo(x0 + tw * 0.16, yTop);
        ctx.lineTo(x0, yTop + Math.min(H * 0.022, th * 0.42));
      } else {
        ctx.moveTo(x0 - tw * 0.12, yBot);
        ctx.lineTo(x0 + tw * 0.16, yBot);
        ctx.lineTo(x0, yBot - Math.min(H * 0.020, th * 0.42));
      }
      ctx.closePath();
      ctx.fill();

      if (horrorLevel > 0.45) {
        ctx.strokeStyle = 'rgba(15, 12, 10, 0.45)';
        ctx.lineWidth = W * 0.003;
        ctx.beginPath();
        if (isUpper) {
          ctx.moveTo(xm, yTop + th * 0.08);
          ctx.lineTo(xm, yTop + th * 0.48);
        } else {
          ctx.moveTo(xm, yBot - th * 0.08);
          ctx.lineTo(xm, yBot - th * 0.48);
        }
        ctx.stroke();
      }
    }

    _drawClosedSmileLine(ctx, cx, mouthY, W, H, halfW, curveH, e) {
      const leftX = cx - halfW;
      const rightX = cx + halfW;
      const cornerY = mouthY - curveH * 0.45;

      if (e.mouthStyle === 'flat_line') {
        ctx.lineWidth = W * 0.020;
        ctx.beginPath();
        ctx.moveTo(leftX, mouthY + H * 0.01);
        ctx.lineTo(rightX, mouthY - H * 0.004);
        ctx.stroke();
        return;
      }

      const isThin = e.mouthStyle === 'thin_smile';
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, mouthY + curveH * 0.82, rightX, cornerY);
      ctx.quadraticCurveTo(cx, mouthY + curveH * (isThin ? 0.92 : 1.18), leftX, cornerY);
      ctx.closePath();
      ctx.fill();

      ctx.lineWidth = isThin ? W * 0.009 : W * 0.015;
      ctx.stroke();

      const tick = isThin ? W * 0.018 : W * 0.025;
      ctx.lineWidth = isThin ? W * 0.009 : W * 0.018;
      ctx.beginPath();
      ctx.moveTo(leftX - tick * 0.6, cornerY + tick * 0.45);
      ctx.lineTo(leftX + tick * 0.5, cornerY - tick * 0.55);
      ctx.moveTo(rightX - tick * 0.5, cornerY - tick * 0.55);
      ctx.lineTo(rightX + tick * 0.6, cornerY + tick * 0.45);
      ctx.stroke();
    }

    _drawOpenSpeakingMouth(ctx, cx, mouthY, W, H, halfW, curveH, jaw, e) {
      const isRoundVowel = (this.activeViseme === 'OO' || this.activeViseme === 'OH') && (!this.isSpeaking || e.mouthStyle !== 'open_laugh');
      const w = isRoundVowel ? halfW * 0.55 : halfW * 0.94;
      const leftX = cx - w;
      const rightX = cx + w;
      const cornerY = mouthY - H * 0.042;
      const topLipY = isRoundVowel ? (cornerY - H * 0.032) : (mouthY - H * 0.012);
      const bottomDepth = H * (0.04 + jaw * 0.28);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(leftX, cornerY);
      ctx.quadraticCurveTo(cx, topLipY, rightX, cornerY);
      ctx.bezierCurveTo(
        rightX + W * 0.02, cornerY + bottomDepth * 0.96,
        leftX - W * 0.02, cornerY + bottomDepth * 0.96,
        leftX, cornerY
      );
      ctx.closePath();

      ctx.fillStyle = '#060606';
      ctx.fill();
      ctx.lineWidth = W * 0.016;
      ctx.strokeStyle = '#060606';
      ctx.stroke();

      ctx.clip();

      if (this.teethClench > 0.35 && this.isSpeaking) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(leftX, topLipY - H * 0.01, w * 2, Math.max(H * 0.022, bottomDepth * 0.28));
      }

      const tongueY = cornerY + bottomDepth * 0.74;
      ctx.fillStyle = '#F5DF00';
      ctx.strokeStyle = '#060606';
      ctx.lineWidth = W * 0.012;
      ctx.beginPath();
      ctx.ellipse(cx, tongueY + H * 0.015, w * 0.62, bottomDepth * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    _drawShockMouth(ctx, cx, mouthY, W, H, halfW, jaw) {
      const w = halfW * 0.96;
      const h = H * (0.06 + jaw * 0.18);
      const topY = mouthY - h * 0.52;
      const botY = mouthY + h * 0.68;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.60, topY + H * 0.014);
      ctx.quadraticCurveTo(cx, topY - H * 0.022, cx + w * 0.56, topY);
      ctx.lineTo(cx + w * 0.96, botY - H * 0.018);
      ctx.lineTo(cx - w * 0.92, botY + H * 0.020);
      ctx.closePath();

      ctx.fillStyle = '#060606';
      ctx.fill();
      ctx.lineWidth = W * 0.016;
      ctx.strokeStyle = '#060606';
      ctx.stroke();

      ctx.clip();
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(cx - w, topY - H * 0.02, w * 2, h * 0.32);
      ctx.lineWidth = W * 0.010;
      ctx.strokeRect(cx - w, topY - H * 0.02, w * 2, h * 0.32);

      ctx.fillStyle = '#F0DC00';
      ctx.beginPath();
      ctx.ellipse(cx + w * 0.12, botY + H * 0.01, w * 0.68, h * 0.38, -0.16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    _drawScreamMouth(ctx, cx, mouthY, W, H, halfW, jaw) {
      const w = halfW * 0.88;
      const h = H * (0.08 + jaw * 0.25);
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.moveTo(cx - w, mouthY + h * 0.48);
      ctx.bezierCurveTo(
        cx - w * 0.85, mouthY - h * 0.68,
        cx + w * 0.85, mouthY - h * 0.68,
        cx + w, mouthY + h * 0.48
      );
      ctx.quadraticCurveTo(cx, mouthY + h * 0.34, cx - w, mouthY + h * 0.48);
      ctx.closePath();
      ctx.fill();
    }

    update(now = performance.now()) {
      if (Math.abs(now - this.time) < 0.5) return;
      const dt = Math.min(0.033, Math.max(0.001, (now - this.time) / 1000));
      this.time = now;

      // 1. Update Spring-Damper Jaw Physics
      this._updateJawPhysics(now, dt);

      // 2. Smoothly interpolate expression scalars
      const lerp = 0.16;
      ['eyeAura', 'restOpen', 'restWidth', 'restCurve', 'horrorLevel'].forEach(k => {
        this.currentExpr[k] += (this.targetExpr[k] - this.currentExpr[k]) * lerp;
      });

      // 3. Auto-Blink
      if (this.options.autoBlink && now > this.nextBlinkTime) {
        const ph = (now - this.nextBlinkTime) / 140;
        if (ph <= 1) this.blinkAmount = Math.sin(ph * Math.PI);
        else { this.blinkAmount = 0; this.nextBlinkTime = now + 2400 + Math.random() * 3000; }
      }

      // Update 120 Behavioral Animations Engine
      if (!this.behaviorEngine) {
        const Engine = (typeof VerityAnimations !== 'undefined') ? VerityAnimations.BehavioralEngine : (typeof window !== 'undefined' && window.VerityAnimations ? window.VerityAnimations.BehavioralEngine : null);
        if (Engine) this.behaviorEngine = new Engine(this);
      }
      if (this.behaviorEngine) {
        this.behaviorEngine.update(now, dt);
      }

      if (this.animBlinkMod !== 0) {
        this.blinkAmount = Math.max(0, Math.min(1.0, this.blinkAmount + this.animBlinkMod));
      }

      // 4. Head Rotation & Cinematic Trajectories
      const idleY = Math.sin(now * 0.002) * 0.035;
      const idleX = Math.cos(now * 0.0016) * 0.025;
      const syllablePitchNod = this.isSpeaking ? (this.jawOpen - this.currentExpr.restOpen) * 0.08 : 0;
      let horrorTwitch = this.currentExpr.horrorLevel > 0.65
        ? (Math.sin(now * 0.095) * Math.cos(now * 0.043) * 0.016 * this.currentExpr.horrorLevel)
        : 0;

      let targetX = this.targetRotX + idleX + syllablePitchNod + (this.animRotX || 0);
      let targetY = this.targetRotY + idleY + horrorTwitch + (this.animRotY || 0);
      let targetZ = horrorTwitch * 1.4 + (this.animRotZ || 0);
      let targetPosX = (this.animPosX || 0);
      let targetPosY = (this.animPosY || 0);
      let targetPosZ = (this.animPosZ || 0);
      let targetScaleX = (this.animScaleX !== undefined ? this.animScaleX : 1);
      let targetScaleY = (this.animScaleY !== undefined ? this.animScaleY : 1);
      let targetScaleZ = (this.animScaleZ !== undefined ? this.animScaleZ : 1);

      if (this.animJawMod) {
        this.jawOpen = Math.max(0, Math.min(1.25, this.jawOpen + this.animJawMod));
      }

      const elapsed = (now - this.animStartTime) / 1000;

      if (this.animMode === 'movie') {
        targetX = -0.12;
        targetY = Math.sin(now * 0.0015) * 0.08;

        this.popcornKernels.forEach(k => {
          const prog = ((now * 0.0016 + k.offset) % 1);
          const arc = Math.sin(prog * Math.PI) * 1.15;
          const px = 1.05 + (0.0 - 1.05) * prog;
          const py = -0.80 + (-0.22 - (-0.80)) * prog + arc;
          const pz = 1.05 + (1.35 - 1.05) * prog;
          k.mesh.position.set(px, py, pz);
          k.mesh.rotation.x += dt * 5;
          k.mesh.rotation.y += dt * 4;

          if (prog > 0.88 && prog < 0.94) {
            this.jawOpen = Math.max(this.jawOpen, 0.52);
            const crumb = this.popcornCrumbs.find(c => !c.active);
            if (crumb) {
              crumb.active = true;
              crumb.mesh.visible = true;
              crumb.mesh.position.set(0, -0.25, 1.4);
              crumb.vx = (Math.random() - 0.5) * 1.2;
              crumb.vy = 0.4 + Math.random() * 0.6;
              crumb.vz = 0.8 + Math.random() * 0.5;
              crumb.born = now;
            }
          }
        });

        this.popcornCrumbs.forEach(c => {
          if (!c.active) return;
          const age = (now - c.born) / 1000;
          if (age > 0.6) { c.active = false; c.mesh.visible = false; return; }
          c.mesh.position.x += c.vx * dt;
          c.mesh.position.y += (c.vy - 9.8 * age) * dt;
          c.mesh.position.z += c.vz * dt;
        });
      } else if (this.animMode === 'wakeup') {
        const loopTime = elapsed % 6.0;
        if (loopTime < 1.8) {
          targetPosY = -0.65;
          targetX = 0.55;
          targetScaleY = 0.72;
          targetScaleX = 1.18;
          this.blinkAmount = 1.0;
          this.jawOpen = 0.02;

          this.zzzSprites.forEach((z) => {
            z.sprite.visible = true;
            const zp = ((now * 0.0008 + z.phase) % 1);
            z.sprite.position.set(0.45 + Math.sin(zp * Math.PI * 2) * 0.18, -0.3 + zp * 1.4, 0.4);
            z.sprite.material.opacity = Math.sin(zp * Math.PI) * 0.85;
          });
        } else if (loopTime < 3.8) {
          this.zzzSprites.forEach(z => { z.sprite.visible = false; });
          const yp = (loopTime - 1.8) / 2.0;
          targetPosY = 0.22 * Math.sin(yp * Math.PI);
          targetScaleY = 1.0 + Math.sin(yp * Math.PI) * 0.32;
          targetScaleX = 1.0 - Math.sin(yp * Math.PI) * 0.14;
          targetX = -0.22 * Math.sin(yp * Math.PI);
          this.jawOpen = Math.sin(yp * Math.PI) * 0.88;
          this.blinkAmount = 0.92;
        } else if (loopTime < 4.4) {
          const sh = (loopTime - 3.8) / 0.6;
          targetZ = Math.sin(sh * Math.PI * 16) * 0.28;
          targetY = Math.cos(sh * Math.PI * 16) * 0.22;
          this.jawOpen = 0.08;
          this.blinkAmount = 0.2;
        } else {
          this.blinkAmount = 0;
        }
      } else if (this.animMode === 'digging') {
        targetY = Math.PI + Math.sin(now * 0.018) * 0.25;
        targetX = 0.85;
        targetPosY = -0.75 + Math.sin(now * 0.025) * 0.12;
        targetPosZ = -0.65;
        targetScaleZ = 1.30;
        targetScaleX = 0.88;
        targetZ = Math.sin(now * 0.024) * 0.25;

        this.portalMesh.rotation.z += dt * 1.5;
        this.portalRim.rotation.z -= dt * 2.0;

        this.debrisItems.forEach((d) => {
          d.mesh.visible = true;
          const prog = ((now * 0.0015 * d.speed + d.seed) % 1);
          const r = prog * 1.4;
          const ang = d.ang + now * 0.002;
          const px = Math.cos(ang) * r;
          const py = -1.0 + Math.sin(prog * Math.PI) * 1.1;
          const pz = -0.6 + prog * 2.8;
          d.mesh.position.set(px, py, pz);
          d.mesh.rotation.x += d.rotVel * dt;
          d.mesh.rotation.y += d.rotVel * dt;
        });
      } else if (this.animMode === 'creepy') {
        const snap = Math.sin(now * 0.008);
        if (Math.abs(snap) > 0.94) {
          targetZ = (snap > 0 ? 0.34 : -0.34);
          targetX = 0.22;
        } else {
          targetZ = Math.sin(now * 0.003) * 0.12;
        }
        this.currentExpr.horrorLevel = 1.0;
        this.jawOpen = Math.max(this.jawOpen, 0.55 + Math.sin(now * 0.015) * 0.18);
        this.blinkAmount = 0.0;

        this.tendrils.forEach((t, i) => {
          const tWave = Math.sin(now * 0.006 + i * 1.2);
          t.segments.forEach((seg, sIdx) => {
            seg.rotation.x = 0.35 + tWave * (0.3 + sIdx * 0.15);
            seg.rotation.y = Math.cos(now * 0.008 + i) * 0.25;
          });
        });
      } else if (this.animMode === 'coding') {
        const typeBeat = Math.abs(Math.sin(now * 0.022));
        targetX = 0.24 + typeBeat * 0.08;
        targetPosY = -0.10 + typeBeat * 0.04;

        this.keycaps.forEach(k => {
          const isPressed = Math.sin(now * 0.035 + k.seed) > 0.65;
          k.mesh.position.y = isPressed ? 0.03 : 0.10;
          k.mesh.material.emissiveIntensity = isPressed ? 1.4 : 0.4;
        });

        if (now - this.lastHudUpdate > 320) {
          this.lastHudUpdate = now;
          const ctx = this.hudCtx;
          ctx.clearRect(0, 0, 512, 256);
          ctx.fillStyle = 'rgba(6, 78, 59, 0.45)';
          ctx.fillRect(0, 0, 512, 256);

          ctx.font = 'bold 22px monospace';
          ctx.fillStyle = '#4ade80';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 8;

          this.hudLines.push(this.hudLines.shift());
          this.hudLines.forEach((line, idx) => {
            ctx.fillText(line, 24, 46 + idx * 42);
          });
          this.hudTex.needsUpdate = true;
        }
      } else if (this.animMode === 'breakout') {
        if (elapsed < 0.42) {
          // Phase 1: Deep coiled spring wind-up inside the box
          const cProg = elapsed / 0.42;
          targetPosZ = -1.15 * Math.sin(cProg * Math.PI * 0.5);
          targetPosY = -0.45 * cProg;
          targetScaleY = 1.0 - 0.28 * cProg;
          targetScaleX = 1.0 + 0.24 * cProg;
          targetX = 0.28 * cProg;
          targetZ = Math.sin(now * 0.06) * 0.08 * cProg;
          this.jawOpen = 0.05;
        } else if (elapsed < 0.82) {
          // Phase 2: Violent upward & forward ram through the upper box bezel + 3D shard burst!
          if (!this.breakoutImpactFired) {
            this.breakoutImpactFired = true;
            this.setExpression(6); // 07. Happy Laugh / Triumphant
            this.breakoutShards.forEach(s => {
              s.mesh.visible = true;
              s.mesh.position.set((Math.random() - 0.5) * 0.5, 0.25, 1.35);
            });
            if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
              window.dispatchEvent(new CustomEvent('verity:breakout-state', { detail: { active: true, phase: 'shatter' } }));
            }
          }
          const bProg = (elapsed - 0.42) / 0.40;
          targetPosZ = 0.72 * Math.sin(bProg * Math.PI * 0.5);
          targetPosY = 0.28 * Math.sin(bProg * Math.PI);
          targetScaleY = 1.18 - bProg * 0.16;
          targetScaleX = 0.88 + bProg * 0.12;
          targetX = -0.22 * (1 - bProg) + 0.16 * bProg;
          this.jawOpen = Math.max(this.jawOpen, 0.68 * Math.sin(bProg * Math.PI));

          // Update 3D shockwave ring
          if (this.shockwaveRing && this.shockwaveMat) {
            const rScale = 0.4 + bProg * 3.4;
            this.shockwaveRing.scale.set(rScale, rScale, 1);
            this.shockwaveMat.opacity = Math.max(0, (1 - bProg) * 0.92);
          }
        } else {
          // Phase 3: Perched at the Screen Top peering down over the UI!
          const topTime = elapsed - 0.82;
          targetPosZ = 0.48 + Math.sin(topTime * 2.2) * 0.06;
          targetPosY = Math.sin(topTime * 2.8) * 0.08;
          targetX = 0.22 + Math.cos(topTime * 1.6) * 0.05; // Looking down at the desktop
          targetY = Math.sin(topTime * 1.4) * 0.28;
          targetZ = Math.sin(topTime * 2.1) * 0.08;
          if (this.shockwaveMat) this.shockwaveMat.opacity = 0;
        }

        // Simulate 3D glass & gold bezel shards flying outward with gravity
        if (this.breakoutImpactFired) {
          const shardAge = elapsed - 0.42;
          this.breakoutShards.forEach(s => {
            if (shardAge > 1.8) {
              s.mesh.visible = false;
              return;
            }
            s.mesh.position.x += s.vx * dt;
            s.mesh.position.y += (s.vy - 7.8 * shardAge) * dt;
            s.mesh.position.z += s.vz * dt;
            s.mesh.rotation.x += s.rx * dt;
            s.mesh.rotation.y += s.ry * dt;
            s.mesh.rotation.z += s.rz * dt;
          });
        }
      }

      // Smooth Lerping of Rotations & Transforms
      this.rotY += (targetY - this.rotY) * 0.16;
      this.rotX += (targetX - this.rotX) * 0.16;
      this.rotZ += (targetZ - this.rotZ) * 0.16;
      this.headGroup.rotation.set(this.rotX, this.rotY, this.rotZ);

      this.headGroup.position.x += (targetPosX - this.headGroup.position.x) * 0.18;
      this.headGroup.position.y += (targetPosY - this.headGroup.position.y) * 0.18;
      this.headGroup.position.z += (targetPosZ - this.headGroup.position.z) * 0.18;

      this.headGroup.scale.x += (targetScaleX - this.headGroup.scale.x) * 0.18;
      this.headGroup.scale.y += (targetScaleY - this.headGroup.scale.y) * 0.18;
      this.headGroup.scale.z += (targetScaleZ - this.headGroup.scale.z) * 0.18;

      // Update 3D Sub-Agent Satellite Orbit & Pulsing
      if (this.subAgentGroup) {
        this.subAgentScale += (this.subAgentTargetScale - this.subAgentScale) * 0.14;
        if (this.subAgentScale > 0.01) {
          this.subAgentGroup.visible = true;
          this.subAgentOrbitAngle += dt * (this.subAgentIsSpeaking ? 3.0 : 1.4);
          const r = 1.72;
          const sx = Math.cos(this.subAgentOrbitAngle) * r;
          const sy = Math.sin(this.subAgentOrbitAngle * 0.8) * 0.55 + 0.25;
          const sz = Math.sin(this.subAgentOrbitAngle) * 0.95;
          this.subAgentMesh.position.set(sx, sy, sz);
          const s = this.subAgentScale * (1.0 + (this.subAgentIsSpeaking ? Math.sin(now * 0.02) * 0.18 : 0));
          this.subAgentMesh.scale.set(s, s, s);
          this.subAgentRing.rotation.z += dt * 3.2;
          this.satMat.emissiveIntensity = 0.65 + (this.subAgentIsSpeaking ? 0.75 * Math.abs(Math.sin(now * 0.015)) : 0.2);
        } else {
          this.subAgentGroup.visible = false;
        }
      }

      // Update 3D Quad-Faceted Sphere Vertices & Shader Uniforms
      const effHorror = Math.min(1.0, Math.max(0.0, this.currentExpr.horrorLevel + (this.animHorrorMod || 0)));
      this.sphereUniforms.uHorrorLevel.value = effHorror;
      if (this.animHorrorMod > 0.35) {
        this.horrorLight.intensity = Math.max(this.horrorLight.intensity, this.animHorrorMod * 4.8);
      }
      this.sphereUniforms.uCreepyMode.value = (this.animMode === 'creepy' || this.animHorrorMod > 0.8) ? 1.0 : 0.0;
      this.sphereUniforms.uTime.value = now * 0.001;
      this._updateSphereVertices(now);

      // Render 2D Face Artwork & WebGL Scene
      this._renderFaceTexture(now);
      this.renderer.render(this.scene, this.camera);
    }

    _loop(t) {
      if (!this.isRunning) return;
      this.update(t);
      requestAnimationFrame(this._loop);
    }

    destroy() {
      this.isRunning = false;
      window.removeEventListener('resize', this._onResize);
      if (this._resizeObserver) this._resizeObserver.disconnect();
      if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
  }

  return { VerityThreeAvatar, EXPRESSIONS };
});
