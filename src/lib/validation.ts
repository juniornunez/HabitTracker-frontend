import { z } from 'zod';

export const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('El correo no es válido'),
  contraseña: z.string().min(1, 'La contraseña es obligatoria'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    nombre: z.string().min(1, 'El nombre es obligatorio'),
    correo: z
      .string()
      .min(1, 'El correo es obligatorio')
      .email('El correo no es válido'),
    contraseña: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmarContraseña: z.string().min(1, 'Confirmá tu contraseña'),
  })
  .refine((data) => data.contraseña === data.confirmarContraseña, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmarContraseña'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const habitSchema = z.object({
  nombre: z.string().min(1, 'El nombre del hábito es obligatorio'),
  descripcion: z.string().optional(),
  categoria: z.enum(['Salud', 'Bienestar', 'Educación', 'Productividad']).optional(),
  frecuencia: z.enum(['diario', 'semanal', 'personalizada']),
  prioridad: z.number().int().min(1).max(3),
  fechaInicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fechaFin: z.string().optional(),
  activo: z.boolean().optional(),
});

export type HabitFormData = z.infer<typeof habitSchema>;

/**
 * Corre un esquema de Zod contra un objeto y devuelve los errores
 * en un formato fácil de usar en el estado de un formulario de React:
 * { campo: "mensaje de error" }
 */
export function getZodErrors<T>(
  schema: z.ZodType<T>,
  data: unknown,
): Record<string, string> | null {
  const result = schema.safeParse(data);
  if (result.success) return null;

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0]?.toString() || 'general';
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}