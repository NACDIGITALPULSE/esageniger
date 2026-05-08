import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const submitApplicationSchema = z.object({
  receipt_number: z.string().min(1),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(6).max(30),
  email: z.string().email().max(150),
  program_title: z.string().nullable(),
  program_level: z.string().nullable(),
  program_title_2: z.string().nullable(),
  program_level_2: z.string().nullable(),
  tuition_title: z.string().nullable(),
  tuition_price: z.string().nullable(),
  message: z.string().nullable(),
});

const confirmWhatsappSchema = z.object({
  applicationId: z.string().uuid(),
});

export const submitApplication = createServerFn({ method: "POST" })
  .inputValidator((data) => submitApplicationSchema.parse(data))
  .handler(async ({ data }) => {
    const { data: inserted, error } = await supabaseAdmin
      .from("applications")
      .insert({
        receipt_number: data.receipt_number,
        full_name: data.full_name,
        phone: data.phone,
        email: data.email,
        program_id: null,
        program_id_2: null,
        program_title: data.program_title,
        program_level: data.program_level,
        program_title_2: data.program_title_2,
        program_level_2: data.program_level_2,
        tuition_tier_id: null,
        tuition_title: data.tuition_title,
        tuition_price: data.tuition_price,
        message: data.message,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return inserted;
  });

export const confirmApplicationWhatsapp = createServerFn({ method: "POST" })
  .inputValidator((data) => confirmWhatsappSchema.parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("applications")
      .update({
        whatsapp_sent: true,
        whatsapp_sent_at: new Date().toISOString(),
      })
      .eq("id", data.applicationId);

    if (error) {
      throw new Error(error.message);
    }

    return { ok: true };
  });