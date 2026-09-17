"use client";

import React, {
  Children,
  cloneElement,
  createRef,
  forwardRef,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import gsap from "gsap";
import "./CardSwap.css";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  customClass?: string;
};

type CardElementProps = CardProps & RefAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ customClass, className, ...rest }, ref) => (
    <div
      ref={ref}
      {...rest}
      className={`card ${customClass ?? ""} ${className ?? ""}`.trim()}
    />
  ),
);
Card.displayName = "Card";

type CardSwapProps = {
  width?: number | string;
  height?: number | string;
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  scrollDriven?: boolean;
  onCardClick?: (index: number) => void;
  onActiveChange?: (index: number) => void;
  skewAmount?: number;
  easing?: "linear" | "elastic";
  children: ReactNode;
};

const makeSlot = (index: number, distX: number, distY: number, total: number) => ({
  x: index * distX,
  y: -index * distY,
  z: -index * distX * 1.5,
  zIndex: total - index,
});

const placeNow = (
  element: HTMLDivElement | null,
  slot: ReturnType<typeof makeSlot>,
  skew: number,
) => {
  if (!element) return;
  gsap.set(element, {
    x: slot.x,
    y: slot.y,
    z: slot.z,
    xPercent: -50,
    yPercent: -50,
    skewY: skew,
    transformOrigin: "center center",
    zIndex: slot.zIndex,
    force3D: true,
  });
};

