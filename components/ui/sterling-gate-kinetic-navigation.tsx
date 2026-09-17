"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./sterling-gate-kinetic-navigation.css";

type NavigationItem = {
  label: string;
  english: string;
  href: string;
};

const navigationItems: NavigationItem[] = [
  { label: "作品", english: "SELECTED WORK", href: "#work" },
  { label: "方法", english: "CREATIVE PROCESS", href: "#making" },
  { label: "系统", english: "AI SYSTEMS", href: "#systems" },
  { label: "实验室", english: "AI NATIVE LAB", href: "#lab" },
];

export function SterlingGateKineticNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeShape, setActiveShape] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const hasOpenedRef = useRef(false);
  const restoreFocusRef = useRef(true);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const overlay = root.querySelector<HTMLElement>(".kinetic-nav-overlay");
    const backdrop = root.querySelector<HTMLElement>(".kinetic-nav-backdrop");
    const panel = root.querySelector<HTMLElement>(".kinetic-nav-panel");
    const layers = root.querySelectorAll<HTMLElement>(".kinetic-nav-panel-layer");
    const links = root.querySelectorAll<HTMLElement>(".kinetic-nav-link");
    const details = root.querySelectorAll<HTMLElement>("[data-kinetic-fade]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!overlay || !backdrop || !panel) return;

    const duration = reducedMotion ? 0.01 : 0.42;
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.inOut" } });

      if (isMenuOpen) {
        hasOpenedRef.current = true;
        document.body.classList.add("nav-open");
        gsap.set(overlay, { display: "block", pointerEvents: "auto" });
        timeline
          .fromTo(backdrop, { autoAlpha: 0 }, { autoAlpha: 1, duration: duration * 0.75 })
          .fromTo(
            layers,
            { xPercent: 110 },
            { xPercent: 0, duration, stagger: reducedMotion ? 0 : 0.065 },
            "<",
          )
          .fromTo(panel, { xPercent: 104 }, { xPercent: 0, duration: duration * 1.08 }, "<+=0.08")
          .fromTo(
            links,
            { yPercent: 125, rotate: 5 },
            {
              yPercent: 0,
              rotate: 0,
              duration: duration * 0.92,
              stagger: reducedMotion ? 0 : 0.045,
            },
            "<+=0.15",
          )
          .fromTo(
            details,
            { autoAlpha: 0, y: 10 },
            { autoAlpha: 1, y: 0, duration: duration * 0.7, stagger: 0.035 },
            "<",
          )
          .call(() => firstLinkRef.current?.focus());
      } else if (hasOpenedRef.current) {
        document.body.classList.remove("nav-open");
        timeline
          .to([...links].reverse(), {
            yPercent: 120,
            duration: duration * 0.58,
            stagger: reducedMotion ? 0 : 0.025,
            ease: "power2.in",
          })
          .to(panel, { xPercent: 104, duration }, "<+=0.08")
          .to([...layers].reverse(), {
            xPercent: 110,
            duration: duration * 0.86,
            stagger: reducedMotion ? 0 : 0.045,
          }, "<")
          .to(backdrop, { autoAlpha: 0, duration: duration * 0.5 }, "<")
          .set(overlay, { display: "none", pointerEvents: "none" })
          .call(() => {
            setActiveShape(0);
            if (restoreFocusRef.current) toggleRef.current?.focus();
            restoreFocusRef.current = true;
          });
      } else {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
      }
    }, root);

    return () => ctx.revert();
  }, [isMenuOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        restoreFocusRef.current = true;
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isMenuOpen]);

  useEffect(() => () => document.body.classList.remove("nav-open"), []);

  const toggleMenu = () => {
    restoreFocusRef.current = true;
    setIsMenuOpen((open) => !open);
  };

  const closeFromLink = () => {
    restoreFocusRef.current = false;
    setIsMenuOpen(false);
  };

  return (
    <div ref={rootRef} className={isMenuOpen ? "kinetic-navigation is-open" : "kinetic-navigation"}>
      <header className="kinetic-header">
        <a className="kinetic-wordmark" href="#top" aria-label="回到首页">
          <span>LIBONAN</span>
          <small>AI VIDEO DIRECTOR · AI NATIVE</small>
        </a>

        <div className="kinetic-header-action">
          <span className="kinetic-invitation" aria-hidden="true">EXPLORE THE CUT</span>
          <button
            ref={toggleRef}
            className="kinetic-menu-toggle"
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="kinetic-site-menu"
            aria-label={isMenuOpen ? "关闭导航菜单" : "打开导航菜单"}
            onClick={toggleMenu}
          >
            <span className="kinetic-toggle-copy" aria-hidden="true">
              <span>MENU</span>
              <span>CLOSE</span>
            </span>
            <span className="kinetic-toggle-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="kinetic-nav-overlay" aria-hidden={!isMenuOpen}>
        <button
          className="kinetic-nav-backdrop"
          type="button"
          tabIndex={isMenuOpen ? 0 : -1}
          aria-label="关闭导航菜单"
          onClick={() => setIsMenuOpen(false)}
        />

        <div className="kinetic-nav-panel-layer kinetic-nav-panel-layer-one" aria-hidden="true" />
        <div className="kinetic-nav-panel-layer kinetic-nav-panel-layer-two" aria-hidden="true" />

        <section
          id="kinetic-site-menu"
          className="kinetic-nav-panel"
          role="dialog"
          aria-modal="true"
          aria-label="网站导航"
        >
          <div className="kinetic-panel-grid" aria-hidden="true" />
          <div className="kinetic-shape-field" aria-hidden="true">
            <div className={`kinetic-shape kinetic-shape-one${activeShape === 1 ? " is-active" : ""}`}><i /><i /><i /></div>
            <div className={`kinetic-shape kinetic-shape-two${activeShape === 2 ? " is-active" : ""}`}><i /><i /><i /></div>
            <div className={`kinetic-shape kinetic-shape-three${activeShape === 3 ? " is-active" : ""}`}><i /><i /><i /><i /></div>
            <div className={`kinetic-shape kinetic-shape-four${activeShape === 4 ? " is-active" : ""}`}><i /><i /><i /></div>
            <div className={`kinetic-shape kinetic-shape-five${activeShape === 5 ? " is-active" : ""}`}><i /><i /></div>
          </div>

          <div className="kinetic-panel-head" data-kinetic-fade>
            <span>SCENE SELECT</span>
            <span>AI VIDEO DIRECTOR · AI NATIVE · 2026</span>
          </div>

          <nav className="kinetic-menu" aria-label="主要导航">
            <ol className="kinetic-menu-list">
              {navigationItems.map((item, index) => (
                <li
                  key={item.href}
                  onMouseEnter={() => setActiveShape(index + 1)}
                  onMouseLeave={() => setActiveShape(0)}
                >
                  <a
                    ref={index === 0 ? firstLinkRef : undefined}
                    className="kinetic-nav-link"
                    href={item.href}
                    tabIndex={isMenuOpen ? 0 : -1}
                    onFocus={() => setActiveShape(index + 1)}
                    onBlur={() => setActiveShape(0)}
                    onClick={closeFromLink}
                  >
                    <span className="kinetic-nav-number">{String(index + 1).padStart(2, "0")}</span>
                    <span className="kinetic-nav-title">{item.label}</span>
                    <span className="kinetic-nav-english">{item.english}</span>
                    <span className="kinetic-nav-arrow" aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="kinetic-panel-foot" data-kinetic-fade>
            <p>从创作，到系统，再到一件真正可以运行的产品。</p>
            <a
              className="kinetic-resume-link"
              href="/docs/libonan-resume.pdf"
              download
              tabIndex={isMenuOpen ? 0 : -1}
              onMouseEnter={() => setActiveShape(5)}
              onMouseLeave={() => setActiveShape(0)}
              onFocus={() => setActiveShape(5)}
              onBlur={() => setActiveShape(0)}
              onClick={closeFromLink}
            >
              <span>下载完整简历</span>
              <i aria-hidden="true">↓</i>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
