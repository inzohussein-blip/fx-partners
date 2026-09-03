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
