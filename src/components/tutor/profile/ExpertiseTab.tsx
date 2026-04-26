import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, DollarSign, CheckCircle2 } from "lucide-react";
import { subjectOptions } from "@/lib/constants/subjects";

interface ExpertiseTabProps {
  tutorDetails: {
    subjects: string[];
    experience: string;
    hourly_rate: string;
    is_available: true;
  };
  setTutorDetails: (details: any) => void;
  onToggleSubject: (subject: string) => void;
}

export const ExpertiseTab = ({ tutorDetails, setTutorDetails, onToggleSubject }: ExpertiseTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            Mata Pelajaran & Pengalaman
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Mata Pelajaran yang Dikuasai</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
              {subjectOptions.map((subject) => (
                <div key={subject.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={subject.value}
                    checked={tutorDetails.subjects.includes(subject.value)}
                    onCheckedChange={() => onToggleSubject(subject.value)}
                  />
                  <label
                    htmlFor={subject.value}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {subject.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-base font-semibold">Pengalaman Mengajar</Label>
            <Textarea
              id="experience"
              value={tutorDetails.experience}
              onChange={(e) => setTutorDetails({ ...tutorDetails, experience: e.target.value })}
              placeholder="Ceritakan pengalaman Anda dalam mengajar atau membimbing..."
              className="min-h-[200px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="h-5 w-5 text-primary" />
            Pengaturan Mengajar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hourly_rate">Tarif Mengajar Per Jam</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-muted-foreground font-medium text-sm">Rp</span>
              <Input
                id="hourly_rate"
                type="number"
                value={tutorDetails.hourly_rate}
                disabled
                className="pl-10 bg-muted font-mono"
              />
            </div>
            <p className="text-[11px] text-muted-foreground italic flex items-start gap-1">
              <CheckCircle2 className="h-3 w-3 mt-0.5" />
              Tarif hanya dapat disesuaikan oleh sistem Admin.
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="space-y-0.5">
                <Label htmlFor="is_available" className="text-sm font-bold">Status Ketersediaan</Label>
                <p className="text-[10px] text-muted-foreground">Aktifkan jika siap menerima siswa</p>
              </div>
              <Checkbox
                id="is_available"
                checked={tutorDetails.is_available}
                onCheckedChange={(checked) => setTutorDetails({ ...tutorDetails, is_available: !!checked })}
                className="h-6 w-6"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
