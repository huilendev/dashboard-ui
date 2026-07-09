import { z } from "zod";

// Login validation schema
export const LoginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

// Signup validation schema
export const SignupSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters long")
    .max(50, "Name must be at most 50 characters long"),
});

export type SignupInput = z.infer<typeof SignupSchema>;

// Password reset request validation schema
export const PasswordResetRequestSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email("Invalid email address"),
});

export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>;

// Password reset confirmation validation schema
export const PasswordResetConfirmSchema = z.object({
  token: z.string({ required_error: "Token is required" }).min(1, "Token is required"),
  newPassword: z
    .string({ required_error: "New password is required" })
    .min(1, "New password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string({ required_error: "Confirm password is required" }).min(1, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>;

// Helper function to validate and parse input
export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errorMessages = result.error.errors.map((e) => e.message);
  return { success: false, error: errorMessages.join(", ") };
}
