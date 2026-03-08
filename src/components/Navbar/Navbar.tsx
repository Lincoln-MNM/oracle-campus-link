import { GraduationCap } from "lucide-react";

interface NavbarProps {
  title?: string;
}

const Navbar = ({ title = "Student Management System" }: NavbarProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold font-display">{title}</h1>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
