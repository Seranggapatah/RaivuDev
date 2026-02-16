
/**
 * Generic Lazy Loader using IntersectionObserver
 */
export class LazyLoader {
    private observer: IntersectionObserver;

    constructor(options?: IntersectionObserverInit) {
        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target as HTMLElement;
                    this.onIntersect(target);
                    observer.unobserve(target);
                }
            });
        }, options || { rootMargin: "200px 0px" }); // Preload 200px before viewport
    }

    public observe(element: Element, callback: (el: Element) => void) {
        // Attach the callback to the element so we can call it later
        (element as any)._onIntersect = callback;
        this.observer.observe(element);
    }

    private onIntersect(element: HTMLElement) {
        if ((element as any)._onIntersect) {
            (element as any)._onIntersect(element);
            delete (element as any)._onIntersect; // Cleanup
        }
    }

    public disconnect() {
        this.observer.disconnect();
    }
}

/**
 * Validates and loads lazy videos with data-src
 */
export function initLazyVideos() {
    const lazyVideos = document.querySelectorAll("video.lazy-video");
    const videoLoader = new LazyLoader({ rootMargin: "500px 0px" }); // Load videos earlier

    lazyVideos.forEach(video => {
        videoLoader.observe(video, (el) => {
            const v = el as HTMLVideoElement;
            const dataSrc = v.getAttribute("data-src");

            // If data-src is present, swap it (standard lazy load)
            if (dataSrc) {
                v.src = dataSrc;
                v.load();
            }

            // Trigger playback (works for neither or both)
            // For preload="none" videos, calling play() starts the load
            v.play().catch(e => console.log("Autoplay prevented", e));
            v.classList.remove("lazy-video");
        });
    });
}