export default function CardSwap({
  width = 500,
  height = 400,
  cardDistance = 60,
  verticalDistance = 70,
  delay = 5000,
  pauseOnHover = false,
  scrollDriven = false,
  onCardClick,
  onActiveChange,
  skewAmount = 6,
  easing = "elastic",
  children,
}: CardSwapProps) {
  const config =
    easing === "elastic"
      ? {
          ease: "elastic.out(0.6,0.9)",
          durDrop: 1.25,
          durMove: 1.35,
          durReturn: 1.35,
          promoteOverlap: 0.82,
          returnDelay: 0.08,
        }
      : {
          ease: "power1.inOut",
          durDrop: 0.7,
          durMove: 0.75,
          durReturn: 0.75,
          promoteOverlap: 0.45,
          returnDelay: 0.2,
        };

  const childArr = useMemo(() => Children.toArray(children), [children]);
  const refs = useMemo(
    () => childArr.map(() => createRef<HTMLDivElement>()),
    [childArr.length],
  );
  const order = useRef(Array.from({ length: childArr.length }, (_, index) => index));
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const total = refs.length;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialOrder = Array.from({ length: total }, (_, index) => index);
    order.current = initialOrder;

    const resetSlots = () => {
      order.current.forEach((cardIndex, slotIndex) => {
        placeNow(
          refs[cardIndex].current,
          makeSlot(slotIndex, cardDistance, verticalDistance, total),
          reducedMotion.matches ? 0 : skewAmount,
        );
      });
    };

    const clearTimer = () => {
      if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    const swap = () => {
      if (order.current.length < 2 || reducedMotion.matches) return;

      const [front, ...rest] = order.current;
      const frontElement = refs[front].current;
      if (!frontElement) return;

      timelineRef.current?.kill();
      const timeline = gsap.timeline();
      timelineRef.current = timeline;

      timeline.to(frontElement, {
        y: "+=500",
        duration: config.durDrop,
        ease: config.ease,
      });

      timeline.addLabel("promote", `-=${config.durDrop * config.promoteOverlap}`);
      rest.forEach((cardIndex, index) => {
        const element = refs[cardIndex].current;
        const slot = makeSlot(index, cardDistance, verticalDistance, refs.length);
        timeline.set(element, { zIndex: slot.zIndex }, "promote");
        timeline.to(
          element,
          {
            x: slot.x,
            y: slot.y,
            z: slot.z,
            duration: config.durMove,
            ease: config.ease,
          },
          `promote+=${index * 0.12}`,
        );
      });

      const backSlot = makeSlot(refs.length - 1, cardDistance, verticalDistance, refs.length);
      timeline.addLabel("return", `promote+=${config.durMove * config.returnDelay}`);
      timeline.call(
        () => gsap.set(frontElement, { zIndex: backSlot.zIndex }),
        undefined,
        "return",
      );
      timeline.to(
        frontElement,
        {
          x: backSlot.x,
          y: backSlot.y,
          z: backSlot.z,
          duration: config.durReturn,
          ease: config.ease,
        },
        "return",
      );
      timeline.call(() => {
        order.current = [...rest, front];
      });
    };

    const startTimer = () => {
      clearTimer();
      if (!reducedMotion.matches) intervalRef.current = window.setInterval(swap, delay);
    };

    const pause = () => {
      timelineRef.current?.pause();
      clearTimer();
    };
    const resume = () => {
      timelineRef.current?.play();
      startTimer();
    };
    const handleMotionPreference = () => {
      timelineRef.current?.kill();
      resetSlots();
      if (reducedMotion.matches) clearTimer();
      else startTimer();
    };

    resetSlots();

    if (scrollDriven) {
      const container = containerRef.current;
      const scrollOwner = container?.closest<HTMLElement>("[data-card-swap-scroll]");
      if (!container || !scrollOwner || total < 2) return;

      const scrollTimeline = gsap.timeline({ paused: true });
      let visualOrder = [...initialOrder];

      for (let step = 0; step < total - 1; step += 1) {
        const segmentStart = step;
        const [front, ...rest] = visualOrder;
        const frontElement = refs[front].current;
        const segmentClock = { progress: 0 };

        // A one-second invisible clock keeps every card transition mapped to an
        // equal portion of the section's scroll distance.
        scrollTimeline.to(
          segmentClock,
          { progress: 1, duration: 1, ease: "none" },
          segmentStart,
        );

        if (frontElement) {
          scrollTimeline.to(
            frontElement,
            { y: "+=500", duration: 0.36, ease: "power2.in" },
            segmentStart,
          );
        }

        rest.forEach((cardIndex, slotIndex) => {
          const element = refs[cardIndex].current;
          if (!element) return;
          const slot = makeSlot(slotIndex, cardDistance, verticalDistance, total);

          scrollTimeline.set(element, { zIndex: slot.zIndex }, segmentStart + 0.12);
          scrollTimeline.to(
            element,
            {
              x: slot.x,
              y: slot.y,
              z: slot.z,
              duration: 0.52,
              ease: "power2.out",
            },
            segmentStart + 0.16 + slotIndex * 0.04,
          );
        });

        if (frontElement) {
          const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
          scrollTimeline.set(
            frontElement,
            { zIndex: backSlot.zIndex },
            segmentStart + 0.4,
          );
          scrollTimeline.to(
            frontElement,
            {
              x: backSlot.x,
              y: backSlot.y,
              z: backSlot.z,
              duration: 0.48,
              ease: "power2.out",
            },
            segmentStart + 0.42,
          );
        }

        visualOrder = [...rest, front];
      }

      timelineRef.current = scrollTimeline;
      let animationFrame = 0;
      let reducedStep = -1;
      let activeCard = -1;

      const placeReducedMotionStep = (step: number) => {
        if (step === reducedStep) return;
        reducedStep = step;
        const rotatedOrder = [
          ...initialOrder.slice(step),
          ...initialOrder.slice(0, step),
        ];
        order.current = rotatedOrder;
        rotatedOrder.forEach((cardIndex, slotIndex) => {
          placeNow(
            refs[cardIndex].current,
            makeSlot(slotIndex, cardDistance, verticalDistance, total),
            0,
          );
        });
      };

      const syncToScroll = () => {
        animationFrame = 0;
        const bounds = scrollOwner.getBoundingClientRect();
        const scrollDistance = Math.max(1, scrollOwner.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -bounds.top / scrollDistance));
        const activeStep = Math.min(total - 1, Math.round(progress * (total - 1)));

        if (activeCard !== activeStep) {
          activeCard = activeStep;
          onActiveChange?.(initialOrder[activeStep]);
        }

        if (reducedMotion.matches) {
          placeReducedMotionStep(activeStep);
        } else {
          reducedStep = -1;
          scrollTimeline.progress(progress, false);
        }
      };

      const requestSync = () => {
        if (!animationFrame) animationFrame = window.requestAnimationFrame(syncToScroll);
      };
      const handleScrollMotionPreference = () => {
        if (reducedMotion.matches) scrollTimeline.pause();
        else resetSlots();
        requestSync();
      };

      window.addEventListener("scroll", requestSync, { passive: true });
      window.addEventListener("resize", requestSync);
      reducedMotion.addEventListener("change", handleScrollMotionPreference);
      syncToScroll();

      return () => {
        window.removeEventListener("scroll", requestSync);
        window.removeEventListener("resize", requestSync);
        reducedMotion.removeEventListener("change", handleScrollMotionPreference);
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        scrollTimeline.kill();
      };
    }

    startTimer();

    const container = containerRef.current;
    if (pauseOnHover && container) {
      container.addEventListener("mouseenter", pause);
      container.addEventListener("mouseleave", resume);
      container.addEventListener("focusin", pause);
      container.addEventListener("focusout", resume);
    }
    reducedMotion.addEventListener("change", handleMotionPreference);

    return () => {
      if (pauseOnHover && container) {
        container.removeEventListener("mouseenter", pause);
        container.removeEventListener("mouseleave", resume);
        container.removeEventListener("focusin", pause);
        container.removeEventListener("focusout", resume);
      }
      reducedMotion.removeEventListener("change", handleMotionPreference);
      clearTimer();
      timelineRef.current?.kill();
    };
  }, [cardDistance, verticalDistance, delay, pauseOnHover, scrollDriven, onActiveChange, skewAmount, easing, refs, config.durDrop, config.durMove, config.durReturn, config.ease, config.promoteOverlap, config.returnDelay]);

  const rendered = childArr.map((child, index) => {
    if (!isValidElement(child)) return child;
    const element = child as ReactElement<CardElementProps>;
    return cloneElement(element, {
      key: index,
      ref: refs[index],
      style: {
        width,
        height,
        ...(element.props.style as CSSProperties | undefined),
      },
      onClick: (event) => {
        element.props.onClick?.(event);
        onCardClick?.(index);
      },
    });
  });

  return (
    <div ref={containerRef} className="card-swap-container" style={{ width, height }}>
      {rendered}
    </div>
  );
}
