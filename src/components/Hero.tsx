import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState("");

  const handleSearch = () => {
    navigate(`/auth?role=student&subject=${encodeURIComponent(subject)}`);
  };

  const handleWhatsApp = () => {
    window.open("https://api.whatsapp.com/send?phone=6285328955589&text=Hallo%20Bintang%20TQA", "_blank");
  };

  return (
    <section id="home" className="pt-24 pb-16 lg:pt-32 lg:pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Les Privat{" "}
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Guru Datang
                </span>{" "}
                ke Rumah Anda
              </h1>
              <p className="text-lg text-muted-foreground">
                Bintang TQA menyediakan jasa Les Privat untuk tingkat TK, SD, SMP dan SMA dengan pengajar profesional dan berpengalaman.
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
                Cari Tutor
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                onClick={handleWhatsApp}
                variant="outline"
                className="gap-2 border-green-500 text-green-600 hover:bg-green-50"
              >
                <Phone className="h-4 w-4" />
                WhatsApp: 0853-2895-5589
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">6 Kota</p>
                  <p className="text-sm text-muted-foreground">Area Jangkauan</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">★</span>
                </div>
                <div>
                  <p className="font-semibold">4.9/5</p>
                  <p className="text-sm text-muted-foreground">Rating Tutor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>
            <img
              src={heroImage}
              alt="Bintang TQA - Les Privat Guru Datang ke Rumah"
              className="relative rounded-3xl shadow-2xl w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
