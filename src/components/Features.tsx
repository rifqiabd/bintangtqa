import { MapPin, Calendar, FileText, CheckCircle } from "lucide-react";

const features = [
  {
    icon: MapPin,
    title: "Tutor Terdekat",
    description: "Temukan tutor profesional yang berada di sekitar lokasi Anda dengan teknologi pencarian berbasis GPS"
  },
  {
    icon: Calendar,
    title: "Jadwal Fleksibel",
    description: "Atur jadwal belajar sesuai dengan waktu luang Anda. Tidak ada batasan waktu yang kaku"
  },
  {
    icon: FileText,
    title: "Laporan Real-time",
    description: "Pantau kehadiran dan progres belajar dengan laporan yang terupdate secara otomatis"
  },
  {
    icon: CheckCircle,
    title: "Tutor Terverifikasi",
    description: "Semua tutor telah melalui proses seleksi dan verifikasi untuk memastikan kualitas pengajaran"
  }
];

const Features = () => {
  return (
    <section className="py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Mengapa Memilih Kami?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform pembelajaran modern dengan fitur-fitur unggulan untuk pengalaman belajar terbaik
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index} 
                className="text-center space-y-4 p-6 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
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