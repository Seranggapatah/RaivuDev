/*
  Rive (JS) - Responsive Layouts

  Resources: 
  - Rive source file: https://rive.app/community/files/24638-46038-layouts-demo
  - Building Layouts in Rive: https://rive.app/docs/editor/layouts/layouts-overview
  - Layouts at runtime: https://rive.app/docs/runtimes/layout#web
*/

import "./styles.css";
import { Rive, Layout, Fit, Alignment, EventType, RiveEventType } from "@rive-app/webgl";
import Lenis from 'lenis';
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ... (Lenis setup remains) ...

// Horizontal Scroll Animation for #works section
// Wait for window load to ensure all styles and layout are applied
window.addEventListener("load", () => {
  const worksSection = document.getElementById("works");
  const horizontalWrapper = document.querySelector(".horizontal-wrapper");

  if (worksSection && horizontalWrapper) {
    // Only enable horizontal scroll logic on Desktop
    if (window.innerWidth <= 768) {
      console.log("Mobile view detected: Skipping horizontal scroll animation.");
      return;
    }

    console.log("Initializing Horizontal Scroll (Load Event)");

    // Calculate distance dynamically
    const getScrollAmount = () => {
      const scrollWidth = horizontalWrapper.scrollWidth;
      const viewWidth = window.innerWidth;
      const amount = -(scrollWidth - viewWidth);
      console.log(`Scroll Amount: ${amount} (ScrollWidth: ${scrollWidth}, ViewWidth: ${viewWidth})`);
      return amount;
    }

    // Creating the animation
    gsap.to(horizontalWrapper, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: worksSection,
        start: "top top",
        end: () => `+=${horizontalWrapper.scrollWidth}`,
        pin: true,
        scrub: 0.1,
        invalidateOnRefresh: true,
        markers: false,
      }
    });

    ScrollTrigger.refresh();

    // Dedicated ticker for the curved effect to ensure it runs smoothly every frame
    // separating it from the scroll tween
    gsap.ticker.add(() => {
      // Disable on mobile to prevent "sliding around"
      if (window.innerWidth <= 768) return;

      const boxes = document.querySelectorAll(".scroll-box");
      const viewportCenter = window.innerWidth / 2;

      // Atur kelengkungan di sini:
      // Angka lebih BESAR = Lingkaran lebih BESAR (Lengkungan lebih landai/flat)
      // Angka lebih KECIL = Lingkaran lebih KECIL (Lengkungan lebih tajam/curam)
      const radius = window.innerWidth * 12;

      boxes.forEach((box) => {
        // Get the current position relative to the viewport
        const rect = box.getBoundingClientRect();
        const boxCenter = rect.left + rect.width / 2;
        const distanceFromCenter = boxCenter - viewportCenter;

        // Parabolic curve: y = x^2 / (2 * R)
        // This makes the center highest (y=0) and edges lower (y > 0)
        const y = Math.pow(distanceFromCenter, 2) / (2 * radius);

        // Rotation: angle = distance / radius
        const angleRad = distanceFromCenter / radius;
        const angleDeg = angleRad * (180 / Math.PI);

        gsap.set(box, {
          y: y,
          rotation: angleDeg,
          transformOrigin: "center center"
        });
      });
    });

    ScrollTrigger.refresh();
  } else {
    console.error("Horizontal scroll elements not found on load");
  }
});

// Initialize Lenis for smooth scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  infinite: false,
});

// Smart Navbar Logic (Hide on Scroll Down, Show on Scroll Up)
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

if (navbar) {

  lenis.on('scroll', ({ scroll }: { scroll: number }) => {
    const scrollTop = scroll;
    const scrollDelta = scrollTop - lastScrollTop;

    // Minimum scroll movement to trigger change (prevents jitter)
    if (Math.abs(scrollDelta) < 5) return;

    // Logic:
    // 1. Scrolling UP (delta < 0) OR at the very top (scrollTop < 50) -> SHOW
    // 2. Scrolling DOWN (delta > 0) AND not at top -> HIDE

    if (scrollDelta < 0 || scrollTop < 50) {
      navbar.classList.remove('navbar-hidden');
    } else if (scrollDelta > 0 && scrollTop > 50) {
      navbar.classList.add('navbar-hidden');
    }

    lastScrollTop = scrollTop;
  });
}

