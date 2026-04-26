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
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { GraduationCap, MapPin, Chrome } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { z } from "zod";

// Validation schemas
const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").max(255, "Email terlalu panjang"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password terlalu panjang"),
});

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  email: z.string().trim().email("Format email tidak valid").max(255, "Email terlalu panjang"),
  phone: z.string().trim().regex(/^[0-9]{10,15}$/, "Nomor HP harus 10-15 digit angka"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password terlalu panjang"),
  address: z.string().max(500, "Alamat terlalu panjang").optional(),
  experience: z.string().max(2000, "Pengalaman terlalu panjang").optional(),
});

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

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Login dengan Google gagal");
      setLoading(false);
    }
  };

  // Handle OAuth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if user has a role
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .limit(1);

        if (userRoles && userRoles.length > 0) {
          // User has role, redirect based on role
          if (userRoles[0].role === "admin") {
            navigate("/admin");
          } else if (userRoles[0].role === "tutor") {
            navigate("/tutor");
          } else {
            navigate("/student");
          }
        } else {
          // New Google user, create profile and role
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

          // Check if role exists, if not create as student
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input
      const validatedData = loginSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) throw error;

      // Get user role from user_roles table
      const { data: userRoles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .limit(1);

      // If no role exists, create as student by default
      if (!userRoles || userRoles.length === 0) {
        const { error: insertError } = await supabase.from("user_roles").insert({
          user_id: data.user.id,
          role: "student",
        });
        
        if (!insertError) {
          toast.success("Login berhasil!");
          await new Promise(resolve => setTimeout(resolve, 1000));
          navigate("/student");
        } else {
          console.error("Error creating role:", insertError);
          toast.error("Gagal membuat role user");
        }
        return;
      }

      toast.success("Login berhasil!");
      
      // Redirect based on role
      if (userRoles[0].role === "admin") {
        navigate("/admin");
      } else if (userRoles[0].role === "tutor") {
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
      // Validate input
      const validatedData = registrationSchema.parse({
        fullName,
        email,
        phone,
        password,
        address: address || undefined,
        experience: experience || undefined,
      });

      // Register user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed");

      // Create profile (without role)
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        latitude: location?.lat,
        longitude: location?.lng,
      });

      if (profileError) throw profileError;

      // Create user role in user_roles table
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: authData.user.id,
        role: role,
      });

      if (roleError) throw roleError;

      // If tutor, create tutor details
      if (role === "tutor") {
        const { error: tutorError } = await supabase.from("tutor_details").insert({
          tutor_id: authData.user.id,
          subjects: subjects as Database["public"]["Enums"]["subject_area"][],
          experience: validatedData.experience,
        });

        if (tutorError) throw tutorError;
      }

      toast.success("Registrasi berhasil! Silakan login.");
      setIsLogin(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Registrasi gagal");
      }
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

                <div className="relative my-4">
                  <Separator />
                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                    atau
                  </span>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <Chrome className="mr-2 h-4 w-4" />
                  Masuk dengan Google
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