import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

interface DocumentsTabProps {
  tutorDetails: {
    ktp_link: string;
    cv_link: string;
    certificate_links: string[];
  };
  getDrivePreviewUrl: (url: string) => string | null;
}

export const DocumentsTab = ({ tutorDetails, getDrivePreviewUrl }: DocumentsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          Verifikasi Dokumen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* KTP Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ktp_link" className="font-bold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Link Scan KTP
              </Label>
              <Input
                id="ktp_link"
                value={tutorDetails.ktp_link}
                disabled
                className="bg-muted cursor-not-allowed"
                placeholder="Link Google Drive"
              />
            </div>
            {getDrivePreviewUrl(tutorDetails.ktp_link) ? (
              <div className="rounded-xl border-2 border-primary/5 overflow-hidden bg-black/5 aspect-[4/3] relative group">
                <iframe
                  src={getDrivePreviewUrl(tutorDetails.ktp_link)!}
                  className="w-full h-full"
                  allow="autoplay"
                ></iframe>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
                Link KTP belum valid atau belum diset
              </div>
            )}
          </div>

          {/* CV Section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cv_link" className="font-bold flex items-center gap-2">
                <FileText className="h-4 w-4" /> Link CV / Portfolio
              </Label>
              <Input
                id="cv_link"
                value={tutorDetails.cv_link}
                disabled
                className="bg-muted cursor-not-allowed"
                placeholder="Link Google Drive"
              />
            </div>
            {getDrivePreviewUrl(tutorDetails.cv_link) ? (
              <div className="rounded-xl border-2 border-primary/5 overflow-hidden bg-black/5 aspect-[3/4] relative group">
                <iframe
                  src={getDrivePreviewUrl(tutorDetails.cv_link)!}
                  className="w-full h-full"
                  allow="autoplay"
                ></iframe>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-xl p-8 text-center text-muted-foreground bg-muted/20">
                Link CV belum valid atau belum diset
              </div>
            )}
          </div>
        </div>

        {/* Certificates Section */}
        <div className="pt-6 border-t">
          <div className="flex items-center justify-between mb-4">
            <Label className="text-lg font-bold">Sertifikat Pendukung</Label>
            <p className="text-xs text-muted-foreground italic">Link sertifikat terkunci</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorDetails.certificate_links.map((link, index) => (
              <div key={index} className="space-y-3 p-4 border rounded-xl bg-muted/10 relative group">
                <Input
                  value={link}
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Link Sertifikat Google Drive"
                />
                {getDrivePreviewUrl(link) && (
                  <div className="rounded-lg border overflow-hidden bg-black/5 aspect-video">
                    <iframe
                      src={getDrivePreviewUrl(link)!}
                      className="w-full h-full"
                      allow="autoplay"
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
            {tutorDetails.certificate_links.length === 0 && (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                Belum ada sertifikat pendukung yang ditambahkan
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
