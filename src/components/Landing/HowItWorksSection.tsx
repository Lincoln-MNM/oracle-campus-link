import { UserPlus, ClipboardCheck, Eye } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Register Students",
    description: "Add student records with personal details, department, and semester information.",
  },
  {
    icon: ClipboardCheck,
    step: "02",
    title: "Record Marks",
    description: "Enter subject-wise marks for each student per semester through the admin panel.",
  },
  {
    icon: Eye,
    step: "03",
    title: "View Results",
    description: "Students and admins can view academic performance, reports, and analytics.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="relative py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center" data-aos="fade-up">
          <span className="inline-block rounded-full bg-secondary px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">
            How It Works
          </span>
          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Simple three-step workflow
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From registration to result viewing — the entire academic management flow simplified.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.step}
              data-aos="fade-up"
              data-aos-delay={i * 150}
              className="relative rounded-2xl border bg-card p-8 text-center shadow-card hover-lift"
            >
              {/* Step number */}
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-sm font-bold text-primary-foreground shadow-soft">
                Step {step.step}
              </span>

              <div className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                <step.icon className="h-7 w-7 text-secondary-foreground" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>

              {/* Connector line (not on last) */}
              {i < steps.length - 1 && (
                <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 bg-border md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
