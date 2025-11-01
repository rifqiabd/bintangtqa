import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");

  const handleSearch = () => {
    navigate(`/auth?role=student&subject=${encodeURIComponent(subject)}`);
  };

  return (
    <section id="home" className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Temukan{" "}
                <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Tutor Terdekat
                </span>{" "}
                untuk Belajar Privat
              </h1>
              <p className="text-lg text-muted-foreground">
                Hubungkan dengan tutor profesional di sekitar Anda. Pembelajaran efektif dengan jadwal fleksibel dan laporan kehadiran real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card rounded-xl shadow-lg border border-border">
              <Input
                placeholder="Cari mata pelajaran (mis: Matematika, Fisika)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 gap-2"
              >
                <Search className="h-4 w-4" />
                Cari Tutor Terdekat
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">✓</span>
                </div>
                <div>
                  <p className="font-semibold">500+ Tutor</p>
                  <p className="text-sm text-muted-foreground">Berpengalaman</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">★</span>
                </div>
                <div>
                  <p className="font-semibold">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Rating Rata-rata</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Tutor and student learning together"
              className="relative rounded-3xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;