// Connect Lenis to ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Use GSAP's ticker for Lenis
gsap.ticker.add((time: number) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// ---------------------------------
// The layout of the graphic will adhere to
const layout = new Layout({
  fit: Fit.Layout, // Setting to Fit.Layout will auto update the artboard size
  layoutScaleFactor: 0.93, // 0.5x scale of the layout, when using `Fit.Layout`. This allows you to resize the layout as needed.
});

// ---------------------------------
// HTML Canvas element to render to
const riveCanvas: HTMLCanvasElement = document.getElementById(
  "rive-canvas"
) as HTMLCanvasElement;

if (!riveCanvas) {
  throw new Error("Canvas element with id 'rive-canvas' not found!");
}

// Optimization: Cap pixel ratio at 2x for performance on high-DPI screens
// Higher than 2x yields diminishing returns visually but massive performance costs
function computeSize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  riveInstance?.resizeDrawingSurfaceToCanvas(dpr);
  logoInstanceNav?.resizeDrawingSurfaceToCanvas(dpr);
  logoInstanceHero?.resizeDrawingSurfaceToCanvas(dpr);
  loadingInstance?.resizeDrawingSurfaceToCanvas(dpr);
  logoInstanceCta?.resizeDrawingSurfaceToCanvas(dpr);
  riveInstance2?.resizeDrawingSurfaceToCanvas(dpr);
  riveInstance3?.resizeDrawingSurfaceToCanvas(dpr);
}

// Subscribe to window size changes and update call `resizeDrawingSurfaceToCanvas`
window.onresize = computeSize;

