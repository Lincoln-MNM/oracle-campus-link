import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, useSpring } from "framer-motion";
import developerImg from "@/assets/developers/developer-1.png";

interface Developer {
  name: string;
  role: string;
  tagline: string;
  image: string;
  accent: string;
  accentGlow: string;
  skills: { label: string; icon: string }[];
}

const developer: Developer = {
  name: "ADITHYA",
  role: "Full Stack Developer",
  tagline: "Turning caffeine into production-ready code.",
  image: developerImg,
  accent: "from-blue-500 via-indigo-500 to-violet-600",
  accentGlow: "rgba(99,102,241,0.4)",
  skills: [
    { label: "React", icon: "⚛️" },
    { label: "Node", icon: "🟢" },
    { label: "Python", icon: "🐍" },
    { label: "Docker", icon: "🐳" },
    { label: "AWS", icon: "☁️" },
  ],
};

const DevelopersSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const bgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, -15]), { stiffness: 80, damping: 20 });
  const bgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 80, damping: 20 });
  const imgX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 100, damping: 25 });
  const imgY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-5, 5]), { stiffness: 100, damping: 25 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const [isHovered, setIsHovered] = useState(false);

  // Animation sequence variants
  const nameVariants = {
    hidden: { y: -80, opacity: 0, filter: "blur(12px)" },
    visible: {
      y: 0,
      opacity: 0.07,
      filter: "blur(0px)",
      transition: { duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const imageVariants = {
    hidden: { y: 60, opacity: 0, scale: 0.92 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const textVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
    }),
  };

  const skillVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        delay: 0.7 + i * 0.08,
      },
    }),
  };

  return (
    <section
      id="developers"
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20"
      style={{ background: "linear-gradient(180deg, hsl(222 47% 6%) 0%, hsl(224 50% 10%) 50%, hsl(222 47% 6%) 100%)" }}
    >
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
          style={{
            background: `radial-gradient(circle, ${developer.accentGlow}, transparent 70%)`,
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10 blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(139,92,246,0.5), transparent 70%)",
            bottom: "10%",
            right: "20%",
          }}
        />
      </div>

      {/* Grid lines overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Section heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-20"
      >
        <p className="text-xs font-mono uppercase tracking-[0.3em] text-indigo-400/70 mb-1">
          // Meet the Team
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white/90 font-display">
          Developers
        </h2>
      </motion.div>

      <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto px-4">
        {/* Large vertical background name */}
        <motion.div
          variants={nameVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ x: bgX, y: bgY }}
          className="absolute select-none pointer-events-none z-0"
        >
          <div className="flex flex-col items-center leading-[0.85]">
            {developer.name.split("").map((char, i) => (
              <span
                key={i}
                className="text-[8rem] sm:text-[10rem] md:text-[13rem] font-black font-display text-white tracking-tighter"
                style={{ lineHeight: 0.82 }}
              >
                {char}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Developer character image */}
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          style={{ x: imgX, y: imgY }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          className="relative z-10 cursor-pointer"
        >
          {/* Glow behind character */}
          <motion.div
            animate={{
              boxShadow: isHovered
                ? `0 0 120px 40px ${developer.accentGlow}, 0 0 60px 20px ${developer.accentGlow}`
                : `0 0 80px 20px ${developer.accentGlow}, 0 0 40px 10px rgba(99,102,241,0.15)`,
            }}
            transition={{ duration: 0.4 }}
            className="absolute inset-x-8 bottom-0 h-[60%] rounded-full blur-2xl"
          />

          {/* Drop shadow */}
          <div
            className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-[60%] h-[30px] rounded-[50%] blur-xl"
            style={{ background: "rgba(0,0,0,0.5)" }}
          />

          <motion.img
            src={developer.image}
            alt={developer.name}
            className="relative z-10 h-[340px] sm:h-[420px] md:h-[500px] w-auto object-contain drop-shadow-2xl"
            animate={{ scale: isHovered ? 1.03 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />

          {/* Skill icons floating around character */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {developer.skills.map((skill, i) => {
              const positions = [
                { top: "8%", right: "-10%" },
                { top: "25%", left: "-14%" },
                { bottom: "35%", right: "-12%" },
                { bottom: "18%", left: "-10%" },
                { top: "50%", right: "-16%" },
              ];
              const pos = positions[i % positions.length];
              return (
                <motion.div
                  key={skill.label}
                  custom={i}
                  variants={skillVariants}
                  initial="hidden"
                  animate={isInView ? "visible" : "hidden"}
                  className="absolute pointer-events-auto"
                  style={pos as any}
                >
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{
                      duration: 2.5 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    whileHover={{ scale: 1.2, boxShadow: `0 0 20px ${developer.accentGlow}` }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white/80 cursor-default shadow-lg"
                  >
                    <span className="text-base">{skill.icon}</span>
                    <span className="hidden sm:inline">{skill.label}</span>
                  </motion.div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Developer info text */}
        <div className="relative z-10 mt-8 text-center">
          <motion.h3
            custom={0}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight"
          >
            {developer.name}
          </motion.h3>

          <motion.p
            custom={1}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className={`mt-2 text-sm font-semibold uppercase tracking-[0.2em] bg-gradient-to-r ${developer.accent} bg-clip-text text-transparent`}
          >
            {developer.role}
          </motion.p>

          <motion.p
            custom={2}
            variants={textVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="mt-3 text-sm text-white/50 italic max-w-xs mx-auto"
          >
            "{developer.tagline}"
          </motion.p>

          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-5 mx-auto h-[2px] w-24 bg-gradient-to-r ${developer.accent} origin-center rounded-full`}
          />
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default DevelopersSection;
