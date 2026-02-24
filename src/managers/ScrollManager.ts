
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class ScrollManager {
    constructor() {
        this.init();
    }

    private init() {
        // Horizontal Scroll Animation for #works section
        // Wait for window load to ensure all styles and layout are applied
        window.addEventListener("load", () => {
            this.initHorizontalScroll();
            this.initAboutAnimation(); // Dipindah ke sini agar posisi scroll dikalkulasi setelah pinning #works selesai
        });

        // Smart Navbar
        this.initSmartNavbar();

        // Smooth Scroll anchors
        this.initAnchorScroll();
    }

    private initAboutAnimation() {
        const aboutText = document.querySelector(".about-desc-text");
        const aboutSection = document.querySelector(".about-section");

        if (aboutText && aboutSection) {
            const originalHTML = aboutText.innerHTML;
            let newHTML = "";
            let inTag = false;
            for (let i = 0; i < originalHTML.length; i++) {
                const char = originalHTML[i];
                if (char === '<') {
                    inTag = true;
                }
                if (!inTag && char.trim() !== '') {
                    newHTML += `<span class="about-char" style="opacity: 0.1;">${char}</span>`;
                } else {
                    newHTML += char;
                }
                if (char === '>') {
                    inTag = false;
                }
            }
            aboutText.innerHTML = newHTML;

            const chars = aboutText.querySelectorAll('.about-char');
            gsap.fromTo(chars,
                { opacity: 0.1 },
                {
                    opacity: 1,
                    ease: "none",
                    stagger: 0.1,
                    scrollTrigger: {
                        trigger: aboutSection,
                        start: "top 75%", // Mulai perlahan saat baru masuk atas layar
                        end: "center center", // Selesai maksimal saat posisinya di tengah
                        scrub: true, // `true` agar membalik seketika saat di-scroll ke atas
                        markers: false, // DEBUG: Shows start and end lines on the screen
                    }
                }
            );
            console.log("About animation initialized successfully. Chars found:", chars.length);
        } else {
            console.error("About text or section not found:", { aboutText, aboutSection });
        }
    }

    private initHorizontalScroll() {
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
                // console.log(`Scroll Amount: ${amount} (ScrollWidth: ${scrollWidth}, ViewWidth: ${viewWidth})`);
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
    }

    private initSmartNavbar() {
        // We will assume Lenis is handled elsewhere or passed in if needed, 
        // but for Navbar we can use native scroll if Lenis syncs it, or just use Lenis instance.
        // Actually, in the original code, Smart Navbar was using Lenis 'scroll' event.
        // We normally want to decouple this. 
        // GSAP ScrollTrigger can also handle this if we want, but let's stick to the structure.
        // Since we are decoupling, we might need to pass the lenis instance or use a global current scroll.
        // For simplicity in this refactor, let's allow passing a callback or handle it in index.ts
        // BUT, let's keep it here if we can.

        // Use ScrollTrigger to detect direction
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            // Set initial state
            if (window.scrollY < 50) {
                navbar.classList.add('navbar-top');
            }

            ScrollTrigger.create({
                start: "top top",
                end: 99999,
                onUpdate: (self) => {
                    const scrollTop = self.scroll();
                    const direction = self.direction; // 1 = down, -1 = up

                    // Toggle transparent background class at the top
                    if (scrollTop < 50) {
                        navbar.classList.add('navbar-top');
                    } else {
                        navbar.classList.remove('navbar-top');
                    }

                    // Logic:
                    // 1. Scrolling UP (direction -1) OR at the very top (scrollTop < 50) -> SHOW
                    // 2. Scrolling DOWN (direction 1) AND not at top -> HIDE

                    if (direction === -1 || scrollTop < 50) {
                        navbar.classList.remove('navbar-hidden');
                    } else if (direction === 1 && scrollTop > 50) {
                        navbar.classList.add('navbar-hidden');
                    }
                }
            });
        }
    }

    private initAnchorScroll() {
        // This requires lenis if we want smooth scroll. 
        // We'll export a method to handle anchor clicks if passed a scrollTo function.
    }

    // Helper to register lenis update
    public setupLenis(lenis: any) {
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time: number) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // Re-implement anchor scroll using Lenis
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
    }

}
