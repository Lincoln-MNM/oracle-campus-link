import { GraduationCap } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30 py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
              <GraduationCap className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display">SMS Portal</span>
          </div>

          <div className="mt-6 space-y-1 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Student Management System</p>
            <p>Database Management Systems (DBMS) Project</p>
            <p className="mt-3">University: <span className="font-medium text-foreground">RAJAGIRI SCHOOL OF ENGINEERING AND TECHNOLOGY</span></p>
          </div>

          <div className="mt-8 flex gap-6 text-xs text-muted-foreground">
            <a href="#home" className="hover:text-foreground transition-colors">Home</a>
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">About</a>
            <a href="#login" className="hover:text-foreground transition-colors">Login</a>
            <a href="/developers" className="hover:text-foreground transition-colors">Developers</a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            © {new Date().getFullYear()} SMS Portal. Built with React, Flask & Oracle.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
