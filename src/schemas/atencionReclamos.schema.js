import { z } from "zod";

export const schemaPostReclamos = z.object({
    fecha: z.date(),
    idCliente: z.number(),
    descripcion: z.string().min(0),
    analisisCausa: z.string().optional(),
    observaciones: z.string().optional(),
    fechaCierre: z.date().optional(),
    idInventario: z.number().optional(),
});

export const schemaPutReclamos = z.object({
    fecha: z.date().optional(),
    idCliente: z.number().optional(),
    descripcion: z.string().min(0).optional(),
    analisisCausa: z.string().optional(),
    observaciones: z.string().optional(),
    fechaCierre: z.date().optional(),
    idInventario: z.number().optional(),
});
