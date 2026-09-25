/* eslint-disable no-plusplus */
/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
/* eslint-disable no-return-assign */
/* eslint-disable no-void */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';

const DEFAULT_IMAGES = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art',
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture',
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork',
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art',
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern',
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface',
  },
  {
    src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large',
    alt: 'Social media image',
  },
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

function buildItems(pool, seg) {
  const startX = -(seg - 1);
  const xCols = Array.from({ length: seg }, (_, i) => startX + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: '', alt: '' }));
  }
  if (pool.length > totalSlots) {
    console.warn(`[DomeGallery] Provided image count (${pool.length}) exceeds available tiles (${totalSlots}). Some images will not be shown.`);
  }

  const normalizedImages = pool.map((image) => {
    if (typeof image === 'string') {
      return { src: image, alt: '' };
    }
    return { src: image.src || '', alt: image.alt || '' };
  });

  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    src: usedImages[i].src,
    alt: usedImages[i].alt,
  }));
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '400px',
  openedImageHeight = '400px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true,
  autoRotate = false,
  autoRotateSpeed = 0.05,
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const pointerTypeRef = useRef('mouse');
  const tapTargetRef = useRef(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      let basis;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', grayscale ? 'grayscale(1)' : 'none');
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
      if (enlargedOverlay && mainRef.current) {
        const mainR = mainRef.current.getBoundingClientRect();
        const currentW = parseFloat(enlargedOverlay.style.width) || 320;
        const currentH = parseFloat(enlargedOverlay.style.height) || 320;
        enlargedOverlay.style.left = `${Math.round((mainR.width - currentW) / 2)}px`;
        enlargedOverlay.style.top = `${Math.round((mainR.height - currentH) / 2)}px`;
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [fit, fitBasis, minRadius, maxRadius, padFactor, overlayBlurColor, grayscale, imageBorderRadius, openedImageBorderRadius, openedImageWidth, openedImageHeight]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  const autoRotateRAF = useRef(null);

  useEffect(() => {
    if (!autoRotate) {
      if (autoRotateRAF.current) cancelAnimationFrame(autoRotateRAF.current);
      return;
    }

    let lastTime = performance.now();
    const loop = (time) => {
      const dt = time - lastTime;
      lastTime = time;

      if (!draggingRef.current && !inertiaRAF.current) {
        const delta = (dt * autoRotateSpeed) / 16.66;
        const nextY = wrapAngleSigned(rotationRef.current.y - delta);
        rotationRef.current = { ...rotationRef.current, y: nextY };
        applyTransform(rotationRef.current.x, nextY);
      }
      autoRotateRAF.current = requestAnimationFrame(loop);
    };
    autoRotateRAF.current = requestAnimationFrame(loop);

    return () => {
      if (autoRotateRAF.current) cancelAnimationFrame(autoRotateRAF.current);
    };
  }, [autoRotate, autoRotateSpeed]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const damp = Math.max(0.5, dragDampening ?? 2);
      const frictionMul = clamp(0.96 - damp * 0.035, 0.65, 0.94);
      const stopThreshold = 0.01 * damp;
      const maxFrames = Math.max(15, Math.round(180 / damp));
      let vX = (clamp(vx, -1.5, 1.5) * 60) / Math.sqrt(damp);
      let vY = (clamp(vy, -1.5, 1.5) * 60) / Math.sqrt(damp);
      let frames = 0;

      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if ((Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) || ++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = maxVerticalRotationDeg > 0 ? clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg) : 0;
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };

      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();

        const evt = event;
        pointerTypeRef.current = evt.pointerType || 'mouse';
        rootRef.current?.setAttribute('data-dragging', 'true');
        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
        const potential = evt.target.closest?.('.item__image');
        tapTargetRef.current = potential || null;
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

        const evt = event;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) {
            movedRef.current = true;
            if (pointerTypeRef.current === 'touch') lockScroll();
          }
        }

        const nextX = maxVerticalRotationDeg > 0 ? clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg) : 0;
        const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

        const cur = rotationRef.current;
        if (cur.x !== nextX || cur.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          let isTap = false;

          if (startPosRef.current) {
            const dx = evt.clientX - startPosRef.current.x;
            const dy = evt.clientY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === 'touch' ? 10 : 6;
            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) {
              isTap = true;
            }
          }

          const [vMagX, vMagY] = velArr;
          const [dirX, dirY] = dirArr;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = (mx / dragSensitivity) * 0.02;
            vy = (my / dragSensitivity) * 0.02;
          }

          rootRef.current?.removeAttribute('data-dragging');
          if (!isTap && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
            startInertia(vx, maxVerticalRotationDeg > 0 ? vy : 0);
          }
          startPosRef.current = null;
          cancelTapRef.current = !isTap;

          if (isTap && tapTargetRef.current && !focusedElRef.current) {
            openItemFromElement(tapTargetRef.current);
          }
          tapTargetRef.current = null;

          if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
          if (pointerTypeRef.current === 'touch') unlockScroll();
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      },
    },
    {
      target: mainRef,
      eventOptions: { passive: false },
      drag: {
        axis: maxVerticalRotationDeg === 0 ? 'x' : undefined,
        filterTaps: true,
      },
    },
  );

  const isClosingRef = useRef(false);

  const close = useCallback(() => {
    if (isClosingRef.current) return;
    if (performance.now() - openStartedAtRef.current < 150) return;
    const el = focusedElRef.current;
    const overlay = viewerRef.current?.querySelector('.enlarge');
    if (!el && !overlay) return;

    isClosingRef.current = true;
    openingRef.current = false;
    unlockScroll();
    document.body.classList.remove('dg-scroll-lock');
    scrollLockedRef.current = false;
    rootRef.current?.removeAttribute('data-enlarging');

    if (!el || !overlay) {
      if (overlay) overlay.remove();
      if (el) {
        el.style.visibility = '';
        el.style.zIndex = 0;
      }
      focusedElRef.current = null;
      isClosingRef.current = false;
      return;
    }

    const parent = el.parentElement;
    const refDiv = parent ? parent.querySelector('.item__image--reference') : null;
    const originalPos = originalTilePositionRef.current;

    if (!originalPos || !parent) {
      overlay.remove();
      if (refDiv) refDiv.remove();
      if (parent) {
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
      }
      el.style.visibility = '';
      el.style.zIndex = 0;
      focusedElRef.current = null;
      isClosingRef.current = false;
      return;
    }

    const currentRect = overlay.getBoundingClientRect();
    const rootRect = rootRef.current ? rootRef.current.getBoundingClientRect() : { left: 0, top: 0 };

    const originalPosRelativeToRoot = {
      left: originalPos.left - rootRect.left,
      top: originalPos.top - rootRect.top,
      width: originalPos.width,
      height: originalPos.height,
    };

    const overlayRelativeToRoot = {
      left: currentRect.left - rootRect.left,
      top: currentRect.top - rootRect.top,
      width: currentRect.width,
      height: currentRect.height,
    };

    const animatingOverlay = document.createElement('div');
    animatingOverlay.className = 'enlarge-closing';
    animatingOverlay.style.cssText = `
      position: absolute;
      left: ${overlayRelativeToRoot.left}px;
      top: ${overlayRelativeToRoot.top}px;
      width: ${overlayRelativeToRoot.width}px;
      height: ${overlayRelativeToRoot.height}px;
      z-index: 9999;
      border-radius: ${openedImageBorderRadius};
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,.25);
      transition: all ${enlargeTransitionMs}ms ease-out;
      pointer-events: none;
      margin: 0;
      transform: none;
      filter: ${grayscale ? 'grayscale(1)' : 'none'};
    `;

    const originalImg = overlay.querySelector('img');
    if (originalImg) {
      const img = originalImg.cloneNode();
      img.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';
      animatingOverlay.appendChild(img);
    }

    overlay.remove();
    rootRef.current?.appendChild(animatingOverlay);

    void animatingOverlay.getBoundingClientRect();

    requestAnimationFrame(() => {
      animatingOverlay.style.left = `${originalPosRelativeToRoot.left}px`;
      animatingOverlay.style.top = `${originalPosRelativeToRoot.top}px`;
      animatingOverlay.style.width = `${originalPosRelativeToRoot.width}px`;
      animatingOverlay.style.height = `${originalPosRelativeToRoot.height}px`;
      animatingOverlay.style.opacity = '0';
    });

    let cleanedUp = false;
    const cleanup = () => {
      if (cleanedUp) return;
      cleanedUp = true;
      animatingOverlay.remove();
      originalTilePositionRef.current = null;
      isClosingRef.current = false;

      if (refDiv) refDiv.remove();
      if (parent) {
        parent.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
      }

      el.style.transition = 'none';
      el.style.visibility = '';
      el.style.opacity = '0';
      el.style.zIndex = 0;
      focusedElRef.current = null;

      requestAnimationFrame(() => {
        if (parent) parent.style.transition = '';
        el.style.transition = 'opacity 200ms ease-out';
        requestAnimationFrame(() => {
          el.style.opacity = '1';
          setTimeout(() => {
            el.style.transition = '';
            el.style.opacity = '';
          }, 200);
        });
      });
    };

    const cleanupFallback = setTimeout(cleanup, (enlargeTransitionMs || 300) + 60);
    animatingOverlay.addEventListener(
      'transitionend',
      () => {
        clearTimeout(cleanupFallback);
        cleanup();
      },
      { once: true },
    );
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale, unlockScroll]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (!rootRef.current?.hasAttribute('data-enlarging')) return;
      if (performance.now() - openStartedAtRef.current < 200) return;

      const overlay = viewerRef.current?.querySelector('.enlarge');
      if (!overlay) return;

      if (e.target.closest?.('.enlarge-close-btn') || !overlay.contains(e.target)) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };

    window.addEventListener('pointerdown', handleOutside, true);
    window.addEventListener('click', handleOutside, true);
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('pointerdown', handleOutside, true);
      window.removeEventListener('click', handleOutside, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [close]);

  const openItemFromElement = (el) => {
    if (openingRef.current) return;
    openingRef.current = true;
    openStartedAtRef.current = performance.now();
    lockScroll();
    const parent = el.parentElement;
    focusedElRef.current = el;
    el.setAttribute('data-focused', 'true');
    const offsetX = getDataNumber(parent, 'offsetX', 0);
    const offsetY = getDataNumber(parent, 'offsetY', 0);
    const sizeX = getDataNumber(parent, 'sizeX', 2);
    const sizeY = getDataNumber(parent, 'sizeY', 2);
    const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
    const parentY = normalizeAngle(parentRot.rotateY);
    const globalY = normalizeAngle(rotationRef.current.y);
    let rotY = -(parentY + globalY) % 360;
    if (rotY < -180) rotY += 360;
    const rotX = -parentRot.rotateX - rotationRef.current.x;
    parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
    parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
    const refDiv = document.createElement('div');
    refDiv.className = 'item__image item__image--reference opacity-0';
    refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
    parent.appendChild(refDiv);

    void refDiv.offsetHeight;

    const tileR = refDiv.getBoundingClientRect();
    const mainR = mainRef.current?.getBoundingClientRect();

    if (!mainR || tileR.width <= 0 || tileR.height <= 0) {
      openingRef.current = false;
      focusedElRef.current = null;
      parent.removeChild(refDiv);
      unlockScroll();
      return;
    }

    originalTilePositionRef.current = {
      left: tileR.left,
      top: tileR.top,
      width: tileR.width,
      height: tileR.height,
    };
    el.style.visibility = 'hidden';
    el.style.zIndex = 0;

    const tempDiv = document.createElement('div');
    tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; max-width: calc(100% - 32px); max-height: calc(100% - 32px); visibility: hidden; pointer-events: none;`;
    mainRef.current.appendChild(tempDiv);
    const measuredTarget = tempDiv.getBoundingClientRect();
    mainRef.current.removeChild(tempDiv);

    const targetWidth = Math.round(measuredTarget.width > 0 ? measuredTarget.width : Math.min(mainR.width - 32, 400));
    const targetHeight = Math.round(measuredTarget.height > 0 ? measuredTarget.height : Math.min(mainR.height - 32, 400));

    const centeredLeft = Math.round((mainR.width - targetWidth) / 2);
    const centeredTop = Math.round((mainR.height - targetHeight) / 2);

    const tileLeftRel = tileR.left - mainR.left;
    const tileTopRel = tileR.top - mainR.top;
    const deltaX = tileLeftRel - centeredLeft;
    const deltaY = tileTopRel - centeredTop;
    const scaleX = tileR.width / targetWidth;
    const scaleY = tileR.height / targetHeight;

    const overlay = document.createElement('div');
    overlay.className = 'enlarge';
    overlay.style.cssText = `
      position: absolute;
      left: ${centeredLeft}px;
      top: ${centeredTop}px;
      width: ${targetWidth}px;
      height: ${targetHeight}px;
      opacity: 0;
      z-index: 30;
      will-change: transform, opacity;
      transform-origin: top left;
      transition: transform ${enlargeTransitionMs}ms ease-out, opacity ${enlargeTransitionMs}ms ease-out;
      border-radius: ${openedImageBorderRadius};
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      transform: translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY});
    `;

    const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
    const rawAlt = parent.dataset.alt || el.querySelector('img')?.alt || '';

    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'enlarge-image-frame';
    imgWrapper.style.cssText = 'width: 100%; height: 100%; position: relative; overflow: hidden; border-radius: inherit; display: flex; align-items: center; justify-content: center;';

    const img = document.createElement('img');
    img.src = rawSrc;
    img.alt = rawAlt;
    img.style.cssText = `width: 100%; height: 100%; object-fit: cover; display: block; flex-shrink: 0; filter: ${grayscale ? 'grayscale(1)' : 'none'};`;
    imgWrapper.appendChild(img);
    overlay.appendChild(imgWrapper);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'enlarge-close-btn';
    closeBtn.setAttribute('aria-label', 'Close photo');
    closeBtn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
    });
    closeBtn.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
    overlay.appendChild(closeBtn);

    viewerRef.current.appendChild(overlay);

    requestAnimationFrame(() => {
      if (!overlay.parentElement) return;
      overlay.style.opacity = '1';
      overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
      rootRef.current?.setAttribute('data-enlarging', 'true');
    });
  };

  useEffect(
    () => () => {
      document.body.classList.remove('dg-scroll-lock');
    },
    [],
  );

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14159);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
      cursor: grab;
    }

    .stage:active,
    .sphere-root[data-dragging="true"] .stage {
      cursor: grabbing;
    }
    
    .sphere {
      position: absolute;
      inset: 0;
      margin: auto;
      width: 0;
      height: 0;
      transform-style: preserve-3d;
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
    }
    
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg))) 
                 rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg))) 
                 translateZ(var(--radius));
    }
    
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
      cursor: pointer !important;
    }

    .enlarge-close-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: rgba(40, 40, 43, 0.7);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      color: #ffffff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 50;
      transition: background 0.2s, transform 0.2s;
      padding: 0;
    }

    .enlarge-close-btn:hover {
      background: rgba(40, 40, 43, 0.95);
      transform: scale(1.08);
    }

    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 300ms;
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
    }
    .stage:active .item__image,
    .sphere-root[data-dragging="true"] .item__image {
      cursor: grabbing;
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative w-full h-full"
        style={{
          '--segments-x': segments,
          '--segments-y': segments,
          '--overlay-blur-color': overlayBlurColor,
          '--tile-radius': imageBorderRadius,
          '--enlarge-radius': openedImageBorderRadius,
          '--image-filter': grayscale ? 'grayscale(1)' : 'none',
        }}
      >
        <div
          ref={mainRef}
          className="absolute inset-0 grid place-items-center overflow-hidden select-none"
          style={{
            touchAction: maxVerticalRotationDeg === 0 ? 'pan-y' : 'none',
            WebkitUserSelect: 'none',
            backgroundColor: overlayBlurColor && overlayBlurColor !== 'transparent' ? `var(--overlay-blur-color, ${overlayBlurColor})` : 'transparent',
          }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => (
                <div
                  key={`${it.x},${it.y},${i}`}
                  className="sphere-item absolute m-auto"
                  data-src={it.src}
                  data-alt={it.alt}
                  data-offset-x={it.x}
                  data-offset-y={it.y}
                  data-size-x={it.sizeX}
                  data-size-y={it.sizeY}
                  style={{
                    '--offset-x': it.x,
                    '--offset-y': it.y,
                    '--item-size-x': it.sizeX,
                    '--item-size-y': it.sizeY,
                    top: '-999px',
                    bottom: '-999px',
                    left: '-999px',
                    right: '-999px',
                  }}
                >
                  <div
                    className="item__image absolute block overflow-hidden transition-transform duration-300"
                    style={{
                      inset: '10px',
                      borderRadius: `var(--tile-radius, ${imageBorderRadius})`,
                      backfaceVisibility: 'hidden',
                      backgroundColor: overlayBlurColor && overlayBlurColor !== 'transparent' ? `var(--overlay-blur-color, ${overlayBlurColor})` : 'transparent',
                    }}
                  >
                    <img
                      src={it.src}
                      draggable={false}
                      alt={it.alt}
                      className="w-full h-full object-cover pointer-events-none"
                      style={{
                        backfaceVisibility: 'hidden',
                        filter: `var(--image-filter, ${grayscale ? 'grayscale(1)' : 'none'})`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {overlayBlurColor && overlayBlurColor !== 'transparent' && (
            <>
              <div
                className="absolute inset-0 m-auto z-[3] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
                }}
              />
              <div
                className="absolute inset-0 m-auto z-[3] pointer-events-none"
                style={{
                  WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
                  maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
                  backdropFilter: 'blur(3px)',
                }}
              />
              <div
                className="absolute left-0 right-0 top-0 h-[120px] z-[5] pointer-events-none rotate-180"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
                }}
              />
              <div
                className="absolute left-0 right-0 bottom-0 h-[120px] z-[5] pointer-events-none"
                style={{
                  background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))`,
                }}
              />
            </>
          )}

          <div ref={viewerRef} className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center" style={{ padding: 'var(--viewer-pad)' }}>
            <div
              ref={scrimRef}
              className="scrim absolute inset-0 z-10 pointer-events-none opacity-0 transition-opacity duration-300"
              style={{
                background: 'rgba(240, 244, 241, 0.45)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
