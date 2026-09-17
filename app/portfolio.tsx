"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SterlingGateKineticNavigation } from "../components/ui/sterling-gate-kinetic-navigation";
import MagicBento from "../components/MagicBento";
import ScrollStack, { ScrollStackItem } from "../components/ScrollStack";
import CardSwap, { Card } from "./CardSwap";

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
  ["叙事与推演", "ChatGPT · Gemini", "拆解传播问题，验证故事结构与角色动机。"],
  ["图像生成", "Image 2 · Nano Banana · Midjourney", "先锁定人物与视觉规则，再追求单张画面的惊艳。"],
  ["视频生成", "可灵 · 即梦", "根据动作幅度、镜头连续性和风格稳定性选择模型。"],
  ["智能体", "Codex · OpenClaw · Dodo", "把资料处理、开发和重复执行交给可协作的智能体。"],
  ["剪辑后期", "剪映 · Final Cut Pro · DaVinci Resolve", "让生成素材重新服从节奏、情绪和传播目标。"],
  ["Skill 与插件", "自建 Skill · humanizer-zh · Remotion", "把已经验证的经验，变成下一次可以直接调用的能力。"],
];

const aiCapabilities = [
  ["01", "定义问题", "把模糊需求转译成清晰的创作命题。"],
  ["02", "跨模态创作", "在脚本、图像、视频、声音之间建立统一叙事。"],
  ["03", "工具编排", "按任务选择模型，而不是让任务迁就工具。"],
  ["04", "系统沉淀", "把重复经验封装成 Skill 与智能体工作流。"],
  ["05", "探索落地", "快速进入陌生领域，做出可验证的真实结果。"],
];

