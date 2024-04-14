import { z } from "zod";

export const schemaPostCliente = z.object({
  cliente: z.string().min(1),
  domicilio: z.string().optional().nullable(),
  idLocalidad: z.number().min(0).optional().nullable(),
  mail: z.string().email().optional().nullable(),
  cuit: z.string().optional().nullable(),
});

export const schemaPutCliente = z.object({
  cliente: z.string().min(1).optional().nullable(),
  domicilio: z.string().optional().nullable(),
  idLocalidad: z.number().min(0).optional().nullable(),
  mail: z.string().email().optional().nullable(),
  cuit: z.string().optional().nullable(),
});
