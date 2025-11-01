import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              EduMatch
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="text-sm font-medium hover:text-primary transition-colors">
              Beranda
            </a>
            <a href="#programs" className="text-sm font-medium hover:text-primary transition-colors">
              Program
            </a>
            <a href="#tutors" className="text-sm font-medium hover:text-primary transition-colors">
              Tutor
            </a>
            <a href="#contact" className="text-sm font-medium hover:text-primary transition-colors">
              Hubungi Kami
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/auth?role=student")}
              className="hidden sm:inline-flex"
            >
              Daftar Siswa
            </Button>
            <Button 
              size="sm"
              onClick={() => navigate("/auth?role=tutor")}
              className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
            >
              Daftar Tutor
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;