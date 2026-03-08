import { z } from 'zod'
export const createPatientSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0),
  sex: z.string().optional(),
  mobile_number: z.string().min(8),
  email: z.string().email().optional(),
})
export type CreatePatientInput = z.infer<typeof createPatientSchema>
