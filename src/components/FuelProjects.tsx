import { useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import BlurText from "@/components/BlurText";

const projects = [
  {
    id: 1,
    title: "Vellfire Calibration",
    category: "艺术指导",
    number: "(01)",
    tags: ["艺术指导", "摄影"],
    description: "精准的视觉校准，将工业美学与人文温度融合，打造极具冲击力的品牌视觉叙事。",
    image: "https://framerusercontent.com/images/JQZOV1weNouMXqzxyX8EWnm7zEw.png",
  },
  {
    id: 2,
    title: "Dunwill Lanson",
    category: "摄影",
    number: "(02)",
    tags: ["摄影", "艺术指导"],
    description: "通过镜头语言捕捉品牌灵魂，将光影与情感交织，构建独特的视觉身份体系。",
    image: "https://framerusercontent.com/images/rmeBLxZhEpvUaEnrIirzHJQynwc.png",
  },
  {
    id: 3,
    title: "Noara Willis",
    category: "策略",
    number: "(03)",
    tags: ["策略", "品牌"],
    description: "深度策略驱动的品牌重塑项目，从定位到执行，全方位提升品牌影响力与市场认知。",
    image: "https://framerusercontent.com/images/Jt7zqgTjQMYT15YvEkLGKiF9Cw.png",
  },
  {
    id: 4,
    title: "Nike Studios",
    category: "艺术指导",
    number: "(04)",
    tags: ["艺术指导", "运动"],
    description: "为全球运动品牌打造沉浸式视觉体验，将运动精神与前沿设计语言完美融合。",
    image: "https://framerusercontent.com/images/yIiUMXJoon44xe3SOzMh1ekTV6w.png",
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
    <section id="work" className="py-32 bg-dark-900 relative">
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

                  <div className="absolute inset-0 bg-fuel-mint/0 group-hover:bg-fuel-mint/5 transition-colors duration-500" />

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
                      {project.number}
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