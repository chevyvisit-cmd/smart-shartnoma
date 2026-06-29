import { useEffect, RefObject } from "react";

interface Options {
  threshold?: number;
  baseDelay?: number;
  staggerDelay?: number;
}

export function useStaggerReveal(
  containerRef: RefObject<HTMLElement | null>,
  itemSelector: string,
  options: Options = {},
) {
  const { threshold = 0.2, baseDelay = 0, staggerDelay = 150 } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const items = container.querySelectorAll<HTMLElement>(itemSelector);
        items.forEach((el, i) => {
          el.style.opacity = "0";
          el.style.animationDelay = `${baseDelay + i * staggerDelay}ms`;
          el.style.animation = `fade-up 0.6s cubic-bezier(0.19, 1, 0.22, 1) ${baseDelay + i * staggerDelay}ms forwards`;
        });
        observer.unobserve(container);
      },
      { threshold },
    );

    const items = container.querySelectorAll<HTMLElement>(itemSelector);
    items.forEach((el) => { el.style.opacity = "0"; });

    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, itemSelector, threshold, baseDelay, staggerDelay]);
}
