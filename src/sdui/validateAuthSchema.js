import { z } from 'zod';

/**
 * CoPilotRD® — Contrato SDUI de autenticación.
 * Basado en la estructura observada del backend.
 * Sin esquemas locales de respaldo.
 */

const nonEmpty = z.string().trim().min(1).max(500);

const header = z.object({
  type: z.literal('header'),
  title: nonEmpty,
  subtitle: z.string().max(500).optional(),
}).passthrough();

const input = z.object({
  type: z.literal('input'),
  key: nonEmpty,
  placeholder: z.string().max(500).optional(),
  icon: z.string().max(100).optional(),
  secure: z.boolean().optional(),
  suffixIcon: z.string().max(100).optional(),
}).passthrough();

const button = z.object({
  type: z.literal('button'),
  label: nonEmpty,
  action: nonEmpty,
  style: z.string().max(100).optional(),
}).passthrough();

const link = z.object({
  type: z.literal('link'),
  label: nonEmpty,
  action: nonEmpty,
}).passthrough();

const divider = z.object({
  type: z.literal('divider'),
  text: z.string().max(500).optional(),
}).passthrough();

const socialButton = z.object({
  type: z.literal('socialButton'),
  provider: nonEmpty,
  label: nonEmpty,
}).passthrough();

const footerLink = z.object({
  type: z.literal('footerLink'),
  text: nonEmpty,
  actionText: nonEmpty,
  action: nonEmpty,
}).passthrough();

const componentSchema = z.discriminatedUnion('type', [
  header,
  input,
  button,
  link,
  divider,
  socialButton,
  footerLink,
]);

const authSchema = z.object({
  screen: nonEmpty,
  title: nonEmpty,
  theme: z.string().max(100).optional(),
  components: z.array(componentSchema).min(1).max(100),
}).passthrough();

export function validateAuthSchema(payload) {
  const candidate = payload?.schema ?? payload;
  const result = authSchema.safeParse(candidate);

  if (!result.success) {
    return {
      valid: false,
      reason: 'INVALID_AUTH_SCHEMA',
    };
  }

  return {
    valid: true,
    schema: result.data,
  };
}
