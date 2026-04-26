import { MapPin, Calendar, Shield, Award, Home, Clock } from "lucide-react";

const features = [
  {
    icon: Home,
    title: "Guru Datang ke Rumah",
    description: "Tidak perlu repot keluar rumah, guru kami yang akan datang ke lokasi Anda"
  },
  {
    icon: MapPin,
    title: "6 Kota Jangkauan",
    description: "Melayani Pekalongan, Batang Kota, Wiradesa, Kedungwuni, Tegal, dan Brebes"
  },
  {
    icon: Clock,
    title: "Jadwal Fleksibel",
    description: "Belajar pukul 14.00 - 20.00 WIB sesuai dengan waktu luang Anda"
  },
  {
    icon: Shield,
    title: "BPJS Ketenagakerjaan",
    description: "Tutor kami dilindungi jaminan kecelakaan kerja untuk keamanan bersama"
  },
  {
    icon: Award,
    title: "Tutor Terverifikasi",
    description: "Semua tutor minimal S1 Pendidikan atau mahasiswa semester 5 ke atas"
  },
  {
    icon: Calendar,
    title: "JKA Rp 650.000",
    description: "Jaminan Kesejahteraan Akademik senilai Rp 650.000 per siswa (S&K berlaku)"
  }
];

const Features = () => {
  return (
    <section id="area" className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Mengapa Bintang TQA?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Keunggulan layanan les privat kami untuk pengalaman belajar terbaik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center space-y-4 p-6 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
