import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nama lengkap minimal 2 karakter")
      .max(100, "Nama lengkap maksimal 100 karakter"),
    email: z
      .string()
      .trim()
      .email("Format alamat email tidak valid")
      .max(255, "Email maksimal 255 karakter")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password harus memuat minimal 1 huruf besar, 1 huruf kecil, dan 1 angka"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Format alamat email tidak valid")
    .max(255, "Email maksimal 255 karakter")
    .toLowerCase(),
  password: z.string().min(1, "Password wajib diisi"),
});

export type RegisterFormInput = z.infer<typeof registerSchema>;
export type LoginFormInput = z.infer<typeof loginSchema>;
