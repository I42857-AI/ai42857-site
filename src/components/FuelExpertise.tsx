import { motion } from "motion/react";
import { Camera, Layout, Eye } from "lucide-react";
import BlurText from "@/components/BlurText";

const expertise = [
  {
    icon: Camera,
    title: "品牌影像",
    description: "精心打造具有情绪、精准度和情感深度的影像。RICH² 捕捉经过策划和有目的的时刻，将简单的视觉转化为强大的品牌故事。",
  },
  {
    icon: Layout,
    title: "概念框架",
    description: "以洞察力、方向和清晰度构建创意。RICH² 构建深思熟虑的框架，定义定位，强化身份，推动品牌走向长期影响力。",
  },
  {
    icon: Eye,
    title: "创意监督",
    description: "通过清晰和有意识的设计引导视觉识别。RICH² 塑造连贯的叙事，将品牌提升到美学之上，创造具有锐度的永恒表达。",
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {expertise.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group p-8 bg-dark-800/50 border border-white/10 hover:border-fuel-mint/20 transition-all duration-500 relative overflow-hidden"
            >
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