import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap } from "lucide-react";

interface EducationTabProps {
  tutorDetails: {
    university: string;
    major: string;
    graduation_year: string;
    ipk: string;
  };
  setTutorDetails: (details: any) => void;
}

export const EducationTab = ({ tutorDetails, setTutorDetails }: EducationTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <GraduationCap className="h-5 w-5 text-primary" />
          Riwayat Pendidikan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="university">Asal Universitas / Kampus</Label>
            <Input
              id="university"
              value={tutorDetails.university}
              onChange={(e) => setTutorDetails({ ...tutorDetails, university: e.target.value })}
              placeholder="Contoh: Universitas Indonesia"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="major">Jurusan / Program Studi</Label>
            <Input
              id="major"
              value={tutorDetails.major}
              onChange={(e) => setTutorDetails({ ...tutorDetails, major: e.target.value })}
              placeholder="Contoh: Teknik Informatika"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduation_year">Tahun Kelulusan</Label>
            <Input
              id="graduation_year"
              type="number"
              value={tutorDetails.graduation_year}
              onChange={(e) => setTutorDetails({ ...tutorDetails, graduation_year: e.target.value })}
              placeholder="Tahun Lulus"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ipk">IPK Terakhir</Label>
            <Input
              id="ipk"
              type="number"
              step="0.01"
              value={tutorDetails.ipk}
              onChange={(e) => setTutorDetails({ ...tutorDetails, ipk: e.target.value })}
              placeholder="3.50"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
