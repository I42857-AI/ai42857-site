import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

// ── 常量 ──

const NAV_ITEMS = [
  { id: "01", label: "首页", href: "./" },
  { id: "02", label: "作品集", href: "#work" },
  { id: "03", label: "关于我们", href: "#about" },
  { id: "04", label: "联系我们", href: "#contact" },
];

const HEADING_LINES = [
  { text: "洪观林", delay: 0.4 },
  { text: "AI 视觉设计师", delay: 0.6 },
  { text: "用 AI 重新定义视觉设计", delay: 0.8 },
];
const HEADING_HIGHLIGHT = 1; // 高亮"AI 视觉设计师"行

const SERVICE_TAGS = ["AI 视觉", "电商视觉", "产品精修", "品牌 IP", "AI 工作流"];

const PARTICLE_COLUMNS = [
  { right: 889, delay: 0.8 },
  { right: 653, delay: 0.8 },
  { right: 417, delay: 0.8 },
  { right: 181, delay: 0.8 },
];

const PARTICLE_COUNT_PER_COLUMN = 4;

// ── 动画缓动函数 ──

const EASE_HEADING = [0.44, 0, 0.34, 0.98] as const;
const EASE_BACKGROUND = [0.44, 0, 0.56, 1] as const;
const EASE_SECTION = [0.76, 0.02, 0.13, 1.01] as const;

// ── 子组件：粒子列 ──

function ParticleColumn({ right, delay }: { right: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0.001 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "spring",
        damping: 60,
        stiffness: 300,
        mass: 1,
        delay,
      }}
      className="absolute flex flex-col items-center"
      style={{ bottom: "323px", right: `${right}px`, gap: "90px", mixBlendMode: "difference" as const }}
    >
      {Array.from({ length: PARTICLE_COUNT_PER_COLUMN }).map((_, i) => (
        <div key={i} className="relative" style={{ width: 16, height: 16 }}>
          <div
            className="absolute"
            style={{
              width: 2,
              height: 16,
              left: 7,
              top: 0,
              backgroundColor: "#d1e1e8",
            }}
          />
          <div
            className="absolute"
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#d1e1e8",
            }}
          />
        </div>
      ))}
    </motion.div>
  );
}

// ── 子组件：导航栏 ──

function FuelNavbar() {
  return (
    <motion.nav
      initial={{ opacity: 0.001, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        damping: 60,
        stiffness: 300,
        mass: 1,
        delay: 0.3,
      }}
      className="absolute top-6 left-6 right-6 z-20 flex items-center justify-between"
      style={{ maxWidth: 1392, margin: "0 auto" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img src="/header-logo.png" alt="RICH²" className="h-8" />
      </div>

      {/* Navigation Items */}
      <div className="hidden md:flex items-center gap-10">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="group relative text-white/70 hover:text-white text-sm tracking-wider font-mono transition-colors duration-300"
          >
            <span className="opacity-40 mr-2">{item.id}</span>
            {item.label}
            <span className="absolute -bottom-1 left-0 h-px bg-white/40 transition-all duration-300 group-hover:w-[104%]"
              style={{ width: "1px" }}
            />
          </a>
        ))}
      </div>

      {/* CTA Button */}
      <a
        href="#contact"
        className="px-6 py-2.5 border border-white/20 text-white/80 text-sm font-mono tracking-wider hover:bg-white hover:text-black transition-all duration-300"
      >
        立即探索
      </a>
    </motion.nav>
  );
}

// ── 主组件 ──

