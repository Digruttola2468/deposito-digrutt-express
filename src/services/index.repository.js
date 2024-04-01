import {
  Mercaderia,
  Inventario,
  Users,
  Remitos,
  NotasEnvio,
  Clientes,
  Envios,
  MaquinaParada,
} from "../DAO/factory.js";

// MODULE GMAIL
import moduleGmail from "../mail.module.js";

import MercaderiaRepository from "./mercaderia.repository.js";
import InventarioRepository from "./inventario.repository.js";
import UsersRepository from "./users.repository.js";
import RemitosRepository from "./remitos.repository.js";
import NotaEnvioRepository from "./notaEnvio.repository.js";
import ClientesRepository from "./clientes.repository.js";
import EnviosRepository from "./envios.repository.js";
import MaquinaParadaRepository from "./maquinaParada.repository.js";

export const clienteServer = new ClientesRepository(new Clientes());
export const envioServer = new EnviosRepository(new Envios());
export const maquinaParadaServer = new MaquinaParadaRepository(
  new MaquinaParada()
);

export const mercaderiaServer = new MercaderiaRepository(
  new Mercaderia(),
  new Inventario()
);
export const inventarioServer = new InventarioRepository(
  new Inventario(),
  new Mercaderia()
);
export const userServer = new UsersRepository(new Users(), new moduleGmail());
export const remitoServer = new RemitosRepository(
  new Remitos(),
  new Mercaderia()
);
export const notaEnvioServer = new NotaEnvioRepository(
  new NotasEnvio(),
  new Mercaderia()
);
