import Clientes from '../DAO/mysql/clientes.mysql.js'
import Inventario from "../DAO/mysql/inventario.mysql.js"
import Users from "../DAO/mysql/users.mysql.js"
import Remitos from "../DAO/mysql/remitos.mysql.js"
import NotasEnvio from "../DAO/mysql/notaEnvios.mysql.js"
import Envios from "../DAO/mysql/envios.mysql.js"
import MaquinaParada from "../DAO/mysql/maquinaParada.mysql.js"
import RelacionMaquinaMatriz from "../DAO/mysql/relacionMaquinaMatriz.mysql.js"
import HistorialFechasPedidos from "../DAO/mysql/historialFechasPedidos.mysql.js"
import Matrices from "../DAO/mysql/matrices.mysql.js"
import HistorialErrorsMatriz from "../DAO/mysql/historialErrorMatriz.mysql.js"
import atencionReclamos from "../DAO/mysql/atencion_reclamos.js"
import Produccion from "../DAO/mysql/produccion.mysql.js"
import Pedidos from "../DAO/mysql/pedidos.mysql.js"

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
import RelacionMatrizMaquinaRepository from "./relacionMaquinaMatriz.repository.js";
import HistorialFechasPedidosRepository from "./historialFechaPedidos.respository.js";
import MatricesRepository from "./matrices.repository.js";
import HistorialErrorMatrices from "./historialErrorMatrices.repository.js";
import ControlCalidadRepository from "./atencionReclamos.repository.js";
import ProduccionRepository from "./produccion.repository.js";
import PedidosRepository from "./pedidos.repository.js";

export const pedidoServer = new PedidosRepository(
  new Pedidos(),
  new HistorialFechasPedidos(),
  new Matrices()
);
export const clienteServer = new ClientesRepository(new Clientes());
export const envioServer = new EnviosRepository(new Envios());
export const maquinaParadaServer = new MaquinaParadaRepository(
  new MaquinaParada()
);
export const relacionMaqMatzServer = new RelacionMatrizMaquinaRepository(
  new RelacionMaquinaMatriz()
);
export const historialFechasPedidosServer =
  new HistorialFechasPedidosRepository(new HistorialFechasPedidos());
export const matriceServer = new MatricesRepository(
  new Matrices(),
  new Clientes()
);
export const produccionServer = new ProduccionRepository(new Produccion());
export const historialErroresMatrices = new HistorialErrorMatrices(
  new HistorialErrorsMatriz()
);
export const controlCalidadServer = new ControlCalidadRepository(
  new atencionReclamos()
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
