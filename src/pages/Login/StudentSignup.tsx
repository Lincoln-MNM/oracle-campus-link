import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Hash, Lock, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const StudentSignup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!uid.trim()) errs.uid = "Roll number is required";
    else if (!/^U\d{7}$/.test(uid.trim())) errs.uid = "Roll number must be in format U2408001";
    if (!password.trim()) errs.password = "Password is required";
    else if (password.length < 4) errs.password = "Password must be at least 4 characters";
    if (password !== confirmPassword) errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    // Check if student exists in localStorage data
    try {
      const raw = localStorage.getItem("sms_students");
      if (raw) {
        const students = JSON.parse(raw);
        const student = students.find((s: any) => s.rollNo?.toUpperCase() === uid.trim().toUpperCase() || s.uid?.toUpperCase() === uid.trim().toUpperCase());
        if (!student) {
          toast({ title: "UID not found", description: "Admin must add you to the system first.", variant: "destructive" });
          setLoading(false);
          return;
        }
        if (student.registered) {
          toast({ title: "Already registered", description: "Please use login instead.", variant: "destructive" });
          setLoading(false);
          return;
        }
        // Register the student
        student.password = password;
        student.registered = true;
        localStorage.setItem("sms_students", JSON.stringify(students));
        toast({ title: "✅ Registration Successful!", description: "You can now login with your UID and password." });
        navigate("/login/student");
      }
    } catch {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 w-full max-w-md">
        <button onClick={() => navigate("/")}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </button>

        <div className="rounded-2xl border bg-card p-8 shadow-card">
          <div className="mb-8 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
              <KeyRound className="h-8 w-8 text-secondary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold font-display">Student Signup</h1>
            <p className="mt-1 text-sm text-muted-foreground">Create your account (admin must add you first)</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="space-y-2">
              <Label htmlFor="uid">Student UID</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="uid" placeholder="U2408001" className="pl-10" value={uid}
                  onChange={(e) => { setUid(e.target.value); setErrors((p) => ({ ...p, uid: "" })); }} />
              </div>
              {errors.uid && <p className="text-xs text-destructive">{errors.uid}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="password" type="password" placeholder="Create password" className="pl-10" value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }} />
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="confirmPassword" type="password" placeholder="Confirm password" className="pl-10" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }} />
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Button type="submit" className="w-full gradient-primary text-primary-foreground" size="lg" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? "Creating Account…" : "Sign Up"}
              </Button>
            </motion.div>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button onClick={() => navigate("/login/student")} className="font-medium text-primary hover:underline">
              Login here
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentSignup;
