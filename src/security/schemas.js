import { z } from 'zod';
export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(1024),
}).strict();
export const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(3).max(254),
  documentId: z.string().trim().max(40).optional(),
  password: z.string().min(12).max(1024),
  role: z.literal('CLIENT'),
}).strict();
// Never pass raw Zod errors (which may contain input) into UI or logs.
export function validateInput(schema, input) {
  const result = schema.safeParse(input);
  if (!result.success) throw new Error('Revisa los datos del formulario. Para registro, usa al menos 12 caracteres en la contraseña.');
  return result.data;
}
export const authSduiResponseSchema = z.object({
  schema: z.object({ dividerText: z.string().max(200).optional() }).strip(),
}).strip();
