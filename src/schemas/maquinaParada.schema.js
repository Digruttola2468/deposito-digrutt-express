import { z } from "zod";

export const schemaPostMaquinaParada = z.object({
  fecha: z.string().nonempty(),
  idMotivoMaquinaParada: z.number(),
  hrs: z.number().min(1).max(24),
  idMaquina: z.number(),
});

export const schemaPutMaquinaParada = z.object({
    fecha: z.string().optional().nullable(),
    idMotivoMaquinaParada: z.number().optional().nullable(),
    hrs: z.number().min(1).max(24).optional().nullable(),
    idMaquina: z.number().optional().nullable(),
});

