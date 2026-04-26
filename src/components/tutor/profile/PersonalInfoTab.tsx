import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User, MapPin, Lock } from "lucide-react";

interface PersonalInfoTabProps {
  profile: {
    full_name: string;
    email: string;
    phone: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
  };
  setProfile: (profile: any) => void;
  onGetCurrentLocation: () => void;
  onShowPasswordDialog: () => void;
}

export const PersonalInfoTab = ({ 
  profile, 
  setProfile, 
  onGetCurrentLocation, 
  onShowPasswordDialog 
}: PersonalInfoTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="h-5 w-5 text-primary" />
            Informasi Dasar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                className="bg-muted cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Nomor Telepon / WhatsApp</Label>
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
              placeholder="Masukkan alamat sesuai KTP"
              className="min-h-[100px] resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MapPin className="h-5 w-5 text-primary" />
              Lokasi Presensi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-md text-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Latitude:</span>
                <span>{profile.latitude?.toFixed(6) || "Belum diset"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Longitude:</span>
                <span>{profile.longitude?.toFixed(6) || "Belum diset"}</span>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full" onClick={onGetCurrentLocation}>
              <MapPin className="h-4 w-4 mr-2" />
              Update Lokasi Saya
            </Button>
            <p className="text-[11px] text-muted-foreground text-center italic">
              Titik koordinat digunakan untuk memvalidasi lokasi Anda saat mengajar (Presensi).
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="h-5 w-5 text-primary" />
              Keamanan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={onShowPasswordDialog}
            >
              <Lock className="h-4 w-4 mr-2" />
              Ubah Password Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
