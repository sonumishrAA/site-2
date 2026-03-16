import { z } from 'zod'

export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number (start with 6-9)')

export const admissionSchema = z.object({
  name:            z.string().min(2, 'Name is required'),
  father_name:     z.string().optional(),
  address:         z.string().optional(),
  phone:           phoneSchema.optional().or(z.literal('')),
  gender:          z.enum(['male', 'female']),
  selected_shifts: z.array(z.enum(['M','A','E','N'])).min(1, 'Select at least one shift'),
  seat_id:         z.string().uuid('Select a seat'),
  locker_id:       z.string().uuid().optional(),
  admission_date:  z.string(),
  plan_months:     z.number().int().min(1).max(12),
  payment_status:  z.enum(['paid', 'pending']),
  payment_method:  z.enum(['cash','upi','online','other']).optional(),
})

export const contactSchema = z.object({
  name:    z.string().min(2, 'Name is required'),
  phone:   phoneSchema,
  message: z.string().min(10, 'Please write at least 10 characters'),
})
