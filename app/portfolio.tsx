"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Project = {
  number: string;
  title: string;
  english: string;
  category: string;
  line: string;
  poster: string;
  video: string;
  tone: "orange" | "blue" | "gold" | "mint";
};

const projects: Project[] = [
  {
    number: "01",
    title: "端午粽子",
    english: "THE C-STAND RICE DUMPLING",
    category: "品牌动画 · 角色喜剧",
    line: "让粽子进入职场，把健康选择变成一场有角色、有冲突、有笑点的 C 位评选。",
    poster: "/assets/covers/duanwu.webp",
    video: "/media/duanwu.mp4",
    tone: "orange",
  },
  {
    number: "02",
    title: "过年有事找文心",
    english: "ASK WENXIN FOR THE NEW YEAR",
    category: "AI × 真人 MV · 新春传播",
    line: "把春节里的真实问题写进 MV，用真人表演与 AI 场景共同制造年味。",
    poster: "/assets/covers/newyear.webp",
    video: "/media/newyear.mp4",
    tone: "blue",
  },
  {
    number: "03",
    title: "唐风浩荡",
    english: "A LETTER ACROSS 1,300 YEARS",
    category: "历史叙事 · AI 影像",
    line: "让一位唐代人物跨越千年，从自己的视角回答一道高考历史题。",
    poster: "/assets/covers/tang.webp",
    video: "/media/tang.mp4",
    tone: "gold",
  },
  {
    number: "04",
    title: "选择你的文心英雄",
    english: "CHOOSE YOUR WENXIN HERO",
    category: "产品传播 · 英雄世界观",
    line: "把抽象的 AI 能力变成可以选择、可以理解、也可以记住的英雄角色。",
    poster: "/assets/covers/choose-hero.webp",
    video: "/media/choose-hero.mp4",
    tone: "mint",
  },
];

const workbench = [
  ["叙事与推演", "ChatGPT · Gemini"],
  ["图像生成", "Image 2 · Nano Banana · Midjourney"],
  ["视频生成", "可灵 · 即梦"],
  ["智能体", "Codex · OpenClaw · Dodo"],
  ["剪辑后期", "剪映 · Final Cut Pro · DaVinci Resolve"],
  ["Skill 与插件", "开发者案例制作 Skill · 小红书自媒体制作 Skill · humanizer-zh · Remotion"],
];