export default function FuelHero() {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgParallaxY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const bgParallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen overflow-hidden bg-black"
      style={{ position: "sticky", top: 0 }}
    >
      {/* ── 背景图片层 ── */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0.001, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: EASE_BACKGROUND, type: "tween" }}
      >
        <motion.div
          className="w-full h-full"
          style={{ y: bgParallaxY, scale: bgParallaxScale }}
        >
          <img
            src="/people.png"
            alt="Women in Orange BG"
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>
      </motion.div>

      {/* ── 暗色遮罩 ── */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background: `
            linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      />

      {/* ── 粒子层 ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {PARTICLE_COLUMNS.map((col, i) => (
          <ParticleColumn key={i} right={col.right} delay={col.delay} />
        ))}
      </div>

      {/* ── 导航栏 ── */}
      <FuelNavbar />

      {/* ── 导航间距 ── */}
      <div className="h-[70px]" />

      {/* ── 主要内容区 ── */}
      <motion.div
        className="relative z-10 flex flex-col h-full"
        style={{ opacity: contentOpacity }}
      >
        {/* 顶部间距 */}
        <div className="flex-1" />

        {/* 标题区 */}
        <div className="px-6 max-w-[1440px] mx-auto w-full">
          {/* Section Label */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0.001 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5, ease: EASE_SECTION, type: "tween" }}
          >
            <span className="text-white/50 text-xs font-mono tracking-[0.3em] uppercase">
              Award-winning
            </span>
          </motion.div>

          {/* Subtitle */}
          <motion.div
            className="mb-2"
            initial={{ opacity: 0.001 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.5, ease: EASE_SECTION, type: "tween" }}
          >
            <h2 className="text-white/70 text-sm font-mono tracking-wider uppercase">
              美工主管 → AI 视觉设计师
            </h2>
          </motion.div>

          {/* Description */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0.001 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.5, ease: EASE_SECTION, type: "tween" }}
          >
            <p className="text-white/50 text-sm font-mono max-w-md leading-relaxed">
              8年+ 设计经验，从电商视觉到品牌 IP，再整合 AI 工作流提升 3-5 倍产出效率。
              以审美为底、以 AI 为杠杆，打造商业级视觉。
            </p>
          </motion.div>

          {/* Heading Lines */}
          <div className="mb-10">
            {HEADING_LINES.map((line, i) => (
              <motion.div
                key={line.text}
                initial={{ opacity: 0.001 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: line.delay,
                  duration: 0.5,
                  ease: EASE_HEADING,
                  type: "tween",
                }}
                className="overflow-hidden"
              >
                <h1
                  className="text-white font-black leading-none tracking-tight"
                  style={{
                    fontFamily: "'BDO Grotesk Variable', sans-serif",
                    fontSize: "clamp(40px, 8vw, 56px)",
                    lineHeight: "1",
                    letterSpacing: "-1.7px",
                    color: i === HEADING_HIGHLIGHT ? "#d1e1e8" : undefined,
                  }}
                >
                  {line.text}
                </h1>
              </motion.div>
            ))}
          </div>

          {/* Service Tags */}
          <motion.div
            className="flex gap-3 mb-16"
            initial={{ opacity: 0.001 }}
            animate={{ opacity: 1 }}
            transition={{
              type: "spring",
              damping: 60,
              stiffness: 300,
              mass: 1,
              delay: 0.6,
            }}
          >
            {SERVICE_TAGS.map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 border border-white/20 text-white/60 text-xs font-mono tracking-wider"
              >
                {tag}
              </span>
            ))}
          </motion.div>

          {/* 底部行：Logo 横幅 */}
          <div className="flex items-end justify-between w-full gap-8">
            <motion.div
              className="w-[75%]"
              initial={{ opacity: 0.001 }}
              animate={{ opacity: 1 }}
              transition={{
                type: "spring",
                damping: 60,
                stiffness: 300,
                mass: 1,
                delay: 0.1,
              }}
            >
              <div style={{ aspectRatio: "6.38095" }} className="overflow-hidden">
                <img
                  src="/logo-banner.png"
                  alt="RICH²"
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              </div>
            </motion.div>

            {/* Year */}
            <motion.span
              className="text-white/20 text-sm font-mono tracking-wider"
              initial={{ opacity: 0.001 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              19'
            </motion.span>
          </div>
        </div>

        {/* 底部间距 */}
        <div className="h-8" />
      </motion.div>
    </section>
  );
}