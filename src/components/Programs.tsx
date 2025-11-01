import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, GraduationCap, Target, Home } from "lucide-react";

const programs = [
  {
    icon: BookOpen,
    title: "Privat SD",
    description: "Bimbingan belajar untuk siswa SD kelas 1-6 dengan metode yang menyenangkan",
    color: "text-blue-500",
    bgColor: "bg-blue-50"
  },
  {
    icon: Users,
    title: "Privat SMP",
    description: "Persiapan ujian dan pendalaman materi untuk siswa SMP",
    color: "text-green-500",
    bgColor: "bg-green-50"
  },
  {
    icon: GraduationCap,
    title: "Privat SMA",
    description: "Pembelajaran intensif untuk siswa SMA dengan fokus ke universitas",
    color: "text-purple-500",
    bgColor: "bg-purple-50"
  },
  {
    icon: Target,
    title: "Persiapan UTBK",
    description: "Program khusus untuk persiapan UTBK dan masuk PTN favorit",
    color: "text-orange-500",
    bgColor: "bg-orange-50"
  },
  {
    icon: Home,
    title: "Homeschooling",
    description: "Kurikulum lengkap untuk pembelajaran di rumah yang terstruktur",
    color: "text-pink-500",
    bgColor: "bg-pink-50"
  }
];

const Programs = () => {
  return (
    <section id="programs" className="py-16 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Program Pembelajaran</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Pilih program yang sesuai dengan kebutuhan belajar Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <Card 
                key={index} 
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-border"
              >
                <CardHeader>
                  <div className={`h-14 w-14 rounded-xl ${program.bgColor} flex items-center justify-center mb-4`}>
                    <Icon className={`h-7 w-7 ${program.color}`} />
                  </div>
                  <CardTitle className="text-xl">{program.title}</CardTitle>
                  <CardDescription className="text-base">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Lihat Detail
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Programs;