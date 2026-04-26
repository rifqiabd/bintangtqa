import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
}

export const ChangePasswordDialog = ({ open, onOpenChange, userEmail }: ChangePasswordDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

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
      
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: userEmail,
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
      onOpenChange(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal mengubah password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
          <DialogDescription>
            Pastikan password baru Anda aman dan mudah diingat.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="tutorCurrentPassword">Password Saat Ini</Label>
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
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={changingPassword} className="bg-primary shadow-lg shadow-primary/20">
              {changingPassword ? "Memproses..." : "Update Password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
