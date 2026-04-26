import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Format email tidak valid").max(255, "Email terlalu panjang"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password terlalu panjang"),
});

export const registrationSchema = z.object({
  fullName: z.string().trim().min(2, "Nama minimal 2 karakter").max(100, "Nama terlalu panjang"),
  email: z.string().trim().email("Format email tidak valid").max(255, "Email terlalu panjang"),
  phone: z.string().trim().regex(/^[0-9]{10,15}$/, "Nomor HP harus 10-15 digit angka"),
  password: z.string().min(8, "Password minimal 8 karakter").max(72, "Password terlalu panjang"),
  address: z.string().max(500, "Alamat terlalu panjang").optional(),
  experience: z.string().max(2000, "Pengalaman terlalu panjang").optional(),
});

export const subjectOptions = [
  { value: "matematika", label: "Matematika" },
  { value: "fisika", label: "Fisika" },
  { value: "kimia", label: "Kimia" },
  { value: "biologi", label: "Biologi" },
  { value: "bahasa_indonesia", label: "Bahasa Indonesia" },
  { value: "bahasa_inggris", label: "Bahasa Inggris" },
];