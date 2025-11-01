import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Users } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Siap Memulai Perjalanan Belajar Anda?
          </h2>
          <p className="text-lg text-muted-foreground">
            Bergabunglah dengan ribuan siswa dan tutor yang telah merasakan manfaat platform kami
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?role=student")}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2 shadow-lg"
            >
              <User className="h-5 w-5" />
              Saya Siswa
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?role=tutor")}
              className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 gap-2 shadow-lg"
            >
              <Users className="h-5 w-5" />
              Saya Tutor
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary">10K+</p>
              <p className="text-sm text-muted-foreground">Siswa Aktif</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">500+</p>
              <p className="text-sm text-muted-foreground">Tutor Profesional</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-sm text-muted-foreground">Sesi Belajar</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;