"use client";

import { useEffect, useRef, useState } from "react";
import "./spell-book.css";

type Chapter = { name: string; title: string; note: string; copy: string };
const descriptions = ["重复任务卷轴与羽毛笔", "对话纸条汇成工作笔记", "试验稿的盲测与圈改", "不断添页的经验笔记"];

export function SpellBook({ chapters }: { chapters: Chapter[] }) {
  const [index, setIndex] = useState(0);
  const [turn, setTurn] = useState<{ from: number; to: number } | null>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { chapters.forEach((_, i) => { const image = new Image(); image.src = `/assets/castle/spell-chapter-${i + 1}.webp`; }); }, [chapters]);

  function turnTo(next: number) {
    if (busy.current || next === index || next < 0 || next >= chapters.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setIndex(next); return; }
    busy.current = true;
    setTurn({ from: index, to: next });
    timers.current = [setTimeout(() => setIndex(next), 400), setTimeout(() => { setTurn(null); busy.current = false; }, 850)];
  }
  const chapter = chapters[index];
  return <div className={`spell-reading ${turn ? "is-turning" : ""}`}>
    <div className="spell-page-words" key={`words-${index}`}><small>第 {index + 1} 章</small><h2>{chapter.title}</h2><p>{chapter.note}</p></div>
    <img className="spell-illustration" src={`/assets/castle/spell-chapter-${index + 1}.webp`} alt={descriptions[index]} />
    {turn && <div className={`spell-turn-sheet ${turn.to < turn.from ? "is-backward" : ""}`} aria-hidden="true"><div className="spell-sheet-front"><img src={`/assets/castle/spell-chapter-${turn.from + 1}.webp`} alt="" /></div><div className="spell-sheet-back"><span>{chapters[turn.to].title}</span></div></div>}
    <div className="spell-page-controls" aria-label="翻阅魔法笔记"><button disabled={index === 0 || !!turn} onClick={() => turnTo(index - 1)}>← 上一章</button><button disabled={!!turn} onClick={() => turnTo(index === chapters.length - 1 ? 0 : index + 1)}>{index === chapters.length - 1 ? "回看第一章 ↶" : "翻到下一章 →"}</button></div>
    <aside className="spell-floating-copy" aria-live="polite" aria-atomic="true" aria-busy={!!turn}><div key={index}><span className="wc-eyebrow">第 {index + 1} 章 / 共四章</span><h2>{chapter.name}</h2><p>{chapter.copy}</p></div></aside>
    <nav className="spell-bookmarks" aria-label="选择咒语形成章节">{chapters.map((page, i) => <button key={page.name} aria-current={index === i ? "step" : undefined} disabled={!!turn} onClick={() => turnTo(i)}><span>0{i + 1}</span>{page.name}</button>)}</nav>
  </div>;
}
