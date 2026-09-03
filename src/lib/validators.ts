import { z } from "zod";

/** Withdrawal request — validated on both client and server. */
export const withdrawalSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "أدخل مبلغاً صحيحاً" })
    .positive("يجب أن يكون المبلغ أكبر من صفر")
    .max(1_000_000, "المبلغ كبير جداً"),
  method: z.enum(["bank_transfer", "crypto", "ewallet"], {
    errorMap: () => ({ message: "اختر طريقة سحب صحيحة" }),
  }),
  destination: z
    .string()
    .trim()
    .min(4, "أدخل تفاصيل وجهة السحب (رقم حساب / محفظة)")
    .max(200, "التفاصيل طويلة جداً"),
});

export type WithdrawalValues = z.infer<typeof withdrawalSchema>;

/** Sign-in / sign-up credentials. */
export const authSchema = z.object({
  fullName: z.string().trim().max(80).optional(),
  email: z.string().trim().email("بريد إلكتروني غير صالح"),
  password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
});

export type AuthValues = z.infer<typeof authSchema>;

/** Partner profile settings. */
export const profileSchema = z.object({
  full_name: z.string().trim().max(80, "الاسم طويل جداً").optional().or(z.literal("")),
  company_name: z.string().trim().max(120).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(30)
    .regex(/^[+0-9\s()-]*$/, "رقم هاتف غير صالح")
    .optional()
    .or(z.literal("")),
});

export type ProfileValues = z.infer<typeof profileSchema>;

/** Reset-password: new password + confirmation. */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "كلمة المرور 6 أحرف على الأقل"),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: "كلمتا المرور غير متطابقتين",
    path: ["confirm"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
