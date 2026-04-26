import { BookOpen, Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const handleWhatsApp = () => {
    window.open("https://api.whatsapp.com/send?phone=6285328955589&text=Hallo%20Bintang%20TQA", "_blank");
  };

  return (
    <footer id="contact" className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Bintang TQA</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Bimbingan Belajar yang menyediakan jasa Les Privat (Guru Datang ke Rumah Siswa) untuk TK, SD, SMP dan SMA.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Area Jangkauan</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Kota Pekalongan</li>
              <li>Batang Kota</li>
              <li>Wiradesa</li>
              <li>Kedungwuni</li>
              <li>Tegal</li>
              <li>Brebes</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Simbangwetan GG 8 No. 29 RT 011 RW 004, Simbangwetan, Kec. Buaran, Kab. Pekalongan, Jawa Tengah</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                0853-2895-5589
              </li>
            </ul>
            <Button 
              onClick={handleWhatsApp}
              className="mt-4 gap-2 bg-green-600 hover:bg-green-700"
              size="sm"
            >
              <Phone className="h-4 w-4" />
              Chat WhatsApp
            </Button>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex gap-3">
              <a 
                href="https://www.instagram.com/tqassimbani/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Instagram className="h-5 w-5 text-primary" />
              </a>
              <a 
                href="https://www.facebook.com/thibbilqulubassimbani/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Facebook className="h-5 w-5 text-primary" />
              </a>
              <a 
                href="https://www.youtube.com/@thibbil_qulub_assimbani" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <Youtube className="h-5 w-5 text-primary" />
              </a>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>@tqassimbani</p>
              <p>@thibbil_qulub_assimbani</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 Bintang TQA. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;