const systems = [
  ["开发者案例制作 Skill", "IN USE", "将技术信息转译成能被理解、能被记住的案例叙事。"],
  ["小红书自媒体制作 Skill", "IN USE", "沉淀选题、脚本、口吻与发布检查，让内容生产可复用。"],
  ["Codex × Remotion", "PROTOTYPE COMPLETE", "以时间码驱动动态图形，由智能体完成生成、合成与规格验证。"],
  ["数字人口播工作流", "PROTOTYPING", "探索教程类内容的脚本、数字人、剪辑和发布自动化。"],
  ["个人网站 Vibe Coding", "BUILDING LIVE", "从视觉设定到网页实现，让这座网站本身成为实验样本。"],
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

export function Portfolio() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [timecode, setTimecode] = useState("00:00.00");
  const heroSequenceRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll("[data-reveal]").forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const totalSeconds = (window.scrollY / max) * 74;
      const seconds = Math.floor(totalSeconds);
      const frames = Math.floor((totalSeconds - seconds) * 30);
      setTimecode(`00:${String(seconds).padStart(2, "0")}.${String(frames).padStart(2, "0")}`);
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const section = heroSequenceRef.current;
    const video = heroVideoRef.current;
    if (!section || !video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;

    const syncHero = () => {
      animationFrame = 0;
      const scrollDistance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -section.getBoundingClientRect().top / scrollDistance));

      section.style.setProperty("--hero-progress", progress.toFixed(4));
      section.style.setProperty("--hero-copy-opacity", Math.max(0, 1 - progress * 2.4).toFixed(3));
      section.style.setProperty("--hero-copy-shift", `${Math.min(36, progress * 36).toFixed(1)}px`);

      if (reducedMotion.matches) {
        section.style.setProperty("--hero-copy-opacity", "1");
        section.style.setProperty("--hero-copy-shift", "0px");
        video.pause();
        return;
      }

      if (video.readyState >= 1 && Number.isFinite(video.duration)) {
        const targetTime = progress * Math.max(0, video.duration - 0.04);
        if (Math.abs(video.currentTime - targetTime) > 0.025) video.currentTime = targetTime;
      }
    };

    const scheduleSync = () => {
      if (!animationFrame) animationFrame = requestAnimationFrame(syncHero);
    };

    video.pause();
    video.addEventListener("loadedmetadata", syncHero);
    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    reducedMotion.addEventListener("change", scheduleSync);
    syncHero();

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      video.removeEventListener("loadedmetadata", syncHero);
      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
      reducedMotion.removeEventListener("change", scheduleSync);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("modal-open", Boolean(selected));
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.classList.remove("modal-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [selected]);

  const navItems = useMemo(
    () => [
      ["作品", "#work"],
      ["幕后", "#making"],
      ["AI 系统", "#systems"],
      ["关于", "#about"],
    ],
    [],
  );

  return (
    <main>
      <a className="skip-link" href="#content">跳到主要内容</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="回到首页">
          <span>LIBONAN</span>
          <small>AI VIDEO DIRECTOR</small>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "关闭" : "菜单"}
        </button>
        <nav id="site-menu" className={menuOpen ? "nav is-open" : "nav"} aria-label="主要导航">
          {navItems.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
          ))}
          <a className="nav-resume" href="/docs/libonan-resume.pdf" download>下载简历 <Arrow /></a>
        </nav>
      </header>

      <div className="time-rail" aria-hidden="true">
        <span>{timecode}</span>
        <i />
        <span>30 FPS</span>
      </div>

      <section ref={heroSequenceRef} id="top" className="hero-sequence" aria-labelledby="hero-title">
        <div className="hero">
          <picture className="hero-picture">
            <source media="(max-width: 720px)" srcSet="/assets/hero-mobile.webp" />
            <img src="/assets/hero-desktop.webp" alt="李博楠手持发光魔杖，站在奇幻影像世界之中" fetchPriority="high" />
          </picture>
          <video
            ref={heroVideoRef}
            className="hero-video"
            muted
            playsInline
            preload="auto"
            poster="/assets/video/hero-wand-poster.webp"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src="/media/hero-wand-scroll.mp4" type="video/mp4" />
          </video>
          <div className="hero-vignette" />
          <div className="hero-index" aria-hidden="true">SCENE 00 · THE OPENING</div>
          <div className="hero-content" data-reveal>
            <p className="eyebrow">李博楠 · AI 视频编导</p>
            <h1 id="hero-title">让奇思妙想<br />触手可及</h1>
            <p className="hero-copy">而我，是那个懂得如何挥动魔杖的人。</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#work">进入作品 <span aria-hidden="true">↓</span></a>
              <button className="button button-ghost" type="button" onClick={() => setSelected(projects[0])}>播放代表作 <span aria-hidden="true">▶</span></button>
            </div>
          </div>
          <div className="scroll-cue" aria-hidden="true"><span>SCROLL TO CAST</span><i /></div>
        </div>
      </section>

      <div id="content">
        <section className="manifesto section-shell">
          <div className="section-kicker" data-reveal><span>01</span> DIRECTOR&apos;S NOTE</div>
          <div className="manifesto-grid">
            <h2 data-reveal>看起来像<br /><em>魔法。</em></h2>
            <div className="manifesto-copy" data-reveal>
              <p>其实，每一帧都被设计过。</p>
              <p>从传播洞察、脚本分镜，到角色设定、AI 生成、剪辑与发布，我让工具服务于故事，而不是让故事迁就工具。</p>
              <div className="manifesto-tags"><span>STORY FIRST</span><span>AI NATIVE</span><span>FULL LOOP</span></div>
            </div>
          </div>
        </section>

        <section id="work" className="work-section">
          <div className="section-shell work-heading">
            <div className="section-kicker inverse" data-reveal><span>02</span> SELECTED WORK</div>
            <h2 data-reveal>四次完整施法。<br /><em>四种叙事答案。</em></h2>
          </div>
          <div className="projects">
            {projects.map((project, index) => (
              <article className={`project project-${project.tone}`} key={project.title}>
                <div className="project-info" data-reveal>
                  <div className="project-number">{project.number}</div>
                  <p className="project-category">{project.category}</p>
                  <h3>{project.title}</h3>
                  <p className="project-english">{project.english}</p>
                  <p className="project-line">{project.line}</p>
                  <p className="project-role"><span>我的角色</span> 独立负责传播洞察、创意概念、脚本、分镜、角色设定、AI 生成、剪辑与发布全流程。</p>
                  <button className="project-play" type="button" onClick={() => setSelected(project)}>
                    <span className="play-icon" aria-hidden="true">▶</span>
                    播放完整作品
                  </button>
                </div>
                <button className="project-visual" type="button" onClick={() => setSelected(project)} aria-label={`播放《${project.title}》`} data-reveal>
                  <img src={project.poster} alt={`${project.title}视频封面`} loading={index > 0 ? "lazy" : "eager"} />
                  <span className="visual-scan" aria-hidden="true" />
                  <span className="visual-label">PLAY FILM · {project.number}</span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="making" className="making section-shell">
          <div className="section-kicker" data-reveal><span>03</span> BEHIND THE MAGIC</div>
          <div className="making-intro">
            <h2 data-reveal>魔法不是<br /><em>一句提示词。</em></h2>
            <p data-reveal>一次完整的 AI 视频创作，是连续的导演判断：找到传播切口、写出冲突、锁定角色、试出镜头，再把生成素材变成有节奏的成片。</p>
          </div>
          <div className="workflow-line" data-reveal aria-label="工作流程">
            {[
              ["01", "洞察"], ["02", "概念"], ["03", "脚本"], ["04", "角色"],
              ["05", "生成"], ["06", "剪辑"], ["07", "发布"],
            ].map(([number, label]) => <div key={number}><span>{number}</span><strong>{label}</strong></div>)}
          </div>
          <div className="evidence-grid">
            <a className="evidence evidence-script" href="/docs/duanwu-script.pdf" target="_blank" rel="noreferrer" data-reveal>
              <span className="evidence-label">SCRIPT / 端午创意脚本</span>
              <strong>从职场梗，到角色冲突，再到逐镜提示词。</strong>
              <span className="evidence-link">查看脚本 <Arrow /></span>
            </a>
            <figure className="evidence evidence-image tall" data-reveal>
              <img src="/assets/process/sweet-zong.webp" alt="甜粽角色设定图" loading="lazy" />
              <figcaption>CHARACTER DESIGN / 甜粽人设</figcaption>
            </figure>
            <figure className="evidence evidence-image" data-reveal>
              <img src="/assets/process/edit-duanwu.webp" alt="端午粽子剪辑工程界面" loading="lazy" />
              <figcaption>EDITING / 端午工程</figcaption>
            </figure>
            <figure className="evidence evidence-image" data-reveal>
              <img src="/assets/process/chao-heng.webp" alt="晁衡角色设定图" loading="lazy" />
              <figcaption>CHARACTER DESIGN / 晁衡人设</figcaption>
            </figure>
            <a className="evidence evidence-script blue" href="/docs/tang-script.pdf" target="_blank" rel="noreferrer" data-reveal>
              <span className="evidence-label">SCRIPT / 唐风浩荡</span>
              <strong>让晁衡亲自回答一道高考历史题。</strong>
              <span className="evidence-link">查看脚本 <Arrow /></span>
            </a>
            <figure className="evidence evidence-image wide" data-reveal>
              <img src="/assets/process/edit-tang.webp" alt="唐风浩荡剪辑工程界面" loading="lazy" />
              <figcaption>EDITING / 唐风浩荡工程</figcaption>
            </figure>
          </div>
        </section>

        <section className="workbench">
          <div className="section-shell">
            <div className="section-kicker inverse" data-reveal><span>04</span> AI WORKBENCH</div>
            <div className="workbench-title">
              <h2 data-reveal>工具很多。<br /><em>导演只有一个。</em></h2>
              <p data-reveal>我持续探索不同模型与工具，但选择标准始终是：它能否更准确、更高效地服务此刻的叙事任务。</p>
            </div>
            <div className="tool-grid">
              {workbench.map(([name, tools], index) => (
                <div className="tool-card" key={name} data-reveal>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{name}</h3>
                  <p>{tools}</p>
                </div>
              ))}
            </div>
            <div className="skill-strip" data-reveal>
              <figure><img src="/assets/process/skill-dev.webp" alt="开发者案例制作 Skill 截图" loading="lazy" /><figcaption>SELF-BUILT · DEV CASE</figcaption></figure>
              <figure><img src="/assets/process/skill-xhs.webp" alt="小红书自媒体制作 Skill 截图" loading="lazy" /><figcaption>SELF-BUILT · XHS CREATOR</figcaption></figure>
              <figure><img src="/assets/process/skill-humanizer.webp" alt="humanizer-zh Skill 截图" loading="lazy" /><figcaption>PLUGIN · HUMANIZER-ZH</figcaption></figure>
            </div>
          </div>
        </section>

        <section id="systems" className="systems section-shell">
          <div className="section-kicker" data-reveal><span>05</span> MAKE IT REUSABLE</div>
          <div className="systems-head">
            <h2 data-reveal>把一次经验，变成<br /><em>下一次的起点。</em></h2>
            <div data-reveal>
              <p>对我而言，深入使用 AI，不在于调用过多少模型。而在于能否把一次解决问题的经验，沉淀成下一次可以直接调用的能力。</p>
              <strong>把经验写成 Skill。把 Skill 交给智能体。再把结果写回经验。</strong>
            </div>
          </div>
          <div className="loop" data-reveal aria-label="经验沉淀循环">
            {['重复工作','提炼经验','封装 Skill','智能体调用','快速执行','结果复盘','更新 Skill'].map((item, index) => (
              <div key={item}><span>{String(index + 1).padStart(2, '0')}</span>{item}<i aria-hidden="true">→</i></div>
            ))}
          </div>
          <div className="prototype-copy" data-reveal>
            <div><span>CASE / 001</span><strong>自动剪辑探索</strong></div>
            <p>从一条 48.3 秒的口播素材出发，先完成停顿清理、录屏穿插、字幕与配乐；再根据口播时间码规划 6 组动画，由多个智能体并行生成、合成并完成规格验证。</p>
            <mark>PROTOTYPE COMPLETE / 已完成首轮原型验证</mark>
          </div>
          <div className="prototype-gallery">
            {[
              ["/assets/process/auto-edit-1.webp", "EDIT COMPLETE → REQUEST MOTION"],
              ["/assets/process/auto-edit-2.webp", "SCRIPT → TIMECODE → MOTION PLAN"],
              ["/assets/process/auto-edit-3.webp", "AGENTS → RENDER → COMPOSE → VERIFY"],
            ].map(([src, caption]) => (
              <figure key={src} data-reveal><img src={src} alt={caption} loading="lazy" /><figcaption>{caption}</figcaption></figure>
            ))}
          </div>
          <div className="system-list">
            {systems.map(([name, status, description], index) => (
              <article key={name} data-reveal>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
                <p>{description}</p>
                <mark>{status}</mark>
              </article>
            ))}
          </div>
        </section>

        <section className="impact">
          <div className="section-shell">
            <div className="section-kicker inverse" data-reveal><span>06</span> IMPACT & EXPERIENCE</div>
            <div className="metrics">
              <div data-reveal><strong>245%</strong><span>文心快码视频号<br />粉丝增长</span></div>
              <div data-reveal><strong>105万</strong><span>B 站原创视频<br />累计播放</span></div>
              <div data-reveal><strong>10万+</strong><span>MrBeast 联合营销<br />传播曝光</span></div>
            </div>
            <div className="experience">
              <article data-reveal>
                <time>2023.04 — 至今</time>
                <h3>百度</h3>
                <p>集团公关 · 视频编导</p>
                <span>品牌传播 / AI 内容 / 全流程制作</span>
              </article>
              <article data-reveal>
                <time>2021.08 — 2022.08</time>
                <h3>深圳千里骏马</h3>
                <p>视频编导</p>
                <span>创意策划 / 拍摄执行 / 后期剪辑</span>
              </article>
            </div>
            <p className="resume-note" data-reveal>这里只保留最关键的两段经历。教育背景、完整项目与详细信息，可下载简历查看。</p>
          </div>
        </section>

        <section id="about" className="about section-shell">
          <div className="section-kicker" data-reveal><span>07</span> BEYOND THE FRAME</div>
          <div className="about-grid">
            <div className="about-copy" data-reveal>
              <h2>我不只是在<br />使用 AI。<br /><em>我享受探索。</em></h2>
              <p>新的工具、新的叙事方式、新的工作流，都会让我产生“还能不能再往前一步”的冲动。自驱力不是一句标签，而是我反复把陌生问题变成熟练能力的过程。</p>
              <p>戏剧影视文学专业的训练，让我相信技术最终仍要落回人物、情绪与故事。</p>
            </div>
            <figure className="about-photo portrait" data-reveal><img src="/assets/about/portrait.webp" alt="李博楠正面半身照" loading="lazy" /></figure>
            <figure className="about-photo life-2" data-reveal><img src="/assets/about/life-2.webp" alt="李博楠生活照片" loading="lazy" /></figure>
            <figure className="about-photo life-3" data-reveal><img src="/assets/about/life-3.webp" alt="李博楠生活照片" loading="lazy" /></figure>
            <figure className="about-photo life-4" data-reveal><img src="/assets/about/life-4.webp" alt="李博楠生活照片" loading="lazy" /></figure>
            <figure className="about-photo life-5" data-reveal><img src="/assets/about/life-5.webp" alt="李博楠生活照片" loading="lazy" /></figure>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-marquee" aria-hidden="true">LET&apos;S MAKE SOMETHING MAGIC · LET&apos;S MAKE SOMETHING MAGIC ·</div>
          <div className="section-shell footer-inner">
            <p className="eyebrow">AVAILABLE FOR AI VIDEO DIRECTION</p>
            <h2>下一支值得被看见的<br />AI 视频，<em>也许可以一起完成。</em></h2>
            <div className="footer-actions">
              <a className="button button-primary" href="mailto:530081825@qq.com">发邮件聊聊 <Arrow /></a>
              <a className="button button-ghost light" href="/docs/libonan-resume.pdf" download>下载完整简历 ↓</a>
              <a className="text-link" href="#work">再看一次作品 ↑</a>
            </div>
            <div className="footer-bottom"><span>李博楠 · AI 视频编导</span><a href="mailto:530081825@qq.com">530081825@qq.com</a><span>© 2026</span></div>
          </div>
        </footer>
      </div>

      {selected && (
        <div className="video-modal" role="dialog" aria-modal="true" aria-label={`播放《${selected.title}》`} onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}>
          <div className="modal-panel">
            <div className="modal-head"><div><span>NOW PLAYING</span><strong>{selected.title}</strong></div><button type="button" onClick={() => setSelected(null)} aria-label="关闭视频">关闭 ×</button></div>
            <video src={selected.video} poster={selected.poster} controls autoPlay playsInline preload="metadata" />
          </div>
        </div>
      )}
    </main>
  );
}
