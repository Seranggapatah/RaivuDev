
import { Rive, Layout, Fit, Alignment, EventType, RiveEventType } from "@rive-app/webgl";
import { LazyLoader } from "../utils/LazyLoader";

export class RiveManager {
    private activeInstances: Rive[] = [];
    private layout: Layout;

    constructor() {
        this.layout = new Layout({
            fit: Fit.Layout,
            layoutScaleFactor: 1.1,
        });

        // Handle resizing
        window.addEventListener('resize', this.resizeAll.bind(this));
        // Use capped pixel ratio
        this.resizeAll();
    }

    private resizeAll() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.activeInstances.forEach(instance => {
            instance.resizeDrawingSurfaceToCanvas(dpr);
        });
    }

    public initHeroAnimations() {
        // Logo in Navbar
        const logoCanvasNav = document.getElementById("logo-canvas-nav") as HTMLCanvasElement;
        if (logoCanvasNav) {
            this.createRiveInstance(logoCanvasNav, new URL("../assets/rive/logo_raivu2.riv", import.meta.url).href, ["State Machine 1"], false);
        }

        // Logo in Hero Section
        const logoCanvasHero = document.getElementById("logo-canvas-hero") as HTMLCanvasElement;
        if (logoCanvasHero) {
            this.createRiveInstance(logoCanvasHero, new URL("../assets/rive/logo_raivu2.riv", import.meta.url).href, ["State Machine 1"], false);
        }

        // CTA in Navbar
        const ctaCanvasNav = document.getElementById("cta-canvas-nav") as HTMLCanvasElement;
        if (ctaCanvasNav) {
            const instance = new Rive({
                src: new URL("../assets/rive/contact_us_raivuNewVersion.riv", import.meta.url).href,
                stateMachines: ["State Machine 1"],
                canvas: ctaCanvasNav,
                layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
                autoplay: true,
                useOffscreenRenderer: true,
                autoBind: true,
                artboard: "Artboard",
                automaticallyHandleEvents: true,
                isTouchScrollEnabled: true,
                onLoad: () => {
                    instance.resizeDrawingSurfaceToCanvas(Math.min(window.devicePixelRatio || 1, 2));
                    // Manually handle Open URL events
                    instance.on(EventType.RiveEvent, (event) => {
                        const eventData = event.data as any;
                        if (eventData && eventData.type === RiveEventType.OpenUrl) {
                            window.open(eventData.url, "_blank");
                        }
                    });
                    this.activeInstances.push(instance);
                },
            });
        }
    }

    public initLazyAnimations(lenisInstance: any) {
        const loader = new LazyLoader({ rootMargin: "1700px 0px" }); // Load early


        // 1. Main Mascot (Bottom of Hero)
        const riveCanvas = document.getElementById("rive-canvas") as HTMLCanvasElement;
        if (riveCanvas) {
            this.setupMainMascot(riveCanvas, lenisInstance);
        }

        // 2. Calculator (Green Section)
        const riveCanvas2 = document.getElementById("riveCanvas2") as HTMLCanvasElement;
        if (riveCanvas2) {
            loader.observe(riveCanvas2, () => {
                this.createRiveInstance(riveCanvas2, new URL("../assets/rive/calkulatorCompress.riv", import.meta.url).href, ["State Machine 1"], true, "mainCal");
            });
        }

        // 3. Ball Physics (Blue Section)
        const riveCanvas3 = document.getElementById("riveCanvas3") as HTMLCanvasElement;
        if (riveCanvas3) {
            loader.observe(riveCanvas3, () => {
                this.createRiveInstance(riveCanvas3, new URL("../assets/rive/ball_pysicupdateoldversionV5.riv", import.meta.url).href, ["State Machine 1"], true, "mainPlay");
            });
        }
    }

    private setupMainMascot(canvas: HTMLCanvasElement, lenis: any) {
        const riveInstance = new Rive({
            src: new URL("../assets/rive/raivumascotNewVersion.riv", import.meta.url).href,
            stateMachines: ["State Machine 1"],
            canvas: canvas,
            artboard: "MainArtboard",
            autoBind: true,
            layout: this.layout,
            autoplay: true,
            isTouchScrollEnabled: true,
            useOffscreenRenderer: true,
            onLoad: () => {
                // Connect Scroll to Rive Input
                lenis.on('scroll', ({ progress }: { progress: number }) => {
                    if (!riveInstance?.viewModelInstance) return;
                    const vmi = riveInstance.viewModelInstance;
                    const scrollInput = vmi.number("ScrollParalax");
                    if (scrollInput) {
                        const value = 0 + (progress * 60);
                        scrollInput.value = value;
                    }
                });

                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                riveInstance.resizeDrawingSurfaceToCanvas(dpr);
                this.activeInstances.push(riveInstance);
                this.observeVisibility(riveInstance, canvas);
            }
        });
    }

    private createRiveInstance(canvas: HTMLCanvasElement, assetUrl: string, stateMachines: string[], autoHandleEvents: boolean = false, artboard: string = "Artboard") {
        const instance = new Rive({
            src: assetUrl,
            stateMachines: stateMachines,
            canvas: canvas,
            artboard: artboard,
            autoBind: true,
            layout: this.layout,
            autoplay: true,
            useOffscreenRenderer: true,
            automaticallyHandleEvents: autoHandleEvents,
            isTouchScrollEnabled: true,
            onLoad: () => {
                const dpr = Math.min(window.devicePixelRatio || 1, 2);
                instance.resizeDrawingSurfaceToCanvas(dpr);
                this.activeInstances.push(instance);
                this.observeVisibility(instance, canvas);
            }
        });
        return instance;
    }

    private observeVisibility(rive: Rive, canvas: HTMLElement) {
        if (!rive || !canvas) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    rive.play();
                } else {
                    rive.pause();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(canvas);
    }
}
