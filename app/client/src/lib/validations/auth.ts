import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  agree: z.boolean().refine((value) => value === true, {
    message: "You must agree to the terms and conditions",
  }),
});

export const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().default(false),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .regex(new RegExp("^\\d+$"), "OTP must contain only numbers"),
});

export const forgetPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
});

export const changePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type ChangeFormData = z.infer<typeof changePasswordSchema>;
export type ForgetFormData = z.infer<typeof forgetPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type SignInFormData = z.infer<typeof signInSchema>;
