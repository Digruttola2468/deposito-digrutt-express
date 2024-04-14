import { z } from "zod";

export const schemaPostProduccion = z.object({
  fecha: z.string(),
  numMaquina: z.number().min(0),
  golpesReales: z.number().min(0),
  piezasProducidas: z.number().min(0),
  promGolpesHora: z.number().min(0),
  idMatriz: z.number().min(1),
});

export const schemaListPostProduccion = z.array(
  z.object({
    fecha: z.string(),
    numMaquina: z.number().min(0),
    golpesReales: z.number().min(0),
    piezasProducidas: z.number().min(0),
    promGolpesHora: z.number().min(0),
    idMatriz: z.number().min(1),
  })
);

export const schemaPutProduccion = z.object({
  fecha: z.string().optional().nullable(),
  numMaquina: z.number().min(0).optional().nullable(),
  golpesReales: z.number().min(0).optional().nullable(),
  piezasProducidas: z.number().min(0).optional().nullable(),
  promGolpesHora: z.number().min(0).optional().nullable(),
  idMatriz: z.number().min(1).optional().nullable(),
});
