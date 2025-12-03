import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  speed: number;
}

export const StarfoxBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      // Fallback to 2D canvas if WebGL is not supported
      use2DCanvas(canvas);
      return;
    }

    // Initialize WebGL starfield
    initWebGLStarfield(canvas, gl);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const use2DCanvas = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize stars
    const NUM_STARS = 800;
    starsRef.current = Array.from({ length: NUM_STARS }, () => createStar(canvas));

    const animate = () => {
      // Create space background gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, '#0a0520');
      gradient.addColorStop(0.5, '#150a30');
      gradient.addColorStop(1, '#000000');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      starsRef.current.forEach((star) => {
        // Move star towards camera
        star.z -= star.speed;

        // Reset star if it goes past camera
        if (star.z <= 0) {
          Object.assign(star, createStar(canvas));
          star.z = 1000;
        }

        // Calculate star screen position and size based on depth
        const scale = 200 / star.z;
        const x = canvas.width / 2 + (star.x - canvas.width / 2) * scale;
        const y = canvas.height / 2 + (star.y - canvas.height / 2) * scale;
        const size = star.size * scale;

        // Only draw if star is on screen
        if (x >= -20 && x <= canvas.width + 20 && y >= -20 && y <= canvas.height + 20) {
          // Calculate opacity based on depth
          const opacity = Math.min(1, (1000 - star.z) / 1000);

          // Draw star with glow
          const brightness = 0.3 + (star.size / 3) * 0.7;

          // Outer glow
          ctx.beginPath();
          const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
          glowGradient.addColorStop(0, `rgba(200, 220, 255, ${opacity * brightness * 0.3})`);
          glowGradient.addColorStop(1, 'rgba(200, 220, 255, 0)');
          ctx.fillStyle = glowGradient;
          ctx.arc(x, y, size * 3, 0, Math.PI * 2);
          ctx.fill();

          // Inner star
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * brightness})`;
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Draw motion trail for fast-moving stars
          if (star.speed > 3) {
            ctx.beginPath();
            const prevScale = 200 / (star.z + star.speed * 2);
            const prevX = canvas.width / 2 + (star.x - canvas.width / 2) * prevScale;
            const prevY = canvas.height / 2 + (star.y - canvas.height / 2) * prevScale;

            const trailGradient = ctx.createLinearGradient(prevX, prevY, x, y);
            trailGradient.addColorStop(0, 'rgba(200, 220, 255, 0)');
            trailGradient.addColorStop(1, `rgba(200, 220, 255, ${opacity * 0.3})`);

            ctx.strokeStyle = trailGradient;
            ctx.lineWidth = size * 0.5;
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const initWebGLStarfield = (canvas: HTMLCanvasElement, gl: WebGLRenderingContext) => {
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Vertex shader
    const vertexShaderSource = `
      attribute vec3 position;
      attribute float size;
      attribute float speed;

      uniform float time;
      uniform vec2 resolution;

      varying float vBrightness;
      varying float vOpacity;

      void main() {
        vec3 pos = position;
        pos.z = mod(pos.z - time * speed * 0.5, 1000.0);

        float scale = 200.0 / max(pos.z, 1.0);
        vec2 screenPos = vec2(
          (pos.x - resolution.x * 0.5) * scale + resolution.x * 0.5,
          (pos.y - resolution.y * 0.5) * scale + resolution.y * 0.5
        );

        gl_Position = vec4(
          (screenPos.x / resolution.x) * 2.0 - 1.0,
          -((screenPos.y / resolution.y) * 2.0 - 1.0),
          0.0,
          1.0
        );

        gl_PointSize = size * scale * 2.0;
        vBrightness = 0.3 + (size / 3.0) * 0.7;
        vOpacity = min(1.0, (1000.0 - pos.z) / 1000.0);
      }
    `;

    // Fragment shader
    const fragmentShaderSource = `
      precision mediump float;

      varying float vBrightness;
      varying float vOpacity;

      void main() {
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);

        if (dist > 0.5) discard;

        float alpha = (1.0 - dist * 2.0) * vOpacity * vBrightness;
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }
    `;

    // Compile shaders
    const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    if (!vertexShader || !fragmentShader) {
      use2DCanvas(canvas);
      return;
    }

    // Create program
    const program = gl.createProgram();
    if (!program) {
      use2DCanvas(canvas);
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking failed');
      use2DCanvas(canvas);
      return;
    }

    gl.useProgram(program);

    // Create stars
    const NUM_STARS = 1200;
    const positions: number[] = [];
    const sizes: number[] = [];
    const speeds: number[] = [];

    for (let i = 0; i < NUM_STARS; i++) {
      const star = createStar(canvas);
      positions.push(star.x, star.y, star.z);
      sizes.push(star.size);
      speeds.push(star.speed);
    }

    // Position buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    // Size buffer
    const sizeBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW);

    const sizeLocation = gl.getAttribLocation(program, 'size');
    gl.enableVertexAttribArray(sizeLocation);
    gl.vertexAttribPointer(sizeLocation, 1, gl.FLOAT, false, 0, 0);

    // Speed buffer
    const speedBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, speedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(speeds), gl.STATIC_DRAW);

    const speedLocation = gl.getAttribLocation(program, 'speed');
    gl.enableVertexAttribArray(speedLocation);
    gl.vertexAttribPointer(speedLocation, 1, gl.FLOAT, false, 0, 0);

    // Uniforms
    const timeLocation = gl.getUniformLocation(program, 'time');
    const resolutionLocation = gl.getUniformLocation(program, 'resolution');

    // Enable blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    let startTime = Date.now();

    const animate = () => {
      const time = (Date.now() - startTime) / 1000;

      // Background gradient (using clear color)
      gl.clearColor(0.04, 0.02, 0.12, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform1f(timeLocation, time);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

      gl.drawArrays(gl.POINTS, 0, NUM_STARS);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const compileShader = (
    gl: WebGLRenderingContext,
    source: string,
    type: number
  ): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation failed:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  };

  const createStar = (canvas: HTMLCanvasElement): Star => {
    return {
      x: Math.random() * (canvas.width || window.innerWidth),
      y: Math.random() * (canvas.height || window.innerHeight),
      z: Math.random() * 1000,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 5 + 1,
    };
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'radial-gradient(ellipse at center, #150a30 0%, #000000 100%)' }}
    />
  );
};
