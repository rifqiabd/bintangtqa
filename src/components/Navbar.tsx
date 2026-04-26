import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, Menu, X, UserCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .single();
        setUserRole(data?.role || null);
      }
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = () => {
    if (userRole === "admin") {
      navigate("/admin");
    } else if (userRole === "tutor") {
      navigate("/tutor");
    } else {
      navigate("/student");
    }
  };

  const menuItems = [
    { label: "Beranda", href: "#home" },
    { label: "Program", href: "#programs" },
    { label: "Area Layanan", href: "#area" },
    { label: "Tentang Kami", href: "#about" },
    { label: "Hubungi Kami", href: "#contact" },
  ];

  const handleMenuClick = (href: string) => {
    setIsMobileMenuOpen(false);
    // Smooth scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
              <BookOpen className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Bintang TQA
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {menuItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium hover:text-primary transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick(item.href);
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center gap-3">
              {loading ? null : userRole ? (
                <Button 
                  size="sm"
                  onClick={handleDashboardClick}
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
                >
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate("/auth?role=student")}
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
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={cn(
          "fixed top-16 left-0 right-0 bg-background border-b border-border z-40 lg:hidden transition-all duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 py-6 space-y-4">
          {/* Mobile Menu Items */}
          {menuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="block py-2 text-base font-medium hover:text-primary transition-colors"
              onClick={(e) => {
                e.preventDefault();
                handleMenuClick(item.href);
              }}
            >
              {item.label}
            </a>
          ))}

          {/* Mobile Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {loading ? null : userRole ? (
              <Button 
                onClick={() => {
                  handleDashboardClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
              >
                <UserCircle2 className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    navigate("/auth?role=student");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full"
                >
                  Daftar Siswa
                </Button>
                <Button 
                  onClick={() => {
                    navigate("/auth?role=tutor");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80"
                >
                  Daftar Tutor
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
