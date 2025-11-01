import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GraduationCap, MapPin } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "student";
  
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"student" | "tutor">(roleParam as "student" | "tutor");
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState("");

  // Login form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Registration form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [experience, setExperience] = useState("");

  const subjectOptions = [
    { value: "matematika", label: "Matematika" },
    { value: "fisika", label: "Fisika" },
    { value: "kimia", label: "Kimia" },
    { value: "biologi", label: "Biologi" },
    { value: "bahasa_indonesia", label: "Bahasa Indonesia" },
    { value: "bahasa_inggris", label: "Bahasa Inggris" },
  ];

  useEffect(() => {
    // Get current location
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Get user profile to determine role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      toast.success("Login berhasil!");
      
      // Redirect based on role
      if (profile?.role === "admin") {
        navigate("/admin");
      } else if (profile?.role === "tutor") {
        navigate("/tutor");
      } else {
        navigate("/student");
      }
    } catch (error: any) {
      toast.error(error.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: fullName,
        email,
        phone,
        address,
        latitude: location?.lat,
        longitude: location?.lng,
        role: role,
      });

      if (profileError) throw profileError;

      // If tutor, create tutor details
      if (role === "tutor") {
        const { error: tutorError } = await supabase.from("tutor_details").insert([{
          tutor_id: authData.user.id,
          subjects: subjects as any,
          experience,
        }]);

        if (tutorError) throw tutorError;
      }

      toast.success("Registrasi berhasil! Silakan login.");
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? "Masuk ke EduMatch" : "Daftar di EduMatch"}
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
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
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

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nama Lengkap</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regEmail">Email</Label>
                  <Input
                    id="regEmail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Nomor HP</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Alamat</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Lokasi
                  </Label>
                  {location ? (
                    <p className="text-sm text-muted-foreground">
                      ✓ Lokasi terdeteksi ({location.lat.toFixed(6)}, {location.lng.toFixed(6)})
                    </p>
                  ) : (
                    <p className="text-sm text-destructive">{locationError}</p>
                  )}
                </div>

                {role === "tutor" && (
                  <>
                    <div className="space-y-2">
                      <Label>Mata Pelajaran</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {subjectOptions.map((subject) => (
                          <div key={subject.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={subject.value}
                              checked={subjects.includes(subject.value)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSubjects([...subjects, subject.value]);
                                } else {
                                  setSubjects(subjects.filter((s) => s !== subject.value));
                                }
                              }}
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
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="Ceritakan pengalaman mengajar Anda..."
                      />
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;