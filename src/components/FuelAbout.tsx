import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const phases = [
  {
    title: "(电商视觉)",
    description: "承担手表多品牌（Fido dido/MLB/Casima）与餐饮品牌的电商视觉体系，覆盖天猫/淘宝/京东/1688/抖音，把控材质与光影质感。"
  },
  {
    title: "(品牌 IP)",
    description: "为品牌设计 IP 形象、吉祥物与 VI 体系，贯通从形象设计到衍生品品控的全流程，让品牌形象落地一致。"
  },
  {
    title: "(AI 工作流)",
    description: "整合 TRAE + RunningHub AI 工作流，从提示词到成品全自动化，提升 3-5 倍产出效率，打造垂直领域稀缺能力。"
  }
];

const stats = [
  { value: "8+", label: "年设计经验" },
  { value: "3-8", label: "人团队管理" },
];

export default function FuelAbout() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="about" ref={sectionRef} className="py-32 bg-black relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent" />

      {/* 背景装饰 */}
      <motion.div
        style={{ y: parallaxY }}
        className="absolute -right-40 top-20 w-[500px] h-[500px] bg-fuel-mint/3 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* 左侧：头像 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="relative mb-10 group">
              <div className="w-64 h-72 bg-dark-700 relative overflow-hidden">
                <img
                  src="https://framerusercontent.com/images/mrONGfTFus0kct22YjoSh0JjU.png"
                  alt="RICH² Studio"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(209,225,232,0.1) 2px, rgba(209,225,232,0.1) 4px)",
                  }}
                />
              </div>
              <motion.div
                initial={{ opacity: 0, x: 10, y: 10 }}
                whileInView={{ opacity: 1, x: 12, y: 12 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-2 -right-2 w-64 h-72 border border-fuel-mint/20"
              />
              <div className="absolute -top-2 -left-2 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-fuel-mint animate-pulse" />
                <span className="font-mono text-[10px] tracking-wider text-white/60 uppercase">Available</span>
              </div>
            </div>
          </motion.div>

          {/* 右侧：介绍 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-fuel-mint/70 uppercase mb-4">
              (关于我)
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-8 leading-tight">
              审美为底，<br />
              <span className="text-fuel-mint">AI 为杠杆</span>，塑造商业视觉。
            </h2>

            {/* 阶段描述 */}
            <div className="space-y-8 mb-12">
              {phases.map((phase) => (
                <div key={phase.title} className="border-l border-fuel-mint/20 pl-4">
                  <h3 className="font-mono text-sm text-fuel-mint/80 mb-2">{phase.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">{phase.description}</p>
                </div>
              ))}
            </div>

            {/* 数据统计 */}
            <div className="grid grid-cols-2 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="border-l border-fuel-mint/30 pl-4 group/stat hover:border-fuel-mint/60 transition-colors"
                >
                  <div className="font-display text-3xl md:text-4xl font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="font-mono text-xs text-white/40 mt-1 tracking-wider group-hover/stat:text-fuel-mint/70 transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-fuel-mint text-black text-sm font-mono tracking-wider hover:bg-fuel-mint/80 transition-all duration-300"
              >
                立即联系
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}