import { z } from 'zod';

// ── Patient ───────────────────────────────────────────────────────────────────

export const createPatientSchema = z.object({
  name: z
    .string({ required_error: 'Full name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be under 100 characters')
    .trim(),
  age: z
    .number({ required_error: 'Age is required', invalid_type_error: 'Age must be a number' })
    .int('Age must be a whole number')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age must be realistic'),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  mobile_number: z
    .string({ required_error: 'Mobile number is required' })
    .min(8, 'Mobile number is too short')
    .max(15, 'Mobile number is too long')
    .regex(/^\+?[0-9\s\-()]+$/, 'Mobile number contains invalid characters'),
  email: z
    .string()
    .email('Invalid email address')
    .max(254, 'Email is too long')
    .optional()
    .or(z.literal('')),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

// ── Prescription ──────────────────────────────────────────────────────────────

export const medicationSchema = z.object({
  medicine_id: z.string().uuid('Invalid medicine ID'),
  name: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required').max(100),
  frequency: z.string().min(1, 'Frequency is required').max(100),
  duration_days: z
    .number({ invalid_type_error: 'Duration must be a number' })
    .int()
    .min(1, 'Duration must be at least 1 day')
    .max(365, 'Duration cannot exceed 365 days'),
  instructions: z.string().max(500).default('After food'),
});

export const createPrescriptionSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  hospital_id: z.string().uuid('Invalid hospital ID'),
  medications: z
    .array(medicationSchema)
    .min(1, 'At least one medication is required')
    .max(20, 'Cannot add more than 20 medications'),
  notes: z.string().max(2000, 'Notes cannot exceed 2000 characters').optional(),
});

export type CreatePrescriptionInput = z.infer<typeof createPrescriptionSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;

// ── Appointment ───────────────────────────────────────────────────────────────

export const createAppointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  hospital_id: z.string().uuid('Invalid hospital ID'),
  appointment_time: z
    .string()
    .datetime({ message: 'Appointment time must be a valid ISO datetime' })
    .refine(
      (val) => new Date(val) > new Date(),
      'Appointment time must be in the future'
    ),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// ── Login ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address')
    .toLowerCase()
    .trim(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters'),
  // UI-only field — not sent to the backend
  rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ── Register ──────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone_number: z.string().optional(),
  role: z.enum(['DOCTOR', 'PATIENT'], { required_error: 'Role is required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ── Invite Accept ─────────────────────────────────────────────────────────────

export const inviteAcceptSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone_number: z.string().optional(),
});

export type InviteAcceptInput = z.infer<typeof inviteAcceptSchema>;

// ── API Response Validators (parse untrusted backend responses) ───────────────
// Use these in server-side fetch calls to validate shape before use.

export const patientResponseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  name: z.string().optional(),
  first_name: z.string(),
  last_name: z.string(),
  mobile_number: z.string().optional(),
  phone_number: z.string().optional(),
  gender: z.string().optional(),
  date_of_birth: z.string().optional(),
  age: z.number().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const patientListResponseSchema = z.object({
  data: z.array(patientResponseSchema),
  total: z.number(),
});

export const prescriptionResponseSchema = z.object({
  id: z.string(),
  prescription_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  hospital_id: z.string().uuid(),
  medications: z.array(
    z.object({
      medicine_id: z.string(),
      name: z.string(),
      dosage: z.string(),
      frequency: z.string(),
      duration_days: z.number(),
      instructions: z.string(),
    })
  ),
  notes: z.string(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

export const prescriptionListResponseSchema = z.object({
  data: z.array(prescriptionResponseSchema),
  total: z.number(),
});

export const medicineResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.string(),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  recommended_brands: z.string().optional(),
  price: z.number().optional(),
  stock: z.number().optional(),
  dosage_options: z.array(z.string()),
  frequency_suggestions: z.array(z.string()),
});

export const medicineListResponseSchema = z.object({
  data: z.array(medicineResponseSchema),
  total: z.number(),
});

export const appointmentResponseSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  doctor_id: z.string().uuid(),
  hospital_id: z.string().uuid(),
  appointment_time: z.string(),
  status: z.enum(['BOOKED', 'COMPLETED', 'CANCELLED']),
  created_at: z.string(),
});

export const appointmentListResponseSchema = z.object({
  data: z.array(appointmentResponseSchema),
  total: z.number(),
});

/**
 * safeParseResponse — validates untrusted API responses at the boundary.
 *
 * Behaviour:
 *   - Production: logs a warning and returns null on schema mismatch.
 *     The UI can handle null gracefully (show error state) without crashing.
 *   - Development: THROWS on mismatch so schema drift from the Go backend
 *     is caught immediately during local development rather than silently
 *     producing a null that causes confusing downstream undefined errors.
 *
 * Use in server-side fetch/Route Handlers where the response shape is untrusted.
 */
export function safeParseResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context = 'API response'
): T | null {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  const flattened = result.error.flatten();
  if (process.env.NODE_ENV !== 'production') {
    // Throw in development so engineers see schema drift immediately.
    throw new Error(
      `[Zod] ${context} validation failed:\n${JSON.stringify(flattened, null, 2)}`
    );
  }

  console.warn(`[Zod] ${context} validation failed:`, flattened);
  return null;
}
