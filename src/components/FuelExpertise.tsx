import { motion } from "motion/react";
import { Palette, Cpu, Layers, Zap, Eye, Workflow } from "lucide-react";
import BlurText from "@/components/BlurText";

const expertise = [
  {
    icon: Palette,
    title: "视觉设计",
    description: "从品牌识别到界面设计，用克制的视觉语言传递精准的信息。深色系、高级感、有呼吸感。",
  },
  {
    icon: Cpu,
    title: "AI 设计",
    description: "构建 AI Agent 协作体系，让多个智能体协同工作。深度回访、编码安全、虫洞链接——设计不只是视觉，更是系统。",
  },
  {
    icon: Layers,
    title: "品牌系统",
    description: "不是 Logo + 配色，而是一套完整的视觉语言体系。从命名规范到文件架构，每个细节都有逻辑。",
  },
  {
    icon: Zap,
    title: "动效设计",
    description: "用 Remotion 以代码写视频，用 Motion 做交互动效。不是模板转场，是精心编排的视觉叙事。",
  },
  {
    icon: Eye,
    title: "用户体验",
    description: "设计不是自我表达，是替用户解决问题。10 秒建立印象，3 分钟深入理解，全程无摩擦。",
  },
  {
    icon: Workflow,
    title: "工作流设计",
    description: "从需求到交付的全链路设计。苍穹生态、虫洞体系、日志联动——让工具适应人，不是人适应工具。",
  },
];

export default function FuelExpertise() {
  return (
    <section id="expertise" className="py-32 bg-black relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <p className="font-mono text-xs tracking-[0.3em] text-fuel-mint/70 uppercase mb-4">
            Core Expertise
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white">
            核心专长
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertise.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 bg-dark-800/50 border border-white/10 hover:border-fuel-mint/20 transition-all duration-500 relative overflow-hidden"
            >
              {/* 悬停光晕 */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-fuel-mint/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="w-12 h-12 flex items-center justify-center border border-fuel-mint/30 mb-6 group-hover:border-fuel-mint/60 transition-colors">
                  <item.icon size={22} className="text-fuel-mint" />
                </div>
                <h3 className="font-display text-xl font-semibold text-white mb-3 group-hover:text-fuel-mint transition-colors">
                  {item.title}
                </h3>
                <BlurText
                  text={item.description}
                  animateBy="words"
                  delay={30}
                  direction="bottom"
                  stepDuration={0.3}
                  className="text-sm text-white/60 leading-relaxed"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}