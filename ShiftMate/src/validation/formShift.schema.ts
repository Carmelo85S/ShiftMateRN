import { z } from 'zod';

export const FormShiftSchema = z.object({
  department_id: z
    .string()
    .uuid()
    .nullable()
    .optional()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),  title: z.string()
      .min(3)
      .max(50),

  description: z.string().max(200).optional().or(z.literal('')),

  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  client_name: z.string().optional().or(z.literal('')),

  shift_date: z.date().refine((date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    return target >= today;
  }, {
    message: "Shift date must not be in the past",
  }),

  hourly_rate: z.coerce.number().min(1),

  start_time: z.date(),
  end_time: z.date(),

  image_url: z.string().url().optional().or(z.literal('')),

  required_workers: z.coerce.number().min(1).default(1),})
  .refine((data) => data.end_time > data.start_time, {
    message: "End time must be after start time",
    path: ["end_time"],
  });