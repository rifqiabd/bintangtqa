import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User, Users, Phone } from "lucide-react";

const CTA = () => {
  const navigate = useNavigate();

  const handleWhatsApp = () => {
    window.open("https://api.whatsapp.com/send?phone=6285183380248&text=Hallo%20Bintang%20TQA", "_blank");
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Siap Memulai Belajar dengan Bintang TQA?
          </h2>
          <p className="text-lg text-muted-foreground">
            Bergabunglah dengan siswa-siswa kami di Pekalongan, Batang, Tegal, dan Brebes
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?role=student")}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 gap-2 shadow-lg"
            >
              <User className="h-5 w-5" />
              Daftar Siswa
            </Button>
            <Button 
              size="lg" 
              onClick={() => navigate("/auth?role=tutor")}
              className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent/80 gap-2 shadow-lg"
            >
              <Users className="h-5 w-5" />
              Daftar Tutor
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={handleWhatsApp}
              className="w-full sm:w-auto gap-2 border-green-500 text-green-600 hover:bg-green-50"
            >
              <Phone className="h-5 w-5" />
              WhatsApp
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 pt-12 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-primary">TK-SMA</p>
              <p className="text-sm text-muted-foreground">Semua Jenjang</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">6</p>
              <p className="text-sm text-muted-foreground">Kota Jangkauan</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">650K</p>
              <p className="text-sm text-muted-foreground">Bonus JKA</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
