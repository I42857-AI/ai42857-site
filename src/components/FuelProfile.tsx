import { motion } from "motion/react";
import { Phone, Mail, MapPin, Sparkles, Workflow } from "lucide-react";

// ── 个人档案数据（来自 GeRen-ShuJu-ZhuanJia 个人数据专家）──

const profile = {
  name: "洪观林",
  code: "142",
  title: "AI 视觉设计师 / 视觉设计总监",
  tagline: "8年+设计经验 · AI 工作流整合 · 全品类项目覆盖",
  phone: "19200141125",
  email: "sayhi@rich2studio.com",
  city: "深圳",
  education: "湖南工业职业技术学院 · 动漫设计与制作（2014-2017）",
  years: "8+",
  management: "3-8 人",
  labels: ["AI 视觉", "电商视觉", "产品精修", "品牌 IP", "AI 工作流"],
  aiWorkflows: [
    {
      name: "AI 手表场景合成",
      result: "传统 2 小时 → 30 分钟",
    },
    {
      name: "AI 灯饰氛围图",
      result: "传统 3 小时 → 45 分钟",
    },
    {
      name: "AI 电商主图批量",
      result: "传统 1 天 → 2 小时",
    },
    {
      name: "AI 短视频分镜→成片",
      result: "传统 3 天 → 1 天",
    },
  ],
};

export default function FuelProfile() {
  return (
    <section id="profile" className="py-32 bg-dark-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent" />

      {/* 背景装饰 */}
      <div className="absolute -left-40 bottom-20 w-[500px] h-[500px] bg-fuel-mint/3 rounded-full blur-[120px] pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20">
          {/* 左侧：数字名片 */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-dark-800 border border-white/10 p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-fuel-mint/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-2 h-2 rounded-full bg-fuel-mint animate-pulse" />
                    <span className="font-mono text-[10px] tracking-wider text-white/50 uppercase">
                      Digital Business Card
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-fuel-mint/60">#{profile.code}</span>
                  </div>

                  <h3 className="font-display text-4xl font-semibold text-white mb-2">
                    {profile.name}
                  </h3>
                  <p className="font-mono text-sm text-fuel-mint mb-4">{profile.title}</p>
                  <p className="text-white/50 text-sm leading-relaxed mb-6">{profile.tagline}</p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Phone size={16} className="text-fuel-mint/70" />
                      {profile.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <Mail size={16} className="text-fuel-mint/70" />
                      {profile.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <MapPin size={16} className="text-fuel-mint/70" />
                      {profile.city}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {profile.labels.map((label) => (
                      <span
                        key={label}
                        className="px-3 py-1 text-xs font-mono tracking-wider text-fuel-mint/70 border border-fuel-mint/20"
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* 右侧：个人数据 + AI 工作流 */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <p className="font-mono text-xs tracking-[0.3em] text-fuel-mint/70 uppercase mb-4">
              (个人介绍)
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-white mb-8 leading-tight">
              我是 <span className="text-fuel-mint">洪观林</span>，<br />
              用 AI 重新定义视觉设计。
            </h2>

            {/* 核心数据 */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="border-l border-fuel-mint/30 pl-4"
              >
                <div className="font-display text-3xl md:text-4xl font-semibold text-white">
                  {profile.years} 年
                </div>
                <div className="font-mono text-xs text-white/40 mt-1 tracking-wider">设计经验</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="border-l border-fuel-mint/30 pl-4"
              >
                <div className="font-display text-3xl md:text-4xl font-semibold text-white">
                  {profile.management} 人
                </div>
                <div className="font-mono text-xs text-white/40 mt-1 tracking-wider">团队管理</div>
              </motion.div>
            </div>

            {/* AI 工作流效率提升 */}
            <p className="font-mono text-xs tracking-wider text-fuel-mint/60 uppercase mb-4 flex items-center gap-2">
              <Workflow size={14} /> AI 工作流效率提升
            </p>
            <div className="space-y-4 mb-8">
              {profile.aiWorkflows.map((flow, i) => (
                <motion.div
                  key={flow.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="flex items-center justify-between gap-4 border-b border-white/5 pb-3 group"
                >
                  <span className="text-sm text-white/70 group-hover:text-fuel-mint transition-colors">
                    {flow.name}
                  </span>
                  <span className="font-mono text-xs text-fuel-mint/70 whitespace-nowrap">
                    {flow.result}
                  </span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="flex items-center gap-2 text-sm text-white/40"
            >
              <Sparkles size={14} className="text-fuel-mint/60" />
              {profile.education}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}