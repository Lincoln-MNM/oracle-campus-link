import { GraduationCap } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-soft">
        <GraduationCap className="h-8 w-8 text-primary-foreground" />
      </div>
      <h1 className="mt-6 text-4xl font-bold font-display">Student Management System</h1>
      <p className="mt-3 text-lg text-muted-foreground">Database Management Systems Project</p>
      <p className="mt-8 text-sm text-muted-foreground">Phase 1 — Architecture Setup Complete</p>
    </div>
  );
};

export default LandingPage;
