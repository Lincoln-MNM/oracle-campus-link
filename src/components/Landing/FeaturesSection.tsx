import { useEffect } from "react";
import { Users, Award, LayoutDashboard, Database } from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

const features = [
  {
    icon: Users,
    title: "Student Records",
    description: "Maintain comprehensive student profiles with personal, academic, and contact information in one place.",
  },
  {
    icon: Award,
    title: "Academic Results",
    description: "Track semester-wise marks, calculate averages, and generate performance reports effortlessly.",
  },
  {
    icon: LayoutDashboard,
    title: "Admin Dashboard",
    description: "A powerful control panel for administrators to manage students, subjects, and academic data.",
  },
  {
    icon: Database,
    title: "Secure Oracle Database",
    description: "Enterprise-grade Oracle DB backend ensuring data integrity, security, and high availability.",
  },
];

const FeaturesSection = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <section id="features" className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center" data-aos="fade-up">
          <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            Features
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Everything you need to manage academics
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Built for universities and colleges — a complete system to handle student data, marks, and reporting.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group rounded-2xl border bg-card p-6 shadow-card hover-lift cursor-default"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:gradient-primary">
                <feature.icon className="h-6 w-6 text-secondary-foreground transition-colors group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
