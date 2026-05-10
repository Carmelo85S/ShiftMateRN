import { z } from 'zod';

export const FormShiftSchema = z.object({
  department: z.string().min(1, "Department is required"),
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be at most 50 characters"),
  description: z.string()
    .max(200, "Description must be at most 200 characters")
    .optional()
    .or(z.literal('')),
  
  // Error message 
  shift_date: z.date({ 
    message: "Please select a valid date" 
  }).refine(
    (date) => date >= new Date(new Date().setHours(0, 0, 0, 0)), 
    "Shift date cannot be in the past"
  ),

  hourly_rate: z.coerce.number({ message: "Hourly rate must be a positive number" })
    .min(1, "Rate is too low"),

  start_time: z.date({ message: "Select start time" }),
  end_time: z.date({ message: "Select end time" }),
  
  image_url: z.string().url("Invalid URL").optional().or(z.literal('')),
})
.refine((data) => {
  if (!data.start_time || !data.end_time) return true;
  return data.end_time.getTime() > data.start_time.getTime();
}, {
  message: "End time must be after start time",
  path: ["end_time"],
});

export type FormShift = z.infer<typeof FormShiftSchema>;