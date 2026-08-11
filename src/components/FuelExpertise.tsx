import { motion } from "motion/react";
import { Camera, Layout, Eye, Sparkles, PenTool, Layers } from "lucide-react";
import BlurText from "@/components/BlurText";

const expertise = [
  {
    icon: Camera,
    title: "电商视觉",
    description: "手表多品牌（Fido dido/MLB/Casima）与餐饮品牌的电商全链路视觉，覆盖天猫/淘宝/京东/1688/抖音，把控材质与光影质感。",
  },
  {
    icon: Layout,
    title: "产品精修",
    description: "石英表精修（表盘/指针/金属表带/玻璃表镜）、灯饰精修（吸顶灯/风扇灯/餐厅吊灯光影），以专业细致呈现商业级质感。",
  },
  {
    icon: Eye,
    title: "品牌 IP",
    description: "品牌 IP 形象、吉祥物、VI 体系设计与衍生品品控，贯通从形象创意到落地一致的全流程，强化品牌识别。",
  },
  {
    icon: Sparkles,
    title: "AI 工作流",
    description: "整合 TRAE + RunningHub + Seedance，从提示词到成品全自动化，生图/精修/视频产出效率提升 3-5 倍。",
  },
  {
    icon: PenTool,
    title: "品牌视觉",
    description: "公众号页面、品牌 VI、海报与社交媒体视觉，区分品牌调性，打造统一且有识别度的视觉输出。",
  },
  {
    icon: Layers,
    title: "团队管理",
    description: "管理 3-8 人美工团队，建立设计规范体系与标准化工作流程，新人带教体系，通过模板化提升产能 30%+。",
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
            核心能力
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