import {
  Mercaderia,
  Inventario,
  Users,
  Remitos,
  NotasEnvio,
} from "../DAO/factory.js";
import MercaderiaRepository from "./mercaderia.repository.js";
import InventarioRepository from "./inventario.repository.js";
import UsersRepository from "./users.repository.js";
import RemitosRepository from "./remitos.repository.js";
import NotaEnvioRepository from "./notaEnvio.repository.js";

// MODULE GMAIL
import moduleGmail from '../mail.module.js'

export const mercaderiaServer = new MercaderiaRepository(new Mercaderia());
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
