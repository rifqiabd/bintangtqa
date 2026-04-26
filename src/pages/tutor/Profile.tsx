import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save } from "lucide-react";

// Sub-components
import { PersonalInfoTab } from "@/components/tutor/profile/PersonalInfoTab";
import { EducationTab } from "@/components/tutor/profile/EducationTab";
import { ExpertiseTab } from "@/components/tutor/profile/ExpertiseTab";
import { DocumentsTab } from "@/components/tutor/profile/DocumentsTab";
import { ChangePasswordDialog } from "@/components/tutor/profile/ChangePasswordDialog";

const TutorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    school_name: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  
  const [tutorDetails, setTutorDetails] = useState({
    subjects: [] as string[],
    experience: "",
    hourly_rate: "",
    is_available: true,
    university: "",
    major: "",
    graduation_year: "",
    ipk: "",
    ktp_link: "",
    cv_link: "",
    certificate_links: [] as string[],
  });

  // Helper for Google Drive preview
  const getDrivePreviewUrl = (url: string) => {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/file/d/${match[1]}/preview`;
    }
    return null;
  };

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
        setProfile({
          full_name: profileData.full_name || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          school_name: profileData.school_name || "",
          latitude: profileData.latitude,
          longitude: profileData.longitude,
        });
      }

      const { data: tutorData, error: tutorError } = await supabase
        .from("tutor_details")
        .select("*")
        .eq("tutor_id", user.id)
        .maybeSingle();

      if (tutorData) {
        setTutorDetails({
          subjects: Array.isArray(tutorData.subjects) ? tutorData.subjects : (tutorData.subjects ? JSON.parse(tutorData.subjects) : []),
          experience: tutorData.experience || "",
          hourly_rate: tutorData.hourly_rate?.toString() || "",
          is_available: tutorData.is_available ?? true,
          university: tutorData.university || "",
          major: tutorData.major || "",
          graduation_year: tutorData.graduation_year?.toString() || "",
          ipk: tutorData.ipk?.toString() || "",
          ktp_link: tutorData.ktp_link || "",
          cv_link: tutorData.cv_link || "",
          certificate_links: tutorData.certificate_links || [],
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
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
          school_name: profile.school_name,
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
            university: tutorDetails.university,
            major: tutorDetails.major,
            graduation_year: tutorDetails.graduation_year ? parseInt(tutorDetails.graduation_year) : null,
            ipk: tutorDetails.ipk ? parseFloat(tutorDetails.ipk) : null,
            ktp_link: tutorDetails.ktp_link,
            cv_link: tutorDetails.cv_link,
            certificate_links: tutorDetails.certificate_links,
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
    <div className="container mx-auto space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Profil Tutor</h1>
          <p className="text-muted-foreground mt-1">Kelola informasi profil dan kelengkapan data Anda</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-6 overflow-x-auto no-scrollbar">
          <TabsTrigger 
            value="personal" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 font-semibold transition-all"
          >
            Informasi Pribadi
          </TabsTrigger>
          <TabsTrigger 
            value="education" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 font-semibold transition-all"
          >
            Pendidikan
          </TabsTrigger>
          <TabsTrigger 
            value="expertise" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 font-semibold transition-all"
          >
            Keahlian & Pengalaman
          </TabsTrigger>
          <TabsTrigger 
            value="documents" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-2 pb-3 pt-2 font-semibold transition-all"
          >
            Dokumen
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <PersonalInfoTab 
            profile={profile}
            setProfile={setProfile}
            onGetCurrentLocation={getCurrentLocation}
            onShowPasswordDialog={() => setShowPasswordDialog(true)}
          />
        </TabsContent>

        <TabsContent value="education" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <EducationTab 
            tutorDetails={tutorDetails}
            setTutorDetails={setTutorDetails}
          />
        </TabsContent>

        <TabsContent value="expertise" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <ExpertiseTab 
            tutorDetails={tutorDetails as any}
            setTutorDetails={setTutorDetails}
            onToggleSubject={toggleSubject}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <DocumentsTab 
            tutorDetails={tutorDetails}
            getDrivePreviewUrl={getDrivePreviewUrl}
          />
        </TabsContent>
      </Tabs>
      
      <ChangePasswordDialog 
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        userEmail={profile.email}
      />
    </div>
  );
};

export default TutorProfile;
