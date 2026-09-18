"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import "./wizard.css";
import "./castle-entrance.css";
import "./classroom-refinement.css";
import { SpellBook } from "./SpellBook";
import "./spell-book.css";

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const castle = asset("/assets/castle/");
const portraitLayers = {
  illusion: { x: 547, y: 110, w: 439, h: 650, ax: 25, ay: 48, aw: 383, ah: 570 },
  spells: { x: 126, y: 156, w: 390, h: 320, ax: 25, ay: 42, aw: 336, ah: 246 },
  craft: { x: 1038, y: 151, w: 480, h: 339, ax: 32, ay: 45, aw: 428, ah: 263 },
  curiosity: { x: 1064, y: 536, w: 405, h: 265, ax: 28, ay: 38, aw: 346, ah: 196 },
};
const courses = [
  { id: "illusion", name: "幻象课", real: "AI 创意视频", english: "THE ART OF ILLUSION", line: "把奇思妙想，变成一支片子。", intro: "从一个念头，到最后一帧。这里展出的作品，均由我独立完成策划与制作。", left: 33, top: 13, width: 26, height: 68 },
  { id: "spells", name: "咒语研习课", real: "开发者案例 Skill", english: "THE SPELL ARCHIVE", line: "今天先不学咒语，看看咒语是怎么写出来的。", intro: "把采访提纲与口播脚本的制作经验，整理成下次还能用的 Skill。", left: 7.5, top: 18, width: 23, height: 33 },
  { id: "craft", name: "魔法工艺课", real: "Codex 自动化剪辑", english: "THE ENCHANTED WORKSHOP", line: "让标准化口播内容更快完成制作。", intro: "让 Codex 为重复剪辑搭把手，留下可查看、可复盘的制作记录。", left: 62, top: 18, width: 28, height: 34 },
  { id: "curiosity", name: "有求必应实践课", real: "更多 AI 玩法", english: "A ROOM FOR CURIOSITY", line: "课表上没有，也可以试试。", intro: "改造 Touch Bar，做一款三国卡牌游戏。好奇的时候，就动手做一点。", left: 63.5, top: 57.5, width: 25, height: 28 },
] as const;
type Room = typeof courses[number]["id"];
const films = [
  { id: "tang", title: "唐风浩荡", tag: "历史叙事 · AI 影像", hook: "这道高考题，请题目里的人来答。", copy: "让晁衡坐进现代高考考场，从一张试卷走进盛唐。用人物的视角，把历史知识变成可以跟随的故事。", script: "tang", images: [["chao-heng", "晁衡 · 人物设定"], ["edit-tang", "唐风浩荡 · 剪辑工程"]] },
  { id: "duanwu", title: "端午粽子", tag: "品牌动画 · 角色喜剧", hook: "粽子还没上桌，先开会争个 C 位。", copy: "甜粽、咸粽与可乐主管，把甜咸之争演成一场职场喜剧。角色先把戏演起来，再带出饮食与健康选择。", script: "duanwu", images: [["sweet-zong", "甜粽 · 人物设定"], ["edit-duanwu", "端午粽子 · 剪辑工程"]] },
  { id: "newyear", title: "过年有事找文心", tag: "AI × 真人 MV", hook: "过年的那些事，唱着说。", copy: "把春节里的问题写进 MV，用真人表演搭配 AI 场景，让产品进入具体的过年情境。", script: "", images: [["edit-mv", "新春 MV · 剪辑工程"]] },
  { id: "choose-hero", title: "选择你的文心英雄", tag: "产品传播 · 英雄世界观", hook: "AI 有什么本事？让英雄们出场介绍。", copy: "把文心的不同能力设计成英雄角色，用人物设定与视觉形象讲产品，让观众从角色认识功能。", script: "", images: [] },
  { id: "tough-grandma", title: "硬汉奶奶", tag: "个人故事 · AI 动画", hook: "奶奶过世三年，我用AI把她的故事做成了动画视频", copy: "奶奶过世三年，我用AI把她的故事做成了动画视频", script: "", images: [] },
];
const spellPages = [
  { name: "工作起点", title: "有些功课，\n还会再做", note: "故事各不相同，\n经验可以积累。", copy: "开发者案例视频需要长期制作。从采访准备到脚本创作，流程相对固定，积累的方法可以用于后续案例。" },
  { name: "形成初稿", title: "先完整\n做一次", note: "从一次合作里，\n记下有效的方法。", copy: "先与 AI 完整协作产出一份内容，再让它回看历史对话，将有效步骤、修改要求和判断标准整理成第一版 Skill。" },
  { name: "盲测修正", title: "换份材料，\n试试", note: "好不好用，\n拿实际内容来检验。", copy: "用过去产出的内容进行几轮盲测，根据结果找出遗漏和偏差，逐轮修正 Skill。" },
  { name: "持续迭代", title: "用过，\n再添一笔", note: "新的经验，\n留给下一次。", copy: "每次完成新案例后，让 AI 整理本次修改中积累的经验，更新 Skill，供后续工作复用。" },
];

