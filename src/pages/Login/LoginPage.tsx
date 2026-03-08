import Navbar from "@/components/Navbar/Navbar";

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-card">
          <h2 className="text-2xl font-bold font-display text-center">Login</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">Placeholder — Authentication coming in Phase 2</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
