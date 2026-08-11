import { motion, useScroll, useTransform } from "motion/react";
import { Phone, Mail, ArrowUpRight } from "lucide-react";
import { useRef } from "react";

export default function FuelContact() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end end"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [0, 1]);

  return (
    <section id="contact" ref={sectionRef} className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent" />

      {/* 背景装饰 */}
      <div className="absolute inset-0">
        <motion.div
          style={{ scale }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuel-mint/5 rounded-full blur-[120px]"
        />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-white/3 rounded-full blur-[80px]" />
      </div>

      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(209,225,232,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(209,225,232,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <motion.div
        style={{ opacity }}
        className="section-container relative z-10 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-mono text-xs tracking-[0.3em] text-fuel-mint/70 uppercase mb-6">
            Get In Touch
          </p>
          <h2 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-8 leading-tight">
            我们更快、更好、<br />
            <span className="text-fuel-mint">更优惠</span>
          </h2>
          <p className="text-lg text-white/60 max-w-xl mx-auto mb-12 leading-relaxed">
            选择方案，提交工作需求，您的创意项目将在 24 小时内启动。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6"
        >
          <a
            href="mailto:sayhi@rich2studio.com"
            className="group relative flex items-center gap-3 px-10 py-4 bg-fuel-mint text-black font-mono text-sm tracking-wider overflow-hidden hover:bg-fuel-mint/80 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Mail size={18} />
              发送邮件
              <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
          <a
            href="tel:19200141125"
            className="group relative flex items-center gap-3 px-10 py-4 bg-fuel-mint/10 text-white border border-fuel-mint/30 font-mono text-sm tracking-wider overflow-hidden hover:bg-fuel-mint hover:text-black transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              <Phone size={18} />
              19200141125
            </span>
          </a>
          <a
            href="https://www.youtube.com/"
            target="_blank"
            rel="noopener"
            className="group flex items-center gap-3 px-10 py-4 border border-white/20 text-white/80 font-mono text-sm tracking-wider hover:border-fuel-mint/50 hover:text-fuel-mint transition-all duration-300"
          >
            YouTube
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mt-24 h-px bg-gradient-to-r from-transparent via-fuel-mint/20 to-transparent origin-center"
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-white/30 tracking-wider">
            <span>&copy; 2026 RICH². All rights reserved.</span>
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-fuel-mint/50" />
              sayhi@rich2studio.com
            </span>
            <span>rich2studio.com</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}