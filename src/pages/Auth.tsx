import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap } from "lucide-react";

import { LoginForm, RegistrationForm } from "@/components/auth";
import { loginSchema, registrationSchema } from "@/lib/constants/auth";
import { loginUser, registerUser, forgotPassword, resetPassword, getGoogleAuthUrl } from "@/lib/queries/authQueries";
import type { Role } from "@/lib/types/user";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "student";
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "tutor">(roleParam as "student" | "tutor");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const [resetEmail, setResetEmail] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const isResetMode = searchParams.get("reset") === "true";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");
    
    if (error) {
      if (error === "state_not_found" || error === "bad_oauth_state") {
        toast.error("Sesi login Google sudah kadaluarsa. Silakan coba lagi.");
      } else if (errorDescription) {
        toast.error(decodeURIComponent(errorDescription.replace(/\+/g, " ")));
      } else {
        toast.error("Login dengan Google gagal. Silakan coba lagi.");
      }
      
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, "", cleanUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLocationError("");
        },
        (error) => {
          setLocationError("Lokasi tidak dapat dideteksi. Anda bisa input manual koordinat nanti.");
          console.error("Geolocation error:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1);

        if (userRoles && userRoles.length > 0) {
          if (userRoles[0].role === "admin") {
            navigate("/admin");
          } else if (userRoles[0].role === "tutor") {
            navigate("/tutor");
          } else {
            navigate("/student");
          }
        } else {
          const { data: existingProfile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", session.user.id)
            .single();

          if (!existingProfile) {
            await supabase.from("profiles").insert({
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
              email: session.user.email!,
              phone: session.user.user_metadata?.phone || "0000000000",
            });
          }

          const { data: roleCheck } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id)
            .limit(1);

          if (!roleCheck || roleCheck.length === 0) {
            await supabase.from("user_roles").insert({
              user_id: session.user.id,
              role: "student",
            });
          }

          toast.success("Login berhasil!");
          navigate("/student");
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [provinceCode, setProvinceCode] = useState("");
  const [regencyCode, setRegencyCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [villageCode, setVillageCode] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [grade, setGrade] = useState("");
  
  // Tutor document links
  const [ktpLink, setKtpLink] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [certificateLinks, setCertificateLinks] = useState<string[]>([]);
  
  // Education
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [ipk, setIpk] = useState("");

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await getGoogleAuthUrl();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login dengan Google gagal");
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordLoading(true);
    
    try {
      if (!resetEmail.trim()) {
        throw new Error("Email harus diisi");
      }
      
      await forgotPassword(resetEmail);
      toast.success("Link reset password telah dikirim ke email Anda");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengirim link reset password");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse({ email, password });
      const userRole = await loginUser(validatedData.email, validatedData.password);
      
      toast.success("Login berhasil!");
      
      if (userRole === "admin") {
        navigate("/admin");
      } else if (userRole === "tutor") {
        navigate("/tutor");
      } else {
        navigate("/student");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error instanceof Error ? error.message : "Login gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = registrationSchema.parse({
        fullName,
        email,
        phone,
        password,
        address: address || undefined,
        experience: experience || undefined,
      });

      await registerUser(
        validatedData.email,
        validatedData.password,
        validatedData.fullName,
        validatedData.phone,
        role,
        {
          address: validatedData.address,
          province_code: provinceCode,
          regency_code: regencyCode,
          district_code: districtCode,
          village_code: villageCode,
          latitude: location?.lat,
          longitude: location?.lng,
          subjects: role === "tutor" ? subjects : undefined,
          experience: validatedData.experience,
          ktpLink: role === "tutor" ? ktpLink : undefined,
          cvLink: role === "tutor" ? cvLink : undefined,
          certificateLinks: role === "tutor" && certificateLinks.length > 0 ? certificateLinks : undefined,
          university: role === "tutor" ? university : undefined,
          major: role === "tutor" ? major : undefined,
          graduationYear: role === "tutor" && graduationYear ? parseInt(graduationYear) : undefined,
          ipk: role === "tutor" && ipk ? parseFloat(ipk) : undefined,
          schoolName: role === "student" ? schoolName : undefined,
          grade: role === "student" ? grade : undefined,
        }
      );

      toast.success(role === "tutor" 
        ? "Registrasi berhasil! Menunggu persetujuan admin." 
        : "Registrasi berhasil! Silakan login.");
      setIsLogin(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error instanceof Error ? error.message : "Registrasi gagal");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isResetMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <GraduationCap className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              Masukkan password baru Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newPassword) {
                toast.error("Password harus diisi");
                return;
              }
              if (newPassword.length < 8) {
                toast.error("Password minimal 8 karakter");
                return;
              }
              if (newPassword !== confirmPassword) {
                toast.error("Password tidak cocok");
                return;
              }

              setResettingPassword(true);
              resetPassword(newPassword)
                .then(() => {
                  toast.success("Password berhasil diubah");
                  navigate("/auth");
                })
                .catch((error) => {
                  toast.error(error instanceof Error ? error.message : "Gagal reset password");
                })
                .finally(() => {
                  setResettingPassword(false);
                });
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Password Baru</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Masukkan password lagi"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={resettingPassword}>
                {resettingPassword ? "Memproses..." : "Simpan Password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Masuk ke Bintang TQA" : "Daftar di Bintang TQA"}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? "Masukkan kredensial Anda untuk melanjutkan"
              : `Daftar sebagai ${role === "student" ? "Siswa" : "Tutor"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={isLogin ? "login" : "register"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login" onClick={() => setIsLogin(true)}>
                Login
              </TabsTrigger>
              <TabsTrigger value="register" onClick={() => setIsLogin(false)}>
                Daftar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <LoginForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                onForgotPassword={() => setShowForgotPassword(true)}
              />
            </TabsContent>

            <TabsContent value="register">
              <RegistrationForm
                role={role}
                setRole={setRole}
                fullName={fullName}
                setFullName={setFullName}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                address={address}
                setAddress={setAddress}
                province_code={provinceCode}
                setProvinceCode={setProvinceCode}
                regency_code={regencyCode}
                setRegencyCode={setRegencyCode}
                district_code={districtCode}
                setDistrictCode={setDistrictCode}
                village_code={villageCode}
                setVillageCode={setVillageCode}
                schoolName={schoolName}
                setSchoolName={setSchoolName}
                grade={grade}
                setGrade={setGrade}
                location={location}
                locationError={locationError}
                subjects={subjects}
                setSubjects={setSubjects}
                experience={experience}
                setExperience={setExperience}
                password={password}
                setPassword={setPassword}
                ktpLink={ktpLink}
                setKtpLink={setKtpLink}
                cvLink={cvLink}
                setCvLink={setCvLink}
                certificateLinks={certificateLinks}
                setCertificateLinks={setCertificateLinks}
                university={university}
                setUniversity={setUniversity}
                major={major}
                setMajor={setMajor}
                graduationYear={graduationYear}
                setGraduationYear={setGraduationYear}
                ipk={ipk}
                setIpk={setIpk}
                loading={loading}
                onSubmit={handleRegister}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lupa Password</DialogTitle>
            <DialogDescription>
              Masukkan email Anda untuk menerima link reset password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resetEmail">Email</Label>
              <Input
                id="resetEmail"
                type="email"
                placeholder="nama@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForgotPassword(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={resetPasswordLoading}>
                {resetPasswordLoading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;