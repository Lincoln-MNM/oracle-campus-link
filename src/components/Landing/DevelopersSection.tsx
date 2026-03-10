import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import dev1 from "@/assets/developers/dev-1.png";
import dev2 from "@/assets/developers/dev-2.png";
import dev3 from "@/assets/developers/dev-3.png";
import dev4 from "@/assets/developers/dev-4.png";
import dev5 from "@/assets/developers/dev-5.png";

const developers = [
  {
    name: "GOURI NANDHANA",
    role: "Frontend Developer",
    skills: ["React", "Tailwind", "JavaScript", "UI Design"],
    tagline: "Turning caffeine into pixel-perfect interfaces.",
    image: dev1,
    accent: "hsl(280, 70%, 55%)",
  },
  {
    name: "AARDRA JEE",
    role: "Backend Developer",
    skills: ["Node.js", "Python", "SQL", "REST APIs"],
    tagline: "If it compiles, it ships.",
    image: dev2,
    accent: "hsl(170, 70%, 45%)",
  },
  {
    name: "AAVANI U",
    role: "UI/UX Designer",
    skills: ["Figma", "CSS", "Design Systems", "Prototyping"],
    tagline: "Making buttons people actually want to click.",
    image: dev3,
    accent: "hsl(340, 70%, 55%)",
  },
  {
    name: "ABRAHAM CHIRAYATH MARTIN",
    role: "Database Engineer",
    skills: ["Oracle", "SQL", "PL/SQL", "Data Modeling"],
    tagline: "Normalizing databases and expectations.",
    image: dev4,
    accent: "hsl(30, 80%, 55%)",
  },
  {
    name: "ADITHYA SREEPAD BS",
    role: "Full Stack Developer",
    skills: ["React", "Node.js", "Python", "Docker"],
    tagline: "Turning caffeine into production-ready code.",
    image: dev5,
    accent: "hsl(224, 76%, 55%)",
  },
];

const DevelopersSection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollCooldown = useRef(false);
  const dev = developers[activeIndex];

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (scrollCooldown.current) return;
      scrollCooldown.current = true;
      setActiveIndex((p) => Math.max(0, Math.min(developers.length - 1, p + dir)));
      setTimeout(() => (scrollCooldown.current = false), 600);
    },
    [],
  );

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const handler = (e: WheelEvent) => {
      const rect = el.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.5;
      if (!inView) return;

      if (Math.abs(e.deltaY) > 20) {
        const dir = e.deltaY > 0 ? 1 : -1;
        const nextIdx = activeIndex + dir;
        if (nextIdx >= 0 && nextIdx < developers.length) {
          e.preventDefault();
          navigate(dir as 1 | -1);
        }
      }
    };

    window.addEventListener("wheel", handler, { passive: false });
    return () => window.removeEventListener("wheel", handler);
  }, [activeIndex, navigate]);

  return (
    <section
      id="developers"
      ref={sectionRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden py-16 sm:py-20"
      style={{
        background:
          "linear-gradient(180deg, hsl(222 47% 5%) 0%, hsl(224 50% 8%) 50%, hsl(222 47% 5%) 100%)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* Section label */}
      <div className="text-center mb-8 sm:mb-12 relative z-10">
        <p
          className="text-xs font-mono uppercase tracking-[0.3em] mb-2"
          style={{ color: "rgba(129,140,248,0.6)" }}
        >
          // Meet the Team
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold font-display" style={{ color: "rgba(255,255,255,0.85)" }}>
          Developers
        </h2>
      </div>

      {/* Main content area */}
      <div className="relative z-10 flex-1 flex items-center max-w-6xl mx-auto w-full px-4 sm:px-8">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-4 items-center">
          {/* LEFT — Developer Image */}
          <div className="relative flex justify-center items-end min-h-[350px] sm:min-h-[450px] md:min-h-[500px]">
            {/* Accent glow */}
            <motion.div
              key={`glow-${activeIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute bottom-[10%] left-1/2 -translate-x-1/2 w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full blur-[100px]"
              style={{ background: dev.accent }}
            />

            {/* Drop shadow */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] h-[20px] rounded-[50%] blur-xl"
              style={{ background: "rgba(0,0,0,0.6)" }}
            />

            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={dev.image}
                alt={dev.name}
                className="relative z-10 h-[300px] sm:h-[400px] md:h-[460px] w-auto object-contain select-none"
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.97 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          {/* RIGHT — Developer Info */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <AnimatePresence mode="wait">
              <motion.div
                key={`info-${activeIndex}`}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* Name with animated gradient */}
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-display leading-tight dev-gradient-name">
                  {dev.name}
                </h3>

                {/* Role */}
                <p
                  className="mt-3 text-sm sm:text-base font-semibold uppercase tracking-[0.15em]"
                  style={{ color: dev.accent }}
                >
                  {dev.role}
                </p>

                {/* Skills */}
                <div className="mt-5 flex flex-wrap gap-2 justify-center md:justify-start">
                  {dev.skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 + i * 0.07, duration: 0.35 }}
                      className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.75)",
                      }}
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>

                {/* Tagline */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-6 text-sm sm:text-base italic max-w-sm"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  "{dev.tagline}"
                </motion.p>

                {/* Dev counter */}
                <div className="mt-6 flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {String(activeIndex + 1).padStart(2, "0")}
                  </span>
                  <div className="w-16 h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: dev.accent }}
                      initial={{ width: 0 }}
                      animate={{ width: `${((activeIndex + 1) / developers.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {String(developers.length).padStart(2, "0")}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom tile selector */}
      <div className="relative z-10 mt-10 sm:mt-14">
        <div className="flex justify-center gap-3 sm:gap-4 px-4 overflow-x-auto pb-2 scrollbar-hide">
          {developers.map((d, i) => {
            const isActive = i === activeIndex;
            return (
              <motion.button
                key={d.name}
                onClick={() => setActiveIndex(i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="relative flex flex-col items-center gap-2 rounded-xl px-3 py-3 sm:px-4 sm:py-4 transition-all duration-300 cursor-pointer shrink-0"
                style={{
                  background: isActive ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                  border: isActive ? `2px solid ${d.accent}` : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: isActive ? `0 0 24px ${d.accent}40` : "none",
                }}
              >
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                  }}
                >
                  <img
                    src={d.image}
                    alt={d.name}
                    className="w-full h-full object-cover object-top"
                    draggable={false}
                  />
                </div>
                <span
                  className="text-[10px] sm:text-xs font-semibold tracking-wide whitespace-nowrap"
                  style={{
                    color: isActive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {d.name.split(" ")[0]}
                </span>

                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute -bottom-1 w-1.5 h-1.5 rounded-full"
                    style={{ background: d.accent }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
};

export default DevelopersSection;