// Subscribe to devicePixelRatio changes and call `resizeDrawingSurfaceToCanvas`
window
  .matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`)
  .addEventListener("change", computeSize);

// ---------------------------------
// Cleanup Rive
//
// When creating a Rive instance, you need to ensure that it gets cleaned up.
// This should happen in scenarios where you no longer want to show the Rive canvas,
// for example, where:
// - UI with Rive Animations is no longer necessary (i.e. a modal with Rive graphics is closed)
// - The animation or state machine has completed and will no longer ever be run/shown

// NOTE: This function is not called in this example.
function cleanUpRive() {
  riveInstance?.cleanup();
}

const startTime = Date.now();
const MINIMUM_LOADING_TIME = 1000; // 1 second in milliseconds

const loadingOverlay = document.getElementById("loading-overlay");
const loadingCanvas = document.getElementById("loading-canvas") as HTMLCanvasElement;
const logoCanvasNav = document.getElementById("logo-canvas-nav") as HTMLCanvasElement;
const logoCanvasHero = document.getElementById("logo-canvas-hero") as HTMLCanvasElement;
const ctaCanvasNav = document.getElementById("cta-canvas-nav") as HTMLCanvasElement;
const riveCanvas2 = document.getElementById("riveCanvas2") as HTMLCanvasElement;
const riveCanvas3 = document.getElementById("riveCanvas3") as HTMLCanvasElement;

let loadingInstance: Rive | null = null;
let logoInstanceNav: Rive | null = null;
let logoInstanceHero: Rive | null = null;
let logoInstanceCta: Rive | null = null;
let riveInstance: Rive | null = null;
let riveInstance2: Rive | null = null;
let riveInstance3: Rive | null = null;

if (loadingCanvas) {
  loadingInstance = new Rive({
    src: new URL("./assets/rive/loading3.riv", import.meta.url).toString(),
    canvas: loadingCanvas,
    artboard: "Artboard",
    autoplay: true,
    useOffscreenRenderer: true,
    onLoad: () => {
      loadingInstance?.resizeDrawingSurfaceToCanvas();
    },
  });
}

// Logo in Navbar
if (logoCanvasNav) {
  logoInstanceNav = new Rive({
    src: new URL("./assets/rive/logo_raivu2.riv", import.meta.url).toString(),
    stateMachines: ["State Machine 1"],
    canvas: logoCanvasNav,
    autoplay: true,
    useOffscreenRenderer: true,
    autoBind: true,
    artboard: "Artboard",
    onLoad: () => {
      logoInstanceNav?.resizeDrawingSurfaceToCanvas();
    },
  });
}

// Logo in Hero Section
if (logoCanvasHero) {
  logoInstanceHero = new Rive({
    src: new URL("./assets/rive/logo_raivu2.riv", import.meta.url).toString(),
    stateMachines: ["State Machine 1"],
    canvas: logoCanvasHero,
    autoplay: true,
    useOffscreenRenderer: true,
    autoBind: true,
    artboard: "Artboard",
    onLoad: () => {
      logoInstanceHero?.resizeDrawingSurfaceToCanvas();
    },
  });
}

// CTA in Navbar
if (ctaCanvasNav) {
  logoInstanceCta = new Rive({
    src: new URL("./assets/rive/contact_us_raivuV2.riv", import.meta.url).toString(),
    stateMachines: ["State Machine 1"],
    canvas: ctaCanvasNav,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
    autoplay: true,
    useOffscreenRenderer: true,
    autoBind: true,
    artboard: "Artboard",
    automaticallyHandleEvents: true,
    onLoad: () => {
      logoInstanceCta?.resizeDrawingSurfaceToCanvas();
      // Manually handle Open URL events
      logoInstanceCta?.on(EventType.RiveEvent, (event) => {
        const eventData = event.data as any;
        if (eventData && eventData.type === RiveEventType.OpenUrl) {
          window.open(eventData.url, "_blank");
        }
      });
    },
  });
}

function hideLoader() {
  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

  setTimeout(() => {
    if (loadingOverlay && !loadingOverlay.classList.contains("hidden")) {
      loadingOverlay.classList.add("hidden");
      // Cleanup loading instance after fade transition
      setTimeout(() => {
        loadingInstance?.cleanup();
        loadingInstance = null;
      }, 100);
    }
  }, remainingTime);
}

riveInstance = new Rive({
  src: new URL("./assets/rive/raivumascotV2.riv", import.meta.url).toString(),

  stateMachines: ["State Machine 1"],
  canvas: riveCanvas,
  artboard: "MainArtboard",
  autoBind: true,
  layout: layout, // This is optional. Provides additional layout control.
  autoplay: true,
  isTouchScrollEnabled: true,
  useOffscreenRenderer: true,
  onLoad: () => {
    console.log("✓ Rive file loaded successfully!");
    // Prevent a blurry canvas by using the device pixel ratio
    // Use capped pixel ratio
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    riveInstance?.resizeDrawingSurfaceToCanvas(dpr);
    observeRiveVisibility(riveInstance!, riveCanvas);
    hideLoader();
  },

});

if (riveCanvas2) {
  riveInstance2 = new Rive({
    src: new URL("./assets/rive/calkulatorV6.riv", import.meta.url).toString(),

    stateMachines: ["State Machine 1"],
    canvas: riveCanvas2,
    artboard: "mainCal",
    autoBind: true,
    layout: layout, // This is optional. Provides additional layout control.
    autoplay: true,
    isTouchScrollEnabled: true,
    useOffscreenRenderer: true,
    automaticallyHandleEvents: true,
    onLoad: () => {
      console.log("✓ Rive file loaded successfully!");
      // Prevent a blurry canvas by using the device pixel ratio
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      riveInstance2?.resizeDrawingSurfaceToCanvas(dpr);
      observeRiveVisibility(riveInstance2!, riveCanvas2);
    },

  });
}
if (riveCanvas3) {
  riveInstance3 = new Rive({
    src: new URL("./assets/rive/ball_pysicupdateV3.riv", import.meta.url).toString(),

    stateMachines: ["State Machine 1"],
    canvas: riveCanvas3,
    artboard: "mainPlay",
    autoBind: true,
    layout: layout, // This is optional. Provides additional layout control.
    autoplay: true,
    isTouchScrollEnabled: true,
    useOffscreenRenderer: true,
    dispatchPointerExit: true,
    automaticallyHandleEvents: true,
    onLoad: () => {
      console.log("✓ Rive file loaded successfully!");
      // Prevent a blurry canvas by using the device pixel ratio
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      riveInstance3?.resizeDrawingSurfaceToCanvas(dpr);
      observeRiveVisibility(riveInstance3!, riveCanvas3);
    },

  });
}





// Helper to optimize performance: only play when visible
function observeRiveVisibility(rive: Rive, canvas: HTMLElement) {
  if (!rive || !canvas) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        rive.play();
      } else {
        rive.pause();
      }
    });
  }, { threshold: 0.1 }); // Trigger when 10% visible

  observer.observe(canvas);
}

// Fallback: hide loader when window is fully loaded even if Rive takes too long or fails
window.addEventListener("load", () => {
  computeSize();
  hideLoader();
});

// Handle smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = e.currentTarget as HTMLAnchorElement;
    const targetId = target.getAttribute('href');
    if (targetId && targetId !== '#') {
      const targetElement = document.querySelector(targetId) as HTMLElement;
      if (targetElement) {
        lenis.scrollTo(targetElement);
      }
    }
  });
});


