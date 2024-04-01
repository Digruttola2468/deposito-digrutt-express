import { PERSISTENCE } from "../config/dotenv.js";

export let Users;
export let Clientes;
export let Envios;
export let NotasEnvio;
export let Inventario;
export let MaquinaParada;
export let Matrices;
export let Mercaderia;
export let Pedidos;
export let Produccion;
export let Remitos;

export let RelacionMatrizMaquina;
export let HistorialErrorsMatriz;
export let HistorialFechasPedidos;

switch (PERSISTENCE) {
  case "MySQL":
    const { default: ClientesMySql } = await import(
      "./mySql/clientes.mysql.js"
    );
    const { default: EnviosMysql } = await import("./mySql/envios.mysql.js");
    const { default: InventarioMysql } = await import(
      "./mySql/inventario.mysql.js"
    );
    const { default: MaquinaParadaMysql } = await import(
      "./mySql/maquinaParada.mysql.js"
    );
    const { default: MatricesMysql } = await import(
      "./mySql/matrices.mysql.js"
    );
    const { default: MercaderiaMysql } = await import(
      "./mySql/mercaderia.mysql.js"
    );
    const { default: NotasEnviosMysql } = await import(
      "./mySql/notaEnvios.mysql.js"
    );
    const { default: PedidosMysql } = await import("./mySql/pedidos.mysql.js");
    const { default: ProduccionMysql } = await import(
      "./mySql/produccion.mysql.js"
    );
    const { default: RemitoMysql } = await import("./mySql/remitos.mysql.js");
    const { default: UsersMysql } = await import("./mySql/users.mysql.js");

    Users = UsersMysql;
    Clientes = ClientesMySql;
    Envios = EnviosMysql;
    NotasEnvio = NotasEnviosMysql;
    Inventario = InventarioMysql;
    MaquinaParada = MaquinaParadaMysql;
    Matrices = MatricesMysql;
    Mercaderia = MercaderiaMysql;
    Pedidos = PedidosMysql;
    Produccion = ProduccionMysql;
    Remitos = RemitoMysql;

    break;

  default:
    throw new Error("Persistencie is not configured !!");
}
