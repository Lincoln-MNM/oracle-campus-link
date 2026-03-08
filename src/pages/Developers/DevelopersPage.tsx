import { motion } from "framer-motion";
import { Code2, GraduationCap } from "lucide-react";

const developers = [
  { name: "GOURI NANDHANA", roll: 1, uid: "U2408001", style: "from-violet-600 via-purple-600 to-indigo-600", border: "border-violet-400/50", shadow: "shadow-violet-500/20", glow: "violet" },
  { name: "AARDRA JEE", roll: 2, uid: "U2408002", style: "from-cyan-500 via-teal-500 to-emerald-500", border: "border-cyan-400/50", shadow: "shadow-cyan-500/20", glow: "cyan" },
  { name: "AAVANI U", roll: 3, uid: "U2408004", style: "from-pink-500 via-rose-500 to-red-500", border: "border-pink-400/50", shadow: "shadow-pink-500/20", glow: "pink" },
  { name: "ABRAHAM CHIRAYATH MARTIN", roll: 4, uid: "U2408005", style: "from-amber-500 via-orange-500 to-red-500", border: "border-amber-400/50", shadow: "shadow-amber-500/20", glow: "amber" },
  { name: "ADITHYA SREEPAD BS", roll: 5, uid: "U2408006", style: "from-blue-600 via-indigo-600 to-purple-600", border: "border-blue-400/50", shadow: "shadow-blue-500/20", glow: "blue" },
];

const DevelopersPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <Code2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold font-display">Meet the Developers</h1>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            The team behind the Student Management System — DBMS Project
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {developers.map((dev, i) => (
            <motion.div
              key={dev.uid}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 150 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`group relative overflow-hidden rounded-2xl border-2 ${dev.border} bg-card p-6 shadow-lg ${dev.shadow} transition-all duration-300`}
            >
              {/* Gradient glow background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${dev.style} opacity-5 group-hover:opacity-10 transition-opacity`} />

              {/* Neon border glow on hover */}
              <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:${dev.border} transition-all`}
                style={{ boxShadow: `inset 0 0 20px rgba(var(--${dev.glow}), 0.05)` }} />

              <div className="relative z-10">
                {/* Avatar */}
                <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${dev.style} text-white text-2xl font-bold shadow-lg`}>
                  {dev.name.charAt(0)}
                </div>

                <div className="mt-5 text-center">
                  <h3 className="text-lg font-bold font-display">{dev.name}</h3>

                  <div className="mt-3 flex justify-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${dev.style} px-3 py-1 text-xs font-semibold text-white`}>
                      Roll No: {dev.roll}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-mono font-medium">{dev.uid}</span>
                  </div>
                </div>

                {/* Glass badge */}
                <div className="mt-4 rounded-lg bg-muted/50 backdrop-blur-sm p-2 text-center text-xs text-muted-foreground">
                  B.Tech Computer Science · S4
                </div>
              </div>

              {/* Animated corner accents */}
              <div className={`absolute -top-1 -right-1 h-8 w-8 rounded-bl-xl bg-gradient-to-br ${dev.style} opacity-30 group-hover:opacity-60 transition-opacity`} />
              <div className={`absolute -bottom-1 -left-1 h-8 w-8 rounded-tr-xl bg-gradient-to-br ${dev.style} opacity-20 group-hover:opacity-50 transition-opacity`} />
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Rajagiri School of Engineering and Technology · DBMS Project · 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default DevelopersPage;
