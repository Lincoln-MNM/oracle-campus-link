import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Users, BarChart3, Shield } from "lucide-react";
import gsap from "gsap";

const FloatingCard = ({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay: 0.8 + delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

const HeroSection = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-title span", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
      });
      gsap.from(".hero-subtitle", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.5,
        ease: "power3.out",
      });
      gsap.from(".hero-buttons", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        delay: 0.8,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="home" ref={heroRef} className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 h-[300px] w-[300px] -translate-x-1/2 rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:gap-8">
        {/* Text */}
        <div className="flex flex-col justify-center">
          <div className="hero-title overflow-hidden">
            <span className="mb-3 inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
              BTech AI & Data Science · DBMS Project
            </span>
          </div>
          <h1 className="hero-title text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            <span className="block">Student</span>
            <span className="block gradient-text">Management</span>
            <span className="block">System</span>
          </h1>
          <p className="hero-subtitle mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            A modern platform for managing academic records, students, and semester performance — powered by Oracle Database.
          </p>
          <div className="hero-buttons mt-8 flex flex-wrap gap-4">
            <a
              href="/login/admin"
              className="inline-flex items-center rounded-xl gradient-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-soft animate-pulse-glow"
            >
              Login as Admin
            </a>
            <a
              href="/login/student"
              className="inline-flex items-center rounded-xl border bg-card px-7 py-3.5 text-sm font-semibold transition-all hover:bg-muted hover:shadow-card-hover"
            >
              Login as Student
            </a>
          </div>
        </div>

        {/* Floating visuals */}
        <div className="relative hidden lg:flex lg:items-center lg:justify-center">
          <FloatingCard
            className="absolute top-8 right-4 animate-float rounded-2xl border bg-card p-5 shadow-card"
            delay={0}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Users className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">2,450</p>
                <p className="text-xs text-muted-foreground">Active Students</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="absolute top-36 left-0 animate-float-delayed rounded-2xl border bg-card p-5 shadow-card"
            delay={0.2}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
                <BarChart3 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">94.2%</p>
                <p className="text-xs text-muted-foreground">Pass Rate</p>
              </div>
            </div>
          </FloatingCard>

          <FloatingCard
            className="absolute bottom-20 right-8 animate-float rounded-2xl border bg-card p-5 shadow-card"
            delay={0.4}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Shield className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">Oracle DB</p>
                <p className="text-xs text-muted-foreground">Secured Backend</p>
              </div>
            </div>
          </FloatingCard>

          {/* Central decorative circle */}
          <div className="h-64 w-64 rounded-full border-2 border-dashed border-primary/15 animate-[spin_30s_linear_infinite]" />
          <div className="absolute h-40 w-40 rounded-full border border-primary/10 animate-[spin_20s_linear_infinite_reverse]" />
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-muted-foreground">Scroll</span>
          <ChevronDown className="h-4 w-4 text-muted-foreground animate-scroll-hint" />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
