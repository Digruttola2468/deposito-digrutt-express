const permissos = {
  admin: "admin",
  oficina: "oficina",
  mercaderia: "mercaderia",
  matriceria: "matriceria",
  produccion: "produccion",
  inyectora: "inyected",
  empleado: "employed",
  envios: "envios",
  goOut: "user",
};

export const inventarioPermissions = [
  permissos.oficina,
  permissos.mercaderia,
  permissos.matriceria,
  permissos.produccion,
];

export const administracionPermissions = [
  permissos.admin,
  permissos.oficina,
  permissos.empleado,
];

export const matriceriaPermissions = [permissos.admin, permissos.matriceria];

export const mercaderiaPermissions = [permissos.admin, permissos.mercaderia];

export const produccionPermissions = [
  permissos.admin,
  permissos.produccion,
  permissos.matriceria,
];

export default permissos;
