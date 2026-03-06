import type { DotCountdownConfig } from './types';

export const generateCode = (config: DotCountdownConfig) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dot Countdown</title>
  <style>
    html, body { margin: 0; width: 100%; height: 100%; overflow: hidden; background: ${config.backgroundColor}; }
    canvas { display: block; width: 100%; height: 100%; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const config = ${JSON.stringify(config, null, 2)};
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
    const randomBetween = (min, max) => min + Math.random() * (max - min);
    const palette = [config.colorA, config.colorB, config.colorC, config.colorD];

    function hexToRgb(hex) {
      const normalized = hex.trim().replace('#', '');
      const full = normalized.length === 3
        ? normalized.split('').map((char) => char + char).join('')
        : normalized;
      if (!/^[0-9a-fA-F]{6}$/.test(full)) return { r: 255, g: 255, b: 255 };
      return {
        r: parseInt(full.slice(0, 2), 16),
        g: parseInt(full.slice(2, 4), 16),
        b: parseInt(full.slice(4, 6), 16)
      };
    }

    function pickRgb() {
      return hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
    }

    let width = 0;
    let height = 0;
    let sizeSignature = '';
    let lastTime = performance.now();
    let dots = [];
    let currentLabel = '';
    let countdownValue = 0;
    let showingGo = false;
    let countdownDirection = -1;
    let nextSwitchAt = 0;

    function setRoamTarget(dot) {
      dot.roamX = randomBetween(0, width);
      dot.roamY = randomBetween(0, height);
      dot.tx = dot.roamX;
      dot.ty = dot.roamY;
    }

    function createDot() {
      const x = randomBetween(0, width);
      const y = randomBetween(0, height);
      const rgb = pickRgb();
      return {
        x,
        y,
        tx: x,
        ty: y,
        roamX: x,
        roamY: y,
        alpha: clamp(config.roamAlpha, 0.05, 1),
        targetAlpha: clamp(config.roamAlpha, 0.05, 1),
        r: rgb.r,
        g: rgb.g,
        b: rgb.b
      };
    }

    function syncDotCount(forceRecreate) {
      const count = clamp(Math.round(config.dotCount), 200, 5000);
      if (forceRecreate) {
        dots = Array.from({ length: count }, () => createDot());
        return;
      }
      while (dots.length < count) dots.push(createDot());
      if (dots.length > count) dots.length = count;
    }

    function fitTextSize(context, label, maxWidth, maxHeight) {
      let low = 20;
      let high = Math.max(80, maxHeight);
      let best = low;
      for (let i = 0; i < 22; i++) {
        const mid = (low + high) * 0.5;
        context.font = '900 ' + mid + 'px "Lato", "SF Pro Display", "Segoe UI", sans-serif';
        const textWidth = context.measureText(label).width;
        const textHeight = mid * 0.92;
        if (textWidth <= maxWidth && textHeight <= maxHeight) {
          best = mid;
          low = mid;
        } else {
          high = mid;
        }
      }
      return best;
    }

    function sampleTextPoints(label) {
      const offscreen = document.createElement('canvas');
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return [];
      offscreen.width = Math.max(1, Math.floor(width * 0.6));
      offscreen.height = Math.max(1, Math.floor(height * 0.5));

      offCtx.clearRect(0, 0, offscreen.width, offscreen.height);
      offCtx.textAlign = 'center';
      offCtx.textBaseline = 'middle';
      offCtx.fillStyle = '#ffffff';
      const fontSize = fitTextSize(offCtx, label, offscreen.width * 0.85, offscreen.height * 0.9);
      offCtx.font = '900 ' + fontSize + 'px "Lato", "SF Pro Display", "Segoe UI", sans-serif';
      offCtx.fillText(label, offscreen.width * 0.5, offscreen.height * 0.55);

      const data = offCtx.getImageData(0, 0, offscreen.width, offscreen.height).data;
      const points = [];
      const step = Math.max(1, Math.round(clamp(config.dotRadius, 1, 6) * 2 + clamp(config.sampleGap, 1, 10)));
      const offsetX = (width - offscreen.width) * 0.5;
      const offsetY = (height - offscreen.height) * 0.5;

      for (let y = 0; y < offscreen.height; y += step) {
        for (let x = 0; x < offscreen.width; x += step) {
          const alpha = data[(y * offscreen.width + x) * 4 + 3];
          if (alpha > 0) points.push({ x: x + offsetX, y: y + offsetY });
        }
      }

      for (let i = points.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [points[i], points[j]] = [points[j], points[i]];
      }
      if (points.length > dots.length) points.length = dots.length;

      return points;
    }

    function applyLabel(label) {
      const points = sampleTextPoints(label);
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        if (i < points.length) {
          dot.tx = points[i].x;
          dot.ty = points[i].y;
          dot.targetAlpha = clamp(config.formAlpha, 0.05, 1);
        } else {
          setRoamTarget(dot);
          dot.targetAlpha = clamp(config.roamAlpha, 0.05, 1);
        }
      }
    }

    function restartCountdown(now) {
      const start = Math.round(config.startNumber);
      const end = Math.round(config.endNumber);
      countdownDirection = start >= end ? -1 : 1;
      countdownValue = start;
      showingGo = false;
      currentLabel = String(countdownValue);
      applyLabel(currentLabel);
      nextSwitchAt = now + clamp(config.holdTime, 200, 6000);
    }

    function advanceCountdown(scheduledAt) {
      if (!showingGo) {
        const end = Math.round(config.endNumber);
        if (countdownValue === end) {
          showingGo = true;
          currentLabel = 'GO';
        } else {
          countdownValue += countdownDirection;
          currentLabel = String(countdownValue);
        }
        applyLabel(currentLabel);
        nextSwitchAt = scheduledAt + clamp(config.holdTime, 200, 6000);
        return;
      }

      if (config.loopCountdown) {
        restartCountdown(scheduledAt);
        return;
      }

      nextSwitchAt = Infinity;
    }

    function rebuild(fullReset) {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeSignature = Math.round(width) + 'x' + Math.round(height);

      syncDotCount(fullReset);
      const now = performance.now();
      if (!currentLabel || fullReset) restartCountdown(now);
      else {
        applyLabel(currentLabel);
        nextSwitchAt = now + clamp(config.holdTime, 200, 6000);
      }
    }

    function animate(now) {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      const frameScale = dt * 60;
      lastTime = now;

      const nextSignature = Math.round(width) + 'x' + Math.round(height);
      if (nextSignature !== sizeSignature) rebuild(true);
      if (width <= 1 || height <= 1) {
        requestAnimationFrame(animate);
        return;
      }

      let guard = 0;
      while (now >= nextSwitchAt && guard < 10) {
        advanceCountdown(nextSwitchAt);
        guard += 1;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = config.backgroundColor;
      ctx.fillRect(0, 0, width, height);

      const moveEase = clamp(config.moveEase, 0.01, 0.4);
      const dotRadius = clamp(config.dotRadius, 1, 6);
      const roamAlpha = clamp(config.roamAlpha, 0.05, 1);

      for (const dot of dots) {
        const step = clamp(moveEase * frameScale, 0, 1);
        dot.x += (dot.tx - dot.x) * step;
        dot.y += (dot.ty - dot.y) * step;
        dot.alpha += (dot.targetAlpha - dot.alpha) * clamp(0.08 * frameScale, 0, 1);

        if (dot.targetAlpha <= roamAlpha) {
          const dist = Math.hypot(dot.tx - dot.x, dot.ty - dot.y);
          if (dist < 8) setRoamTarget(dot);
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + dot.r + ',' + dot.g + ',' + dot.b + ',' + clamp(dot.alpha, 0.05, 1) + ')';
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    rebuild(true);
    requestAnimationFrame(animate);
    window.addEventListener('resize', () => rebuild(true));
  </script>
</body>
</html>
`;