const processStages = [
  ["01", "找到真正的问题", "INSIGHT & CONCEPT", "传播对象是谁、这一刻为什么值得被看见、观众最后要记住什么。"],
  ["02", "建立叙事规则", "SCRIPT & STORYBOARD", "把洞察写成冲突、角色、动作和可执行的镜头语言。"],
  ["03", "锁定视觉连续性", "CHARACTER & GENERATION", "先解决人物、服装、场景与光线的一致性，再生成运动。"],
  ["04", "让素材成为作品", "EDIT & DELIVERY", "用剪辑、声音、字幕和发布规格，把生成结果变成完整成片。"],
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
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [timecode, setTimecode] = useState("00:00.00");
  const heroSequenceRef = useRef<HTMLElement>(null);
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const activeProject = projects[activeProjectIndex];
  const handleActiveProjectChange = useCallback((index: number) => {
    setActiveProjectIndex(index);
  }, []);

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

  return (
    <main>
      <a className="skip-link" href="#content">跳到主要内容</a>
      <SterlingGateKineticNavigation />

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
            <p className="eyebrow">李博楠 · AI 视频编导 / AI NATIVE CREATOR</p>
            <h1 id="hero-title">让奇思妙想<br />触手可及</h1>
            <p className="hero-copy">我把 AI 当作创作伙伴、生产系统和探索工具——从一个想法出发，把它推进成内容、工作流，甚至一件真正可以运行的产品。</p>
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
              <p>AI Native 不是熟练掌握多少工具，而是面对陌生问题时，能够迅速理解、拆解、组织能力，并把想法推进到可验证的结果。</p>
              <div className="manifesto-tags"><span>STORY FIRST</span><span>AI NATIVE</span><span>FULL LOOP</span><span>KEEP EXPLORING</span></div>
            </div>
          </div>
          <div className="capability-rail" aria-label="AI Native 核心能力">
            {aiCapabilities.map(([number, title, copy]) => (
              <article key={number} data-reveal><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
        </section>

        <section id="work" className="work-section">
          <div className="section-shell work-heading">
            <div className="section-kicker inverse" data-reveal><span>02</span> SELECTED WORK</div>
            <h2 data-reveal>四次完整施法。<br /><em>四种叙事答案。</em></h2>
          </div>
          <div className="work-swap section-shell" data-card-swap-scroll>
            <div className="work-swap-sticky">
              <div className="work-swap-intro" data-reveal>
                <p className="work-swap-overline">SELECTED CASES · 01—04</p>
                <p className="work-swap-lead">每张封面，都是一次从传播问题到最终成片的独立闭环。</p>
                <div
                  className={`work-swap-detail work-swap-detail-${activeProject.tone}`}
                  key={activeProject.title}
                >
                  <div className="work-swap-meta">
                    <span>FILM · {activeProject.number}</span>
                    <span>{activeProject.category}</span>
                  </div>
                  <h3>{activeProject.title}</h3>
                  <p className="work-swap-english">{activeProject.english}</p>
                  <p className="work-swap-line">{activeProject.line}</p>
                  <p className="work-swap-role"><span>独立闭环</span> 洞察 · 创意 · 脚本 · 分镜 · 生成 · 剪辑 · 发布</p>
                  <button className="work-swap-play" type="button" onClick={() => setSelected(activeProject)}>
                    <span>播放完整作品</span>
                    <i aria-hidden="true">▶</i>
                  </button>
                </div>
                <div className="work-swap-guide" aria-hidden="true">
                  <span>SCROLL TO SWAP</span>
                  <i />
                  <span>{activeProject.number} / 04</span>
                </div>
              </div>
              <div className="work-swap-stage" data-reveal>
                <CardSwap
                  width={405}
                  height={720}
                  cardDistance={34}
                  verticalDistance={32}
                  scrollDriven
                  skewAmount={2.4}
                  easing="elastic"
                  onActiveChange={handleActiveProjectChange}
                  onCardClick={(index) => setSelected(projects[index])}
                >
                  {projects.map((project, index) => (
                    <Card
                      key={project.title}
                      customClass={`project-card project-card-${project.tone}`}
                      role="button"
                      tabIndex={0}
                      aria-label={`播放《${project.title}》`}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelected(project);
                        }
                      }}
                    >
                      <div className="project-cover-frame">
                        <img
                          className="project-cover-backdrop"
                          src={project.poster}
                          alt=""
                          aria-hidden="true"
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                        <span className="project-cover-wash" aria-hidden="true" />
                        <img
                          className="project-cover-art"
                          src={project.poster}
                          alt={`${project.title}完整视频封面`}
                          loading={index === 0 ? "eager" : "lazy"}
                        />
                      </div>
                    </Card>
                  ))}
                </CardSwap>
              </div>
            </div>
          </div>
        </section>

        <section id="making" className="making section-shell">
          <div className="section-kicker" data-reveal><span>03</span> BEHIND THE MAGIC</div>
          <div className="making-intro">
            <h2 data-reveal>魔法不是<br /><em>一句提示词。</em></h2>
            <p data-reveal>一次完整的 AI 视频创作，是连续的导演判断：找到传播切口、写出冲突、锁定角色、试出镜头，再把生成素材变成有节奏的成片。</p>
          </div>
          <ScrollStack
            className="director-scroll-stack"
            itemDistance={150}
            itemScale={0.025}
            itemStackDistance={24}
            stackPosition="15%"
            scaleEndPosition="7%"
            baseScale={0.9}
            rotationAmount={0.35}
            blurAmount={0}
            useWindowScroll
          >
            {processStages.map(([number, title, english, copy], index) => (
              <ScrollStackItem itemClassName={`director-stack-card stage-${index + 1}`} key={number}>
                <div className="process-index"><span>{number}</span><small>DIRECTOR PHASE</small></div>
                <div className={`process-signal signal-${index + 1}`} aria-hidden="true"><i /><i /><i /><b /></div>
                <div className="process-copy"><small>{english}</small><h3>{title}</h3><p>{copy}</p></div>
                <span className="process-state" aria-hidden="true">0{index + 1} / 04</span>
              </ScrollStackItem>
            ))}
          </ScrollStack>
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
              <p data-reveal>我持续探索模型与工具，但真正重要的不是清单长度，而是能否在正确的时刻，把正确的能力组织到同一个目标上。</p>
            </div>
            <div className="decision-core" data-reveal>
              <span>DIRECTOR DECISION CORE</span>
              <strong>目标 → 判断 → 调度 → 验证</strong>
              <p>故事和结果在中心，工具围绕任务流动。</p>
            </div>
            <div className="workbench-bento" data-reveal>
              <MagicBento
                items={workbench.map(([name, tools, decision], index) => ({
                  color: "rgba(8, 13, 31, .82)",
                  label: `${String(index + 1).padStart(2, "0")} · ${tools}`,
                  title: name,
                  description: decision,
                }))}
                textAutoHide={false}
                enableStars={false}
                enableSpotlight
                enableBorderGlow
                enableTilt
                glowColor="77, 120, 255"
                clickEffect
                enableMagnetism={false}
              />
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
          <div className="system-cycle" data-reveal aria-label="经验沉淀循环">
            <div className="cycle-orbit" aria-hidden="true"><i /><i /><i /><span>AI<br />FLYWHEEL</span></div>
            <div className="cycle-steps">
              <article tabIndex={0}><span>INPUT / 01</span><strong>真实项目经验</strong><p>识别其中可复用的判断、步骤与检查标准。</p><i>CAPTURE</i></article>
              <article tabIndex={0}><span>PACKAGE / 02</span><strong>可调用的 Skill</strong><p>把零散经验写成结构化能力，不必从空白开始。</p><i>ENCODE</i></article>
              <article tabIndex={0}><span>AGENT / 03</span><strong>智能体执行与迭代</strong><p>快速复用、复盘结果，并将新发现继续写回系统。</p><i>EVOLVE</i></article>
            </div>
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
                <span><i />{String(index + 1).padStart(2, "0")}</span>
                <h3>{name}</h3>
                <p>{description}</p>
                <mark>{status}</mark>
              </article>
            ))}
          </div>
        </section>

        <section id="lab" className="ai-lab">
          <div className="section-shell">
            <div className="section-kicker inverse" data-reveal><span>06</span> AI NATIVE / EXPLORATION LAB</div>
            <div className="lab-intro">
              <h2 data-reveal>我用 AI，打开<br /><em>原本不会开始的项目。</em></h2>
              <p data-reveal>AI 带来的最大变化，不只是让熟悉的工作更快，而是让一个人有机会进入过去不会进入的领域，并把好奇心推进成真实结果。</p>
            </div>

            <article className="guandu-case" data-reveal>
              <div className="guandu-visual">
                <img
                  className="guandu-key-visual"
                  src="/assets/guandu/weiwu-guandu-cover.png"
                  alt="《魏武：官渡》曹操与袁绍对峙的水墨风主视觉"
                  width={1672}
                  height={941}
                  loading="lazy"
                />
                <span className="guandu-stamp">PERSONAL AI PRODUCT · PLAYABLE DEMO</span>
              </div>

              <div className="guandu-copy">
                <p className="eyebrow">CASE / 魏武：官渡</p>
                <h3>从历史兴趣出发，<br />做一款真正可以玩的卡牌游戏。</h3>
                <p>这是一次 AI 协同完成复杂产品的个人实验：从官渡之战研究、世界观与文案风格，到三阵两胜、三列布阵、跨阵资源等玩法机制，再到 AI 美术、交互开发、测试与上线。</p>
                <div className="guandu-path" aria-label="项目能力路径">
                  {['历史研究','玩法设计','规则系统','AI 美术','Vibe Coding','测试发布'].map((item, index) => (
                    <span key={item}><i>{String(index + 1).padStart(2, '0')}</i>{item}</span>
                  ))}
                </div>
                <blockquote>它证明的不是“我会做游戏”，而是我能借助 AI 快速进入陌生领域，把一个想法推进到可运行、可验证、可持续迭代。</blockquote>
                <div className="guandu-actions">
                  <a className="button guandu-primary" href="https://boboli121.github.io/weiwu-guandu/" target="_blank" rel="noreferrer">立即在线试玩 <Arrow /></a>
                  <a className="button guandu-secondary" href="https://github.com/boboli121/weiwu-guandu" target="_blank" rel="noreferrer">查看 GitHub <Arrow /></a>
                </div>
              </div>
            </article>

            <div className="native-statement" data-reveal>
              <span>WHAT AI NATIVE MEANS TO ME</span>
              <p>面对陌生问题，快速理解、拆解、调用合适能力，<em>把想法推到真实世界。</em></p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-marquee" aria-hidden="true">LET&apos;S MAKE SOMETHING MAGIC · LET&apos;S MAKE SOMETHING MAGIC ·</div>
          <div className="section-shell footer-inner">
            <p className="eyebrow">AVAILABLE FOR AI VIDEO DIRECTION</p>
            <h2>需要一个理解内容，<br />也愿意拓展 <em>AI 创作边界</em>的人？</h2>
            <div className="footer-actions">
              <a className="button button-primary" href="mailto:530081825@qq.com">发邮件聊聊 <Arrow /></a>
              <a className="button button-ghost light" href="/docs/libonan-resume.pdf" download>下载完整简历 ↓</a>
              <a className="text-link" href="#work">再看一次作品 ↑</a>
            </div>
            <div className="footer-bottom"><span>李博楠 · AI 视频编导 / AI Native Creator</span><a href="mailto:530081825@qq.com">530081825@qq.com</a><span>© 2026</span></div>
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