function roomFromHash(): Room | null {
  const value = window.location.hash.slice(1);
  if (value === "work") return "illusion";
  return courses.find((course) => course.id === value)?.id ?? null;
}

export function WizardPortfolio() {
  const [room, setRoom] = useState<Room | null>(null);
  const [directHall, setDirectHall] = useState(false);
  const [homeVisit, setHomeVisit] = useState(0);
  const returningFrom = useRef<Room | null>(null);
  const [hovered, setHovered] = useState<Room | null>(null);
  const [filmIndex, setFilmIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [enlarged, setEnlarged] = useState<{ src: string; title: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [hallReady, setHallReady] = useState(false);
  const [entranceReady, setEntranceReady] = useState(false);
  const hero = useRef<HTMLElement>(null);
  const heroVideo = useRef<HTMLVideoElement>(null);
  const gallery = useRef<HTMLElement>(null);
  const hallPosition = useRef(0);
  const roomHeading = useRef<HTMLHeadingElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const selectedFilm = films[filmIndex];
  const activeCourse = courses.find((course) => course.id === room);
  const hoverCourse = courses.find((course) => course.id === hovered);

  function hallStop() {
    return hero.current ? hero.current.offsetTop + hero.current.offsetHeight - window.innerHeight : 0;
  }

  function visit(next: Room | null) {
    if (!room) hallPosition.current = Math.max(window.scrollY, hallStop());
    window.history.pushState(null, "", next ? `#${next}` : "#hall");
    setPlaying(false);
    setVideoError(false);
    returningFrom.current = room;
    if (!next) { setDirectHall(true); setHallReady(true); }
    setRoom(next);
  }

  function goHome() {
    window.history.pushState(null, "", "#home");
    setPlaying(false);
    setVideoError(false);
    setHovered(null);
    setHallReady(false);
    setRoom(null);
    setDirectHall(false);
    setHomeVisit((visit) => visit + 1);
  }

  // Finish navigation before paint. Returning to the hall never replays the journey.
  useLayoutEffect(() => {
    if (!room && !directHall && !homeVisit) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (room) roomHeading.current?.focus({ preventScroll: true });
    else if (directHall) document.querySelector<HTMLAnchorElement>(`[data-portrait="${returningFrom.current}"]`)?.focus({ preventScroll: true });
  }, [room, directHall, homeVisit]);

  useEffect(() => {
    const restore = () => {
      if (["#class-content", "#website-experiment", "#touchbar-experiment"].includes(window.location.hash)) return;
      const next = roomFromHash();
      const isHall = window.location.hash === "#hall";
      setDirectHall(isHall);
      if (isHall) setHallReady(true);
      if (!next && !isHall) setHomeVisit((visit) => visit + 1);
      setRoom(next);
      setPlaying(false);
    };
    restore();
    window.addEventListener("popstate", restore);
    window.addEventListener("hashchange", restore);
    return () => { window.removeEventListener("popstate", restore); window.removeEventListener("hashchange", restore); };
  }, []);

  useEffect(() => {
    const image = new Image();
    image.onload = () => setEntranceReady(true);
    image.src = `${castle}entrance-source.png`;
    return () => { image.onload = null; };
  }, []);

  // Preserve the original video-seeking behavior; no autoplay or timer drives it.
  useLayoutEffect(() => {
    if (room || directHall) return;
    const section = hero.current;
    const video = heroVideo.current;
    if (!section || !video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const sync = () => {
      raf = 0;
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / Math.max(1, section.offsetHeight - window.innerHeight)));
      const clamp = (value: number) => Math.max(0, Math.min(1, value));
      const ease = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
      const spell = clamp(progress / .43);
      const door = ease((progress - .55) / .20);
      const travel = ease((progress - .73) / .19);
      const entered = progress >= .94 || reduced.matches;
      section.style.setProperty("--progress", String(progress));
      section.style.setProperty("--copy-opacity", String(Math.max(0, 1 - spell * 2.4)));
      section.style.setProperty("--hero-opacity", String(1 - ease((progress - .455) / .045)));
      section.style.setProperty("--flash", String(ease((progress - .43) / .032) * (1 - ease((progress - .474) / .048))));
      section.style.setProperty("--door-angle", `${door * 88}deg`);
      section.style.setProperty("--gate-scale", String(1 + travel * 1.6));
      section.style.setProperty("--gate-opacity", String(1 - ease((progress - .91) / .025)));
      section.style.setProperty("--hall-ui", String(ease((progress - .91) / .055)));
      section.style.setProperty("--hall-scale", String(.91 + travel * .09));
      section.style.setProperty("--hall-light", String(.5 + travel * .5));
      section.style.setProperty("--door-glow", String((.2 + door * .8) * (1 - travel)));
      section.style.setProperty("--gate-caption", String(ease((progress - .50) / .035) * (1 - ease((progress - .72) / .09))));
      section.dataset.phase = entered ? "hall" : progress >= .73 ? "entering" : progress >= .55 ? "opening" : progress >= .50 ? "door" : "spell";
      setHallReady((previous) => previous === entered ? previous : entered);
      if (!reduced.matches && video.readyState >= 1 && Number.isFinite(video.duration)) {
        const target = spell * Math.max(0, video.duration - .04);
        if (Math.abs(video.currentTime - target) > .025) video.currentTime = target;
      }
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(sync); };
    video.pause();
    video.addEventListener("loadedmetadata", schedule);
    video.addEventListener("loadeddata", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reduced.addEventListener("change", schedule);
    sync();
    return () => { cancelAnimationFrame(raf); video.removeEventListener("loadedmetadata", schedule); video.removeEventListener("loadeddata", schedule); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); reduced.removeEventListener("change", schedule); };
  }, [room, directHall, homeVisit]);

  useEffect(() => {
    if (!enlarged) return;
    returnFocus.current = document.activeElement as HTMLElement;
    dialog.current?.showModal();
    const prior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prior; returnFocus.current?.focus(); };
  }, [enlarged]);

  function imageButton(src: string, title: string, className = "") {
    return <button className={`wc-image-button ${className}`} onClick={() => setEnlarged({ src, title })} aria-label={`放大查看：${title}`}><img src={src} alt={title} loading="lazy" /><span>放大查看 ↗</span></button>;
  }
  function courseLink(id: Room, children: ReactNode, className = "") {
    return <a key={id} href={`#${id}`} className={className} onClick={(event) => { event.preventDefault(); visit(id); }}>{children}</a>;
  }

  return <main className="wizard-site">
    <a className="skip-link" href={room ? "#class-content" : "#hall"} onClick={room ? undefined : (event) => { event.preventDefault(); visit(null); }}>跳到主要内容</a>
    <header className="wc-nav">
      <div className="wc-brand-group">
      <a href="#hall" className="wc-brand" onClick={(event) => { event.preventDefault(); visit(null); }}><span aria-hidden="true">✧</span> 李博楠 <small>魔法学徒 / AI 视频编导</small></a>
      <a href="#home" className="wc-home-link" onClick={(event) => { event.preventDefault(); goHome(); }}>首页</a>
      </div>
      <nav aria-label="主要导航"><a href="#hall" onClick={(event) => { event.preventDefault(); visit(null); }}>全部课程</a>{courseLink("illusion", "视频作品")}<a href="mailto:530081825@qq.com">联系我</a></nav>
    </header>

    <div hidden={room !== null}>
      <section className={`wc-opening wc-journey${directHall ? " wc-direct-hall" : ""}`} ref={hero} aria-labelledby={directHall ? "hall-title" : "opening-title"} data-phase={directHall ? "hall" : "spell"}>
        <div className="wc-opening-sticky">
          <section ref={gallery} id="hall" className="wc-hall" aria-labelledby="hall-title" inert={!directHall && !hallReady} aria-hidden={!directHall && !hallReady}>
            <div className="wc-section-heading"><span className="wc-eyebrow">THE PORTRAIT GALLERY</span><h2 id="hall-title">今晚，想先探索哪门魔法？</h2><p>在麻瓜世界，我是一名 AI 视频编导。鼠标靠近画像，看看我都做了些什么。</p></div>
            <div className="wc-stage wc-gallery-stage">
              <img className="wc-scene" src={`${castle}hall-wall.png`} alt="魔法城堡中的画像长廊" />
              {courses.map((course) => {
                const layer = portraitLayers[course.id];
                return <a key={course.id} href={`#${course.id}`} data-portrait={course.id} className={`wc-portrait wc-layered-portrait ${hovered === course.id ? "is-awake" : ""}`} style={{ left: `${layer.x / 1672 * 100}%`, top: `${layer.y / 941 * 100}%`, width: `${layer.w / 1672 * 100}%`, height: `${layer.h / 941 * 100}%` }} onMouseEnter={() => setHovered(course.id)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(course.id)} onBlur={() => setHovered(null)} onClick={(event) => { event.preventDefault(); visit(course.id); }} aria-label={`${course.name}：${course.real}，进入教室`}>
                  <span className="wc-portrait-art-window" style={{ left: `${layer.ax / layer.w * 100}%`, top: `${layer.ay / layer.h * 100}%`, width: `${layer.aw / layer.w * 100}%`, height: `${layer.ah / layer.h * 100}%` }}><img src={`${castle}layers/${course.id}-art.png`} alt="" /><span className="wc-portrait-glint" /></span>
                  <img className="wc-independent-frame" src={`${castle}layers/${course.id}-frame.png`} alt="" />
                  <span className="wc-portrait-caption"><strong>{course.name}</strong><span>{course.real} <b>↗</b></span></span>
                </a>;
              })}
              <aside className="wc-hall-note" aria-live="polite"><span className="wc-eyebrow">{hoverCourse ? "THE PAINTING WHISPERS" : "A NOTE FROM THE APPRENTICE"}</span><h3>{hoverCourse?.line ?? "随便逛逛，\n画像后面另有天地。"}</h3><p>{hoverCourse?.intro ?? "挑一幅好奇的，点进去看看。\n放心，这里没有期末考试。"}</p></aside>
            </div>
          </section>
          <div className="wc-gate" aria-hidden="true">
            <div className="wc-gate-canvas">
              <img className="wc-gate-surround" src={`${castle}layers/entrance-frame.png`} alt="" />
              <div className="wc-door wc-door-left"><img src={`${castle}layers/door-left.png`} alt="" /></div>
              <div className="wc-door wc-door-right"><img src={`${castle}layers/door-right.png`} alt="" /></div>
              <div className="wc-door-light" />
            </div>
            <p className="wc-gate-caption">门后，收着我的一些魔法练习。<small>继续向下，推门看看。</small></p>
          </div>
          <div className="wc-spell-layer">
          <video ref={heroVideo} className="wc-hero-video" muted playsInline preload="auto" poster={asset("/assets/video/hero-wand-poster.webp")} aria-hidden="true" tabIndex={-1}><source src={asset("/media/hero-wand-scroll.mp4")} type="video/mp4" /></video>
          <div className="wc-opening-shade" />
          <div className="wc-invitation"><span className="wc-eyebrow">AN INVITATION TO THE UNEXPECTED</span><h1 id="opening-title">让奇思妙想<br />触手可及。</h1><p>给屏幕前的你：<br />这里收着我的作品，还有正在练习的新魔法。</p><a href="#hall" className="wc-button" onClick={(event) => { event.preventDefault(); visit(null); }}>直接进入画像大厅 ↓</a></div>
          </div>
          <div className="wc-spell-flash" aria-hidden="true" />
          <div className="wc-scroll-hint">{hallReady ? "画像已醒，挑一门看看" : entranceReady ? "向下滚动，施展魔法" : "城堡正在苏醒…"} <span>↓</span></div>
        </div>
      </section>
        <div className="wc-course-index" aria-label="课程快捷入口">{courses.map((course) => courseLink(course.id, <><span>{course.name}</span><small>{course.real}</small><b>↗</b></>, "wc-course-shortcut"))}</div>
    </div>

    {activeCourse && <section className={`wc-room wc-room-${room}`} key={room}>
      <div className="wc-room-wayfinding"><a className="wc-back" href="#hall" onClick={(event) => { event.preventDefault(); visit(null); }}><span aria-hidden="true">← ▦</span><span>返回全部课程<small>画像大厅 · 选择其他作品与探索</small></span></a></div><div className="wc-room-heading"><span className="wc-eyebrow">{activeCourse.english}</span><h1 ref={roomHeading} tabIndex={-1}>{activeCourse.name}<small>{activeCourse.real}</small></h1><p>{activeCourse.line}</p></div>
      {room === "spells" && <p className="wc-course-intro">我把工作中反复用到的经验整理成 Skill，让 AI 在后续任务中复用，并持续改进。下面以开发者案例视频制作为例，展示这份工作指南的形成过程。</p>}
      {room === "craft" && <><p className="wc-course-intro">对于制作规格相对基础、更新频率高、更看重产出效率的内容，我整理了一套自动剪辑流程：用数字人生成口播，再交给 Codex 完成剪辑和基础效果添加，最后检查成片并调整。</p><ol className="wc-craft-flow">{["准备口播内容", "生成数字人口播", "Codex 剪辑与基础包装", "检查和调整成片"].map((step, i) => <li key={step}><span>0{i + 1}</span>{step}</li>)}</ol></>}
      <div className="wc-stage wc-classroom-stage">
        <img className="wc-scene" src={`${castle}${room === "spells" ? "spells-v2" : room}.png`} alt={`${activeCourse.name}教室场景`} />
        {room === "illusion" && <>
          <div className="wc-poster-wall">{films.map((film, index) => <button key={film.id} className={filmIndex === index ? "selected" : ""} aria-label={`选择作品：${film.title}`} aria-pressed={filmIndex === index} onClick={() => { setFilmIndex(index); setPlaying(false); setVideoError(false); }}><img src={asset(`/assets/covers/${film.id}.webp`)} alt={`${film.title}完整视频封面`} width={405} height={720} /><span>{film.title}</span></button>)}</div>
          <div className="wc-film-screen">{playing ? <video key={selectedFilm.id} controls autoPlay playsInline poster={asset(`/assets/covers/${selectedFilm.id}.webp`)} onError={() => setVideoError(true)} src={asset(`/media/${selectedFilm.id}.mp4`)} aria-label={`播放${selectedFilm.title}`} /> : <button className="wc-screen-play" onClick={() => setPlaying(true)}><img className="wc-player-poster" src={asset(`/assets/covers/${selectedFilm.id}.webp`)} alt="" /><span className="wc-play-symbol">▷</span><strong>{selectedFilm.title}</strong><span>播放完整作品</span></button>}{videoError && <div className="wc-video-error">视频暂时没加载出来。<button onClick={() => { setPlaying(false); setVideoError(false); }}>返回后重试</button></div>}</div>
          <div className="wc-film-caption"><span>{selectedFilm.tag}</span><h2>{selectedFilm.title}</h2><strong>{selectedFilm.hook}</strong>{selectedFilm.images.length > 0 && <a href="#class-content">看看制作过程 ↓</a>}</div>
        </>}
        {room === "spells" && <SpellBook chapters={spellPages} />}
        {room === "craft" && <div className="wc-workshop-records">{[1, 2, 3].map((item) => <div key={item} className={`wc-record wc-record-${item}`}>{imageButton(asset(`/assets/process/auto-edit-${item}.webp`), `自动剪辑探索记录 ${item}`)}</div>)}</div>}
        {room === "curiosity" && <><a className="wc-game-cover" href={asset("/games/weiwu-guandu/index.html")} target="_blank" rel="noreferrer"><img src={asset("/assets/guandu/weiwu-guandu-cover.png")} alt="魏武：官渡完整游戏主视觉" /><span>试玩《魏武：官渡》 ↗</span></a><a href="#touchbar-experiment" className="wc-site-portal"><span className="wc-eyebrow">TOUCH BAR EXPERIMENT</span><strong>给键盘添一道<br />小魔法。</strong><span>看看 Touch Bar 改造 ↓</span></a></>}
      </div>

      <div id="class-content" className="wc-class-content">
        {room === "illusion" && <>
          <div className="wc-tabs" aria-label="选择视频作品">{films.map((film, index) => <button key={film.id} aria-pressed={index === filmIndex} onClick={() => { setFilmIndex(index); setPlaying(false); setVideoError(false); }}>{film.title}</button>)}</div>
          <div className="wc-editorial"><div><span className="wc-eyebrow">BEHIND THE ILLUSION</span><h2>{selectedFilm.hook}</h2></div><div><p>{selectedFilm.copy}</p><p className="wc-role">从创意策划到最终成片，由我独立完成。</p>{selectedFilm.script && <a className="wc-button" href={asset(`/docs/${selectedFilm.script}-script.pdf`)} target="_blank" rel="noreferrer">查看完整创意脚本 ↗</a>}</div></div>
          <div className="wc-evidence-grid">{selectedFilm.images.map(([file, caption]) => <figure key={file}>{imageButton(asset(`/assets/process/${file}.webp`), caption)}<figcaption>{caption}</figcaption></figure>)}</div>
        </>}
        {room === "spells" && <div className="wc-evidence-single"><h2>这就是我在使用的开发者案例 Skill</h2>{imageButton(asset("/assets/process/skill-dev.webp"), "开发者案例制作 Skill")}</div>}
        {room === "craft" && <div className="wc-workshop-context"><h2>自动剪辑的实际探索记录</h2><p>上方三张截图保留了制作过程，点击可以放大查看。自动剪辑完成后，再检查内容、节奏和基础效果，调整成片。</p></div>}
        {room === "curiosity" && <><div className="wc-editorial"><div><span className="wc-eyebrow">WEIWU · GUANDU</span><h2>把三国兴趣，<br />做成一局能玩的游戏。</h2></div><div><p>《魏武：官渡》是一款围绕官渡之战制作的网页卡牌 Demo。我用它探索 AI 在视频之外的用法，让玩法、画面和网页真正放到一起。</p><div className="wc-actions"><a className="wc-button" href={asset("/games/weiwu-guandu/index.html")} target="_blank" rel="noreferrer">在线试玩 ↗</a><a className="wc-text-link" href="https://github.com/boboli121/weiwu-guandu" target="_blank" rel="noreferrer">查看 GitHub ↗</a></div></div></div>
          <div id="touchbar-experiment" className="wc-website-experiment wc-touchbar-experiment">
            <figure>{imageButton(asset("/assets/process/touchbar-demo.webp"), "Touch Bar 改造 · MacBook Pro 实机效果")}<figcaption>实机效果 · Codex 任务状态与剩余额度</figcaption></figure>
            <div><span className="wc-eyebrow">TOUCH BAR · AGENT STATUS</span><h2>给键盘添一道<br />小魔法。</h2><p>我尝试把 MacBook Pro 的 Touch Bar 改造成 Codex 任务状态栏，让 AI 的工作进度出现在手边。</p><p>哪些任务正在执行、哪些需要操作，低头就能看到。轻点任务即可回到对应对话，还能查看 5 小时与每周的剩余额度。</p><p className="wc-aside">这次施法，落在了键盘上。</p><div className="wc-actions"><a className="wc-button" href="https://github.com/boboli121/touch-bar-agent-status" target="_blank" rel="noreferrer">查看 GitHub 项目 ↗</a></div></div>
          </div></>}
        <a href="#hall" className="wc-button wc-return" onClick={(event) => { event.preventDefault(); visit(null); }}>← 返回全部课程，看看其他作品与探索</a>
      </div>
    </section>}

    <footer className="wc-footer"><span className="wc-eyebrow">BACK TO THE MUGGLE WORLD</span><h2>魔法聊过了，<br />也聊聊你的下一支片子。</h2><p>如果你正在找视频编导，我们可以从一个具体项目聊起。</p><div className="wc-actions"><a className="wc-button" href="mailto:530081825@qq.com">联系我 ↗</a><button className="wc-text-link" onClick={async () => { try { await navigator.clipboard.writeText("530081825@qq.com"); setCopied(true); } catch { setCopied(false); } }}>{copied ? "已复制" : "复制邮箱"}</button></div><p className="wc-contact-address">530081825@qq.com</p><small>李博楠 · AI 视频编导 / 魔法学徒　　<span>本次旁听，无需自备魔杖。</span></small></footer>
    {enlarged && <dialog ref={dialog} className="wc-lightbox" onClose={() => setEnlarged(null)} onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }} aria-label={enlarged.title}><div className="wc-lightbox-head"><strong>{enlarged.title}</strong><button onClick={() => dialog.current?.close()} autoFocus>关闭 ×</button></div><img src={enlarged.src} alt={enlarged.title} /></dialog>}
  </main>;
}
