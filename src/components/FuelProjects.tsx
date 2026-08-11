import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import BlurText from "@/components/BlurText";

const projects = [
  {
    id: 1,
    title: "AGENT-Rule 协作体系",
    category: "AI 设计",
    tags: ["Agent", "规则引擎", "深度回访"],
    description: "为 AI Agent 设计的通用协作规则体系，包含深度回访、编码安全、虫洞链接、BAK 机制和日志联动五大核心模块。",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dark%20futuristic%20UI%20dashboard%20with%20copper%20accent%20lines%2C%20abstract%20network%20nodes%2C%20minimal%20tech%20interface%2C%20high-end%20design&image_size=landscape_16_9",
  },
  {
    id: 2,
    title: "RunningHUB 粤菜分镜系统",
    category: "AI 视频",
    tags: ["Seedance 2.0", "分镜", "美食"],
    description: "基于 MrBeast 视频方法论演化的 AI 短视频分镜系统，专为 30 秒菜品推广设计，纯视觉叙事无字幕。",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Elegant%20Cantonese%20roast%20goose%20dish%20on%20dark%20slate%20plate%2C%20dramatic%20studio%20lighting%2C%20cinematic%20food%20photography%2C%20warm%20copper%20tones&image_size=landscape_16_9",
  },
  {
    id: 3,
    title: "MiMo Code 多智能体生态",
    category: "AI 工具",
    tags: ["MiMo", "多智能体", "技能汉化"],
    description: "为小米 MiMo Code 建立完整的苍穹生态，包含虫洞注入、技能汉化、注册表和日志体系。",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Multiple%20AI%20agents%20collaborating%20in%20dark%20digital%20space%2C%20connected%20by%20glowing%20copper%20lines%2C%20abstract%20network%20visualization%2C%20minimal&image_size=landscape_16_9",
  },
  {
    id: 4,
    title: "Remotion 宣传视频",
    category: "动效设计",
    tags: ["React", "视频", "动效"],
    description: "用 Remotion 框架以代码方式制作 AGENT-Rule 宣传视频，包含模糊文字、分裂字符、数字滚动等高级动效。",
    image: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Abstract%20motion%20graphics%20with%20split%20text%20animation%2C%20dark%20background%2C%20copper%20and%20sand%20color%20palette%2C%20modern%20kinetic%20typography&image_size=landscape_16_9",
  },
];

// 3D 倾斜卡片
function TiltCard({ children, className }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  };

  return (
    <div
      ref={cardRef}
      className={className}
      style={{ transform, transition: "transform 0.3s ease-out", transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export default function FuelProjects() {
  return (
    <section id="projects" className="py-32 bg-dark-900 relative">
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
            Selected Works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-white">
            精选作品
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <TiltCard className="group relative bg-dark-800 border border-white/10 overflow-hidden hover:border-fuel-mint/30 transition-all duration-500 cursor-pointer">
                {/* 图片 */}
                <div className="relative h-64 md:h-72 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-800 via-dark-800/30 to-transparent" />

                  {/* 悬停遮罩 */}
                  <div className="absolute inset-0 bg-fuel-mint/0 group-hover:bg-fuel-mint/5 transition-colors duration-500" />

                  {/* 悬停箭头 */}
                  <div className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center bg-black/60 backdrop-blur-sm border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:rotate-45">
                    <ArrowUpRight size={18} className="text-fuel-mint -rotate-45" />
                  </div>
                </div>

                {/* 信息 */}
                <div className="p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-xs tracking-wider text-fuel-mint uppercase">
                      {project.category}
                    </span>
                    <span className="w-8 h-px bg-fuel-mint/30" />
                    <span className="font-mono text-xs tracking-wider text-white/30 uppercase">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <BlurText
                    text={project.title}
                    animateBy="words"
                    delay={80}
                    direction="bottom"
                    stepDuration={0.4}
                    className="font-display text-xl md:text-2xl font-semibold text-white mb-3 group-hover:text-fuel-mint transition-colors"
                  />
                  <BlurText
                    text={project.description}
                    animateBy="words"
                    delay={40}
                    direction="bottom"
                    stepDuration={0.3}
                    className="text-sm text-white/60 leading-relaxed mb-4"
                  />
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 text-xs font-mono tracking-wider text-white/40 border border-white/10 bg-dark-700/50 group-hover:border-fuel-mint/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}