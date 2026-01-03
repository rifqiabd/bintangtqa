import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

const AdminTutors = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Semua Tutor</h1>
        <p className="text-muted-foreground">Kelola data tutor</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Users className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Halaman dalam pengembangan</h3>
          <p className="text-muted-foreground text-center">
            Fitur manajemen tutor akan segera tersedia
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminTutors;
