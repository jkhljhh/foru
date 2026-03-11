// aurora.js — WebGL aurora, cursor, sparks

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AURORA — WebGL shader background
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initAurora() {
  const cv = document.getElementById('aurora-canvas');
  const gl = cv.getContext('webgl') || cv.getContext('experimental-webgl');
  if (!gl) { cv.style.display = 'none'; return; }

  function resize() {
    cv.width = innerWidth; cv.height = innerHeight;
    gl.viewport(0, 0, cv.width, cv.height);
  }
  resize();
  window.addEventListener('resize', resize);

  const vs = `
    attribute vec2 a_pos;
    varying vec2 v_uv;
    void main() {
      v_uv = a_pos * .5 + .5;
      gl_Position = vec4(a_pos, 0., 1.);
    }
  `;
  const fs = `
    precision mediump float;
    varying vec2 v_uv;
    uniform float u_time;
    uniform vec2  u_mouse;
    uniform vec2  u_res;

    // value noise
    float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      f = f*f*(3.-2.*f);
      float a=hash(i), b=hash(i+vec2(1,0)),
            c=hash(i+vec2(0,1)), d=hash(i+vec2(1,1));
      return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);
    }
    float fbm(vec2 p){
      float v=0., a=.5;
      for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+.3;a*=.5;}
      return v;
    }

    void main(){
      vec2 uv = v_uv;
      vec2 m  = u_mouse / u_res;

      float t = u_time * .18;

      // warped fbm layers
      vec2 warp = vec2(
        fbm(uv * 2.5 + t + vec2(1.7, 9.2)),
        fbm(uv * 2.5 + t + vec2(8.3, 2.8))
      );
      float f = fbm(uv * 3. + warp * .7 + t * .4);

      // aurora ribbons — horizontal bands
      float band1 = smoothstep(.0, .5, sin(uv.y * 5. + f * 4. + t * 1.2) * .5 + .5);
      float band2 = smoothstep(.0, .5, sin(uv.y * 3. - f * 3. + t * .8 + 1.5) * .5 + .5);
      float band3 = smoothstep(.1, .6, sin(uv.y * 7. + f * 2. + t * 1.5 + 3.) * .5 + .5);

      // colours
      vec3 col1 = vec3(.95, .18, .42); // rose
      vec3 col2 = vec3(.45, .22, .85); // violet
      vec3 col3 = vec3(.78, .52, .15); // gold

      vec3 col = mix(vec3(0.), col1, band1 * .25);
      col += col2 * band2 * .18;
      col += col3 * band3 * .1;

      // mouse glow
      float mdist = length(uv - m);
      col += col1 * .08 * smoothstep(.5, .0, mdist);

      // vignette
      float vig = uv.x * (1.-uv.x) * uv.y * (1.-uv.y);
      col *= 14. * vig * vig + .05;

      gl_FragColor = vec4(col, 1.);
    }
  `;

  function mkShader(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, mkShader(gl.VERTEX_SHADER, vs));
  gl.attachShader(prog, mkShader(gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, 1,1]),
    gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const uTime  = gl.getUniformLocation(prog, 'u_time');
  const uMouse = gl.getUniformLocation(prog, 'u_mouse');
  const uRes   = gl.getUniformLocation(prog, 'u_res');

  let mx = innerWidth / 2, my = innerHeight / 2;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

  let t0 = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const t = (now - t0) / 1000;
    gl.uniform1f(uTime, t);
    gl.uniform2f(uMouse, mx, innerHeight - my);
    gl.uniform2f(uRes, innerWidth, innerHeight);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  requestAnimationFrame(frame);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CURSOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initCursor() {
  const dot  = document.getElementById('cur');
  const aura = document.getElementById('cur-aura');
  let ax = innerWidth / 2, ay = innerHeight / 2;

  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px';
    dot.style.top   = e.clientY + 'px';
    ax += (e.clientX - ax) * .1;
    ay += (e.clientY - ay) * .1;
  });

  (function loop() {
    requestAnimationFrame(loop);
    aura.style.left = ax + 'px';
    aura.style.top  = ay + 'px';
  })();

  // big on hover
  document.addEventListener('mouseover', e => {
    if (e.target.matches('button, a, [onclick], .mcard, .story-orb, .gift-bloom, .fp-pill, .fo-pill, #hero-enter'))
      document.body.classList.add('cursor-big');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.matches('button, a, [onclick], .mcard, .story-orb, .gift-bloom, .fp-pill, .fo-pill, #hero-enter'))
      document.body.classList.remove('cursor-big');
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SPARKS CANVAS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let sparkCtx, sparkParts = [];

function initSparks() {
  const cv = document.getElementById('sparks-canvas');
  sparkCtx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  window.addEventListener('resize', () => {
    cv.width = innerWidth; cv.height = innerHeight;
  });

  document.addEventListener('click', e => {
    emitSparks(e.clientX, e.clientY, 10);
  });

  (function loop() {
    requestAnimationFrame(loop);
    sparkCtx.clearRect(0, 0, innerWidth, innerHeight);
    sparkParts = sparkParts.filter(p => p.life > 0);
    sparkParts.forEach(p => {
      p.x  += p.vx; p.y += p.vy;
      p.vy += .14; p.vx *= .97; p.vy *= .97;
      p.life -= 2;
      sparkCtx.globalAlpha = Math.max(0, p.life / 60);
      sparkCtx.fillStyle = p.c;
      sparkCtx.beginPath();
      sparkCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      sparkCtx.fill();
    });
    sparkCtx.globalAlpha = 1;
  })();
}

function emitSparks(x, y, n = 10, colorOverride) {
  const palette = ['#ff2d6b', '#ffb3c6', '#d4a843', '#fff', '#b48fff', '#ffe4a0'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.5 + Math.random() * 6;
    sparkParts.push({
      x, y,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s - 2,
      r: .6 + Math.random() * 2.5,
      c: colorOverride || palette[Math.floor(Math.random() * palette.length)],
      life: 40 + Math.random() * 30
    });
  }
}
