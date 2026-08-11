import { motion, useScroll, useTransform } from "motion/react";
import { Mail, MapPin, Github, ExternalLink } from "lucide-react";
import { useRef } from "react";

const stats = [
  { value: "50+", label: "完成项目" },
  { value: "30+", label: "AI 技能体系" },
  { value: "8+", label: "年设计经验" },
  { value: "2", label: "AI Agent 协作" },
];

// 数字滚动动画
function CountUp({ value, suffix = "" }: { value: string; suffix?: string }) {
  const num = parseInt(value);
  if (isNaN(num)) return <>{value}</>;

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      {value}
    </motion.span>
  );
}

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
          {/* 左侧：头像+基本信息 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            {/* 头像区域 */}
            <div className="relative mb-10 group">
              <div className="w-64 h-72 bg-dark-700 relative overflow-hidden">
                <img
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20portrait%20photo%20of%20a%20creative%20Chinese%20designer%2C%20dark%20background%2C%20dramatic%20lighting%2C%20minimal%20style&image_size=portrait_4_3"
                  alt="Fuel Studio"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* 扫描线 */}
                <div className="absolute inset-0 opacity-10"
                  style={{
                    backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(209,225,232,0.1) 2px, rgba(209,225,232,0.1) 4px)",
                  }}
                />
              </div>
              {/* 装饰边框 */}
              <motion.div
                initial={{ opacity: 0, x: 10, y: 10 }}
                whileInView={{ opacity: 1, x: 12, y: 12 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute -bottom-2 -right-2 w-64 h-72 border border-fuel-mint/20"
              />
              {/* 状态指示灯 */}
              <div className="absolute -top-2 -left-2 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1.5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-fuel-mint animate-pulse" />
                <span className="font-mono text-[10px] tracking-wider text-white/60 uppercase">Available</span>
              </div>
            </div>

            {/* 联系方式 */}
            <div className="space-y-4">
              {[
                { icon: Mail, text: "hello@fuelstudio.com", href: "mailto:hello@fuelstudio.com" },
                { icon: MapPin, text: "中国 · 远程", href: undefined },
                { icon: Github, text: "Fuel-Studio", href: "https://github.com/Fuel-Studio", external: true },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-white/60 group/item"
                >
                  <item.icon size={16} className="text-fuel-mint/70 group-hover/item:text-fuel-mint transition-colors" />
                  {item.href ? (
                    <a href={item.href} target={item.external ? "_blank" : undefined} rel={item.external ? "noopener" : undefined} className="font-mono text-sm hover:text-fuel-mint transition-colors flex items-center gap-1">
                      {item.text}
                      {item.external && <ExternalLink size={12} className="opacity-50" />}
                    </a>
                  ) : (
                    <span className="font-mono text-sm">{item.text}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* 右侧：介绍+数据 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-fuel-mint/70 uppercase mb-4">
              About Us
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-8 leading-tight">
              在视觉与智能的<br />
              <span className="text-fuel-mint">交汇处</span>创造
            </h2>
            <div className="space-y-5 text-white/60 leading-relaxed">
              <p>
                Fuel Studio 是一家专注于创意设计与 AI 技术融合的工作室。我们探索设计的边界——从传统品牌视觉到 AI Agent 协作体系，从静态画面到动态交互体验。
              </p>
              <p>
                我们相信好的设计不是装饰，而是沟通。每一个项目都是一次对话——与用户对话，与技术对话，与未来对话。我们构建了完整的 AI Agent 协作体系，让多个智能体协同工作，将设计思维注入每一个环节。
              </p>
              <p>
                目前专注于 AI 驱动的视觉设计、品牌系统构建和多 Agent 协作工作流。如果你正在寻找一个既懂设计又懂 AI 的合作伙伴，我们聊聊。
              </p>
            </div>

            {/* 数据统计 */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
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
                    <CountUp value={stat.value} />
                  </div>
                  <div className="font-mono text-xs text-white/40 mt-1 tracking-wider group-hover/stat:text-fuel-mint/70 transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}