/*
  Rive (JS) - Responsive Layouts

  Resources: 
  - Rive source file: https://rive.app/community/files/24638-46038-layouts-demo
  - Building Layouts in Rive: https://rive.app/docs/editor/layouts/layouts-overview
  - Layouts at runtime: https://rive.app/docs/runtimes/layout#web
*/

import "./styles.css";
import { Rive, Layout, Fit, Alignment, EventType, RiveEventType } from "@rive-app/webgl";

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

function computeSize() {
  riveInstance?.resizeDrawingSurfaceToCanvas();
  logoInstanceNav?.resizeDrawingSurfaceToCanvas();
  logoInstanceHero?.resizeDrawingSurfaceToCanvas();
  loadingInstance?.resizeDrawingSurfaceToCanvas();
  logoInstanceCta?.resizeDrawingSurfaceToCanvas();
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
  riveInstance.cleanup();
}

const startTime = Date.now();
const MINIMUM_LOADING_TIME = 1000; // 1 second in milliseconds

const loadingOverlay = document.getElementById("loading-overlay");
const loadingCanvas = document.getElementById("loading-canvas") as HTMLCanvasElement;
const logoCanvasNav = document.getElementById("logo-canvas-nav") as HTMLCanvasElement;
const logoCanvasHero = document.getElementById("logo-canvas-hero") as HTMLCanvasElement;
const ctaCanvasNav = document.getElementById("cta-canvas-nav") as HTMLCanvasElement;

let loadingInstance: Rive | null = null;
let logoInstanceNav: Rive | null = null;
let logoInstanceHero: Rive | null = null;
let logoInstanceCta: Rive | null = null;

if (loadingCanvas) {
  loadingInstance = new Rive({
    src: new URL("./loadingRiv2.riv", import.meta.url).toString(),
    canvas: loadingCanvas,
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
    src: new URL("./logo_raivu2.riv", import.meta.url).toString(),
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
    src: new URL("./logo_raivu2.riv", import.meta.url).toString(),
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
    src: new URL("./contact_us_raivu.riv", import.meta.url).toString(),
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
      }, 500);
    }
  }, remainingTime);
}

const riveInstance = new Rive({
  src: new URL("./raivumascot262.riv", import.meta.url).toString(),

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
    riveInstance.resizeDrawingSurfaceToCanvas();
    hideLoader();
  },

});

// Fallback: hide loader when window is fully loaded even if Rive takes too long or fails
window.addEventListener("load", () => {
  hideLoader();
});
