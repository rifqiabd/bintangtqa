import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const AdminAttendance = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Laporan Absensi</h1>
        <p className="text-muted-foreground">Lihat laporan absensi semua tutor</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Halaman dalam pengembangan</h3>
          <p className="text-muted-foreground text-center">
            Fitur laporan absensi akan segera tersedia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAttendance;
