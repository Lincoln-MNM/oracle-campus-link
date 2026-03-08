import { ShieldCheck, GraduationCap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const portals = [
  {
    icon: ShieldCheck,
    title: "Admin Portal",
    description: "Manage students, subjects, marks, and generate academic reports with full control.",
    href: "/login/admin",
    gradient: true,
  },
  {
    icon: GraduationCap,
    title: "Student Portal",
    description: "View your academic results, semester marks, and personal performance dashboard.",
    href: "/login/student",
    gradient: false,
  },
];

const LoginGateway = () => {
  return (
    <section id="login" className="relative py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center" data-aos="fade-up">
          <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            Get Started
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Choose your portal
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Select your role to access the appropriate dashboard and features.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {portals.map((portal, i) => (
            <motion.a
              key={portal.title}
              href={portal.href}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              whileHover={{ scale: 1.03, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className={`group flex flex-col items-center rounded-2xl border p-10 text-center transition-shadow hover:shadow-card-hover ${
                portal.gradient ? "gradient-primary text-primary-foreground border-transparent" : "bg-card"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                  portal.gradient ? "bg-primary-foreground/20" : "bg-secondary"
                }`}
              >
                <portal.icon className={`h-8 w-8 ${portal.gradient ? "text-primary-foreground" : "text-secondary-foreground"}`} />
              </div>
              <h3 className="mt-5 text-2xl font-bold">{portal.title}</h3>
              <p className={`mt-3 text-sm leading-relaxed ${portal.gradient ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {portal.description}
              </p>
              <div
                className={`mt-6 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
                  portal.gradient
                    ? "bg-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/30"
                    : "gradient-primary text-primary-foreground hover:opacity-90"
                }`}
              >
                Login Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LoginGateway;
