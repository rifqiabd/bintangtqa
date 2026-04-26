import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, Save, BookOpen, DollarSign, Lock } from "lucide-react";

const subjects = [
  { value: "matematika", label: "Matematika" },
  { value: "fisika", label: "Fisika" },
  { value: "kimia", label: "Kimia" },
  { value: "biologi", label: "Biologi" },
  { value: "bahasa_indonesia", label: "Bahasa Indonesia" },
  { value: "bahasa_inggris", label: "Bahasa Inggris" },
  { value: "ekonomi", label: "Ekonomi" },
  { value: "akuntansi", label: "Akuntansi" },
  { value: "sejarah", label: "Sejarah" },
  { value: "geografi", label: "Geografi" },
  { value: "sosiologi", label: "Sosiologi" },
  { value: "pkn", label: "PKN" },
];

const TutorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [tutorDetails, setTutorDetails] = useState({
    subjects: [] as string[],
    experience: "",
    hourly_rate: "",
    is_available: true,
  });
  
  // Change password state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setProfile(profileData);
      }

      const { data: tutorData, error: tutorError } = await supabase
        .from("tutor_details")
        .select("*")
        .eq("tutor_id", user.id)
        .single();

      if (tutorData) {
        setTutorDetails({
          subjects: tutorData.subjects || [],
          experience: tutorData.experience || "",
          hourly_rate: tutorData.hourly_rate?.toString() || "",
          is_available: tutorData.is_available ?? true,
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          address: profile.address,
          latitude: profile.latitude,
          longitude: profile.longitude,
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // Update tutor details
      const { error: tutorError } = await supabase
        .from("tutor_details")
        .upsert([
          {
            tutor_id: user.id,
            subjects: tutorDetails.subjects as any,
            experience: tutorDetails.experience,
            hourly_rate: tutorDetails.hourly_rate ? parseFloat(tutorDetails.hourly_rate) : null,
            is_available: tutorDetails.is_available,
          },
        ], {
          onConflict: 'tutor_id',
          ignoreDuplicates: false,
        });

      if (tutorError) throw tutorError;
      toast.success("Profil berhasil diperbarui");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (subjectValue: string) => {
    setTutorDetails(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subjectValue)
        ? prev.subjects.filter(s => s !== subjectValue)
        : [...prev.subjects, subjectValue]
    }));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setProfile({
            ...profile,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success("Lokasi berhasil didapatkan");
        },
        () => {
          toast.error("Gagal mendapatkan lokasi");
        }
      );
    } else {
      toast.error("Browser tidak mendukung geolokasi");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPassword(true);
    
    try {
      if (newPassword.length < 8) {
        throw new Error("Password baru minimal 8 karakter");
      }
      
      if (newPassword !== confirmPassword) {
        throw new Error("Password baru tidak cocok");
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.email || profile.email,
        password: currentPassword,
      });
      
      if (verifyError) {
        throw new Error("Password lama salah");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;
      
      toast.success("Password berhasil diubah");
      setShowPasswordDialog(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah password");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Profil Tutor</h1>
        <p className="text-muted-foreground">Kelola informasi profil tutor Anda</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Pribadi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="08xx-xxxx-xxxx"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Alamat Lengkap</Label>
              <Textarea
                id="address"
                value={profile.address || ""}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Lokasi Koordinat</Label>
              <div className="flex gap-2">
                <Input
                  value={profile.latitude && profile.longitude ? `${profile.latitude.toFixed(6)}, ${profile.longitude.toFixed(6)}` : "Belum diset"}
                  disabled
                  className="bg-muted"
                />
                <Button type="button" variant="outline" onClick={getCurrentLocation}>
                  <MapPin className="h-4 w-4 mr-2" />
                  Dapatkan Lokasi
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Lokasi digunakan agar siswa dapat menemukan Anda berdasarkan jarak</p>
            </div>
          </CardContent>
        </Card>

        {/* Tutor Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Detail Tutor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mata Pelajaran yang Dikuasai</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {subjects.map((subject) => (
                  <div key={subject.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={subject.value}
                      checked={tutorDetails.subjects.includes(subject.value)}
                      onCheckedChange={() => toggleSubject(subject.value)}
                    />
                    <label
                      htmlFor={subject.value}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {subject.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Pengalaman Mengajar</Label>
              <Textarea
                id="experience"
                value={tutorDetails.experience}
                onChange={(e) => setTutorDetails({ ...tutorDetails, experience: e.target.value })}
                placeholder="Ceritakan pengalaman mengajar Anda..."
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hourly_rate">Tarif per Jam (Rp)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hourly_rate"
                  type="number"
                  value={tutorDetails.hourly_rate}
                  onChange={(e) => setTutorDetails({ ...tutorDetails, hourly_rate: e.target.value })}
                  placeholder="50000"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_available"
                checked={tutorDetails.is_available}
                onCheckedChange={(checked) => setTutorDetails({ ...tutorDetails, is_available: !!checked })}
              />
              <label
                htmlFor="is_available"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Tersedia untuk mengajar
              </label>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={saving} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setShowPasswordDialog(true)}
        >
          <Lock className="h-4 w-4 mr-2" />
          Ubah Password
        </Button>
      </form>
      
      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Password</DialogTitle>
            <DialogDescription>
              Masukkan password lama dan password baru Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tutorCurrentPassword">Password Lama</Label>
              <Input
                id="tutorCurrentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutorNewPassword">Password Baru</Label>
              <Input
                id="tutorNewPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tutorConfirmPassword">Konfirmasi Password Baru</Label>
              <Input
                id="tutorConfirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? "Mengubah..." : "Ubah Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TutorProfile;
