import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer id="contact" className="bg-secondary/50 border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">EduMatch</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Platform pembelajaran privat yang menghubungkan siswa dengan tutor profesional terdekat.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Navigasi</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#home" className="text-muted-foreground hover:text-primary">Beranda</a></li>
              <li><a href="#programs" className="text-muted-foreground hover:text-primary">Program</a></li>
              <li><a href="#tutors" className="text-muted-foreground hover:text-primary">Tutor</a></li>
              <li><a href="#contact" className="text-muted-foreground hover:text-primary">Kontak</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Kontak</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                info@edumatch.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                +62 812-3456-7890
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Jakarta, Indonesia
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Dapatkan update program dan tips belajar terbaru
            </p>
            <div className="flex gap-2">
              <Input placeholder="Email Anda" className="text-sm" />
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Kirim
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© 2024 EduMatch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;