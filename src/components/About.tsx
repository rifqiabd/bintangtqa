import { Eye, Target, CheckCircle, Award, Heart, Users } from "lucide-react";

const missions = [
  "Memberikan pengajaran berkualitas untuk setiap jenjang pendidikan",
  "Membantu siswa mencapai potensi terbaik dalam belajar",
  "Menyediakan tutor yang profesional dan terverifikasi",
  "Mendukung pembelajaran di rumah untuk kenyamanan siswa"
];

const values = [
  {
    icon: Award,
    title: "Mutu Tinggi",
    description: "Standar kualitas pengajaran terbaik untuk setiap siswa"
  },
  {
    icon: Heart,
    title: "Pendekatan Personal",
    description: "Metode pembelajaran disesuaikan dengan kebutuhan individu"
  },
  {
    icon: Users,
    title: "Aksesibel",
    description: "Layanan mudah dijangkau di 6 kota di Pekalongan dan sekitarnya"
  }
];

const About = () => {
  return (
    <section id="about" className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Tentang Kami</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Bintang TQA hadir untuk memberikan layanan pendidikan privat terbaik
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Visi</h3>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed">
Menjadi lembaga pendidikan privat terpercaya yang memberikan pengalaman belajar personal berkualitas untuk membantu setiap siswa mencapai potensi terbaik di Pekalongan dan sekitarnya.
            </p>
          </div>

          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-14 w-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <Target className="h-7 w-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold">Misi</h3>
            </div>
            <ul className="space-y-4">
              {missions.map((mission, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{mission}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold">Nilai Kami</h3>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div 
                key={index} 
                className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-lg transition-shadow"
              >
                <div className="mx-auto h-14 w-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Icon className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-semibold mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default About;