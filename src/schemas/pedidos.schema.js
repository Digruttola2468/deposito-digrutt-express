import { z } from "zod";

export const schemaPostPedidos = z.object({
    idinventario: z.number().min(1),
    idcliente: z.number().min(1),
    cantidadEnviar: z.number().min(1),
    fecha_entrega: z.string(),
    ordenCompra: z.string().optional().nullable(),
});

export const schemaPostListPedidos = z.array(z.object({
    idinventario: z.number().min(1),
    idcliente: z.number().min(1),
    cantidadEnviar: z.number().min(1),
    fecha_entrega: z.string(),
    ordenCompra: z.string().optional().nullable(),
}));

export const schemaPutPedidos = z.object({
    idinventario: z.number().min(1).optional().nullable(),
    idcliente: z.number().min(1).optional().nullable(),
    cantidadEnviar: z.number().min(1).optional().nullable(),
    fecha_entrega: z.string().optional().nullable(),
    ordenCompra: z.string().optional().nullable(),
    cantidadEnviada: z.number().optional().nullable(),
});

export const schemaPutPedidosDone = z.object({
    isDone: z.boolean()
});