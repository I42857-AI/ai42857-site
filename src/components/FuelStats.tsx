import { motion } from "motion/react";

const globalStats = [
  { value: "2.06M", label: "全球曝光量" },
  { value: "160K", label: "社区覆盖" },
  { value: "19'", label: "速度成就" },
  { value: "257+", label: "创意工时记录" },
  { value: "122+", label: "项目完成数" },
];

const testimonial = {
  quote: "Fuel delivered with clarity. Their structured workflow and fast turnaround made our redesign launch seamless. They've become our trusted partner for every major creative push.",
  author: "Adrian Velasco",
  role: "创意总监",
  tags: ["可靠执行", "客户满意度", "无缝交付"],
};

export default function FuelStats() {
  return (
    <section className="py-24 bg-dark-900 relative">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent" />

      <div className="section-container">
        {/* 全球数据统计 */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-20">
          {globalStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-2">
                {stat.value}
              </div>
              <div className="font-mono text-xs text-white/40 tracking-wider group-hover:text-fuel-mint/70 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* 客户评价 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="relative">
            <div className="text-6xl text-fuel-mint/10 font-serif absolute -top-8 left-0 leading-none">&ldquo;</div>
            <blockquote className="text-lg md:text-xl text-white/70 leading-relaxed italic font-light px-8">
              {testimonial.quote}
            </blockquote>
            <div className="mt-6">
              <p className="font-display text-white font-semibold">{testimonial.author}</p>
              <p className="font-mono text-xs text-white/40 tracking-wider mt-1">{testimonial.role}</p>
            </div>
            <div className="flex justify-center gap-3 mt-6">
              {testimonial.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-mono tracking-wider text-fuel-mint/60 border border-fuel-mint/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}