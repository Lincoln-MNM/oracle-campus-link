import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Hash, Lock, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const StudentLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ studentId?: string; password?: string }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!studentId.trim()) errs.studentId = "Student ID is required";
    if (!password.trim()) errs.password = "Password is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_id: studentId, password }),
      });
      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("userRole", "student");
        localStorage.setItem("studentId", studentId);
        toast({ title: "Login successful", description: "Welcome back!" });
        navigate("/student");
      } else {
        toast({ title: "Login failed", description: data.message || "Invalid credentials", variant: "destructive" });
      }
    } catch {
      localStorage.setItem("userRole", "student");
      localStorage.setItem("studentId", studentId);
      toast({ title: "Demo Mode", description: "Backend offline — logged in locally." });
      navigate("/student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        <button
          onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary"
            >
              <GraduationCap className="h-8 w-8 text-secondary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold font-display">Student Portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">View your academic records</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="studentId"
                  placeholder="Enter your student ID"
                  className="pl-10"
                  value={studentId}
                  onChange={(e) => { setStudentId(e.target.value); setErrors((p) => ({ ...p, studentId: undefined })); }}
                />
              </div>
              {errors.studentId && <p className="text-xs text-destructive">{errors.studentId}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Signing in…" : "Sign In as Student"}
              </Button>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Are you an admin?{" "}
            <button onClick={() => navigate("/login/admin")} className="font-medium text-primary hover:underline">
              Login as Admin
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentLogin;
