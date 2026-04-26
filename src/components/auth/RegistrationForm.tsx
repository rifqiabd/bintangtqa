import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, FileText, GraduationCap, School, BookOpen } from "lucide-react";
import type { Subject } from "@/lib/queries/subjectQueries";
import { getSubjects } from "@/lib/queries/subjectQueries";
import { AddressPicker } from "@/components/AddressPicker";
import { SchoolPicker } from "@/components/SchoolPicker";

interface RegistrationFormProps {
  role: "student" | "tutor";
  setRole: (role: "student" | "tutor") => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  phone: string;
  setPhone: (value: string) => void;
  address: string;
  setAddress: (value: string) => void;
  province_code?: string;
  setProvinceCode: (value: string) => void;
  regency_code?: string;
  setRegencyCode: (value: string) => void;
  district_code?: string;
  setDistrictCode: (value: string) => void;
  village_code?: string;
  setVillageCode: (value: string) => void;
  schoolName: string;
  setSchoolName: (value: string) => void;
  grade: string;
  setGrade: (value: string) => void;
  location: { lat: number; lng: number } | null;
  locationError: string;
  subjects: string[];
  setSubjects: (subjects: string[]) => void;
  experience: string;
  setExperience: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  ktpLink: string;
  setKtpLink: (value: string) => void;
  cvLink: string;
  setCvLink: (value: string) => void;
  certificateLinks: string[];
  setCertificateLinks: (links: string[]) => void;
  university: string;
  setUniversity: (value: string) => void;
  major: string;
  setMajor: (value: string) => void;
  graduationYear: string;
  setGraduationYear: (value: string) => void;
  ipk: string;
  setIpk: (value: string) => void;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const GRADE_OPTIONS = [
  "TK",
  "SD Kelas 1", "SD Kelas 2", "SD Kelas 3", "SD Kelas 4", "SD Kelas 5", "SD Kelas 6",
  "SMP Kelas 7", "SMP Kelas 8", "SMP Kelas 9",
  "SMA Kelas 10", "SMA Kelas 11", "SMA Kelas 12",
  "Alumni / Umum"
];

export function RegistrationForm({
  role,
  setRole,
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  province_code,
  setProvinceCode,
  regency_code,
  setRegencyCode,
  district_code,
  setDistrictCode,
  village_code,
  setVillageCode,
  schoolName,
  setSchoolName,
  grade,
  setGrade,
  location,
  locationError,
  subjects,
  setSubjects,
  experience,
  setExperience,
  password,
  setPassword,
  ktpLink,
  setKtpLink,
  cvLink,
  setCvLink,
  certificateLinks,
  setCertificateLinks,
  university,
  setUniversity,
  major,
  setMajor,
  graduationYear,
  setGraduationYear,
  ipk,
  setIpk,
  loading,
  onSubmit,
}: RegistrationFormProps) {
  const [subjectOptions, setSubjectOptions] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [newCertLink, setNewCertLink] = useState("");

  useEffect(() => {
    getSubjects()
      .then(setSubjectOptions)
      .catch(console.error)
      .finally(() => setLoadingSubjects(false));
  }, []);

  const toggleSubject = (id: string) => {
    if (subjects.includes(id)) {
      setSubjects(subjects.filter((s) => s !== id));
    } else {
      setSubjects([...subjects, id]);
    }
  };

  const addCertificateLink = () => {
    if (newCertLink.trim() && newCertLink.includes("drive.google.com")) {
      setCertificateLinks([...certificateLinks, newCertLink.trim()]);
      setNewCertLink("");
    }
  };

  const removeCertificateLink = (index: number) => {
    setCertificateLinks(certificateLinks.filter((_, i) => i !== index));
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="mb-4">
        <Label>Daftar Sebagai</Label>
        <div className="flex gap-4 mt-2">
          <Button
            type="button"
            variant={role === "student" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setRole("student")}
          >
            Siswa
          </Button>
          <Button
            type="button"
            variant={role === "tutor" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setRole("tutor")}
          >
            Tutor
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName">Nama Lengkap</Label>
        <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="regEmail">Email</Label>
        <Input id="regEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Nomor HP</Label>
        <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>

      {role === "student" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <School className="h-4 w-4" /> Asal Sekolah
              </Label>
              <SchoolPicker 
                value={schoolName}
                onChange={setSchoolName}
                placeholder="Pilih sekolah..."
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Kelas
              </Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              >
                <option value="">Pilih Kelas</option>
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      
      <div className="border-t pt-4">
        <Label className="text-base font-semibold mb-4 block">Alamat Lengkap</Label>
        <AddressPicker
          value={{
            province_code,
            regency_code,
            district_code,
            village_code,
            address,
          }}
          onChange={(val) => {
            if (val?.province_code) setProvinceCode(val.province_code);
            if (val?.regency_code) setRegencyCode(val.regency_code);
            if (val?.district_code) setDistrictCode(val.district_code);
            if (val?.village_code) setVillageCode(val.village_code);
            if (val?.address !== undefined) setAddress(val.address);
          }}
        />
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <MapPin className="h-4 w-4" /> Lokasi Geografis
        </Label>
        {location ? (
          <p className="text-sm text-muted-foreground">
            ✓ Koordinat terdeteksi ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
          </p>
        ) : (
          <p className="text-sm text-destructive">{locationError}</p>
        )}
      </div>

      {role === "tutor" && (
        <>
          <div className="space-y-2">
            <Label>Mata Pelajaran</Label>
            {loadingSubjects ? (
              <p className="text-sm text-muted-foreground">Memuat...</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {subjectOptions.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.id}
                      checked={subjects.includes(subject.id)}
                      onCheckedChange={() => toggleSubject(subject.id)}
                    />
                    <label htmlFor={subject.id} className="text-sm font-medium">
                      {subject.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Pengalaman Mengajar</Label>
            <Textarea
              id="experience"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="Ceritakan pengalaman mengajar Anda..."
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <Label className="text-base font-semibold">Riwayat Pendidikan</Label>
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="university">Universitas</Label>
                <Input
                  id="university"
                  placeholder="Nama universitas"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Jurusan</Label>
                <Input
                  id="major"
                  placeholder="Jurusan"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Tahun Lulus</Label>
                <select
                  id="graduationYear"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                >
                  <option value="">Pilih tahun</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ipk">IPK</Label>
                <Input
                  id="ipk"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  placeholder="3.75"
                  value={ipk}
                  onChange={(e) => setIpk(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <Label className="text-base font-semibold">Dokumen Persyaratan</Label>
            <p className="text-sm text-muted-foreground mb-4">
              Silakan upload dokumen ke Google Drive dan masukkan linknya di bawah.
            </p>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="ktpLink" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> KTP (Wajib)
                </Label>
                <Input
                  id="ktpLink"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={ktpLink}
                  onChange={(e) => setKtpLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cvLink" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> CV/Resume (Wajib)
                </Label>
                <Input
                  id="cvLink"
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={cvLink}
                  onChange={(e) => setCvLink(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <FileText className="h-4 w-4" /> Sertifikat (Opsional)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={newCertLink}
                    onChange={(e) => setNewCertLink(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCertificateLink())}
                  />
                  <Button type="button" variant="outline" onClick={addCertificateLink}>
                    Tambah
                  </Button>
                </div>
                {certificateLinks.length > 0 && (
                  <div className="space-y-1">
                    {certificateLinks.map((link, i) => (
                      <div key={i} className="flex items-center justify-between text-sm bg-muted p-2 rounded">
                        <span className="truncate">{link}</span>
                        <button
                          type="button"
                          className="text-destructive hover:underline ml-2"
                          onClick={() => removeCertificateLink(i)}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <Label htmlFor="regPassword">Password</Label>
        <Input
          id="regPassword"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Memproses..." : "Daftar"}
      </Button>
    </form>
  );
}
