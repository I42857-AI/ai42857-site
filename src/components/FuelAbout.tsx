import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const phases = [
  {
    title: "(前期)",
    description: "以精准和有意识的设计点燃创意。RICH² 将原始创造力转化为结构化的视觉系统，塑造品牌并提升数字体验。"
  },
  {
    title: "(+后期)",
    description: "秉承大胆美学与功能极简主义，RICH² 将现代形态与有意义的细节相融合，打造推动品牌前进的精致体验。"
  },
  {
    title: "(=成果)",
    description: "通过清晰和有意识的设计引导视觉识别。RICH² 塑造连贯的叙事，将品牌提升到美学之上，创造具有锐度的永恒表达。"
  }
];

const stats = [
  { value: "15", label: "新客户" },
  { value: "100%", label: "成功率" },
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
              超越简单的真实，<br />
              <span className="text-fuel-mint">创建精致的系统</span>来塑造数字存在。
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
                立即探索
              </a>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}