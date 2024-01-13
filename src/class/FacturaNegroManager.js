import { con } from "../config/db.js";
import { mercaderiaManager } from "../index.js";

export default class FacturaNegroManager {
  constructor() {
    this.listFacturaNegro = [];
  }

  getNroEnvio() {
    if (this.listFacturaNegro.length != 0) {
      const last = this.listFacturaNegro[this.listFacturaNegro.length - 1];
      const nroEnvio = parseInt(last.nro_envio);
      const numeroUnico = nroEnvio + 1;
      return numeroUnico;
    } else return -1;
  }

  async getFacturaNegro() {
    try {
      const [rows] = await con.query(
        `SELECT *, idCliente AS idcliente FROM facturaNegro 
        LEFT JOIN clientes on facturaNegro.idCliente = clientes.id
        ORDER BY fecha DESC`);
      this.listFacturaNegro = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOne(idFacturaNegro) {
    if (this.listFacturaNegro.length != 0) {
      const findByIdNotaEnvio = this.listFacturaNegro.find(
        (elem) => elem.id == idFacturaNegro
      );
      return { data: findByIdNotaEnvio };
    }else return { error: { message: "List Nota Envio Vacio" } };
  }

  getOneNotaEnvio(idFacturaNegro) {
    const listMercaderiaByIdFacturaNegro =
      mercaderiaManager.getMercaderiaByIdFacturaNegro(idFacturaNegro);
    const findByIdFacturaNegro = this.listFacturaNegro.filter(
      (elem) => elem.id == idFacturaNegro
    );
    if (findByIdFacturaNegro) {
      if (listMercaderiaByIdFacturaNegro.length != 0) {
        return {
          notaEnvio: findByIdFacturaNegro[0],
          mercaderia: listMercaderiaByIdFacturaNegro,
        };
      } else return { error: { message: "No se encontro en la mercaderia" } };
    } else return { error: { message: "No se encontro la nota envio" } };
  }

  async createFacturaNegro(object) {
    const { fecha, nro_envio, products, idCliente, valorDeclarado } = object;

    //Validacion de campos
    if (fecha == null || fecha == "")
      return { error: { message: "Campo Fecha Vacio" } };

    if (nro_envio == null || nro_envio == "")
      return { error: { message: "El Campo Nro Envio esta Vacio" } };

    if (idCliente == null || idCliente == 0 || idCliente == "")
      return { error: { message: "El Campo Cliente esta Vacio" } };

    if (products == null || products.length == 0)
      return {
        error: { message: "El Campo Lista de Productos esta vacia" },
      };
    if (!Array.isArray(products))
      return {
        error: { message: "El Campo Lista de Productos no es un array" },
      };

    //Validamos que sea de tipo Integer
    const nroEnvioInt = parseInt(nro_envio);
    if (!Number.isInteger(nroEnvioInt))
      return { error: { message: "El Campo Nro Envio no es un numero" } };

    const clienteInteger = parseInt(idCliente);
    if (!Number.isInteger(clienteInteger))
      return { error: { message: "Something wrong" } };

    //Validar si el nro_envio no se repita
    const repeatSameNroFacturaNegro = this.listFacturaNegro.find(
      (elem) => elem.nro_envio == nroEnvioInt
    );
    if (repeatSameNroFacturaNegro != null)
      return { error: { message: "Ya existe ese N° Envio" } };

    const fechaDate = new Date(fecha);

    if (Number.isNaN(fechaDate.getDate()))
      return { error: { message: "Error en el formato de la Fecha" } };

    let valorTotal = 0;
    if (valorDeclarado != null) {
      const valorFloat = parseFloat(valorDeclarado);
      if (!Number.isInteger(valorFloat))
        return {
          error: { message: "El campo Valor Declarado no es numerico" },
        };

      valorTotal = valorFloat;
    }

    let idFacturaNegro = null;
    try {
      const [rows] = await con.query(
        "INSERT INTO facturaNegro (`nro_envio`,`idCliente`,`valorDeclarado`,`fecha`) VALUES (?,?,?,?);",
        [nroEnvioInt, clienteInteger, valorTotal, fecha]
      );
      idFacturaNegro = rows.insertId;

      //Agregar todos los products como salida
      try {
        if (idFacturaNegro != null) {
          //verificamos si el array esta vacia
          if (products.length > 0) {
            for (let i = 0; i < products.length; i++) {
              const element = products[i];

              const enviar = {
                fecha: fecha,
                stock: element.stock,
                idinventario: element.idProduct,
                idcategoria: 1,
                idFacturaNegro: idFacturaNegro,
              };
              const { error } = await mercaderiaManager.createMercaderia(
                enviar
              );

              if (error != null)
                return {
                  error: { message: "Ocurrio un error en agregar mercaderia" },
                };
            }

            this.listFacturaNegro.push({
              id: idFacturaNegro,
              nro_envio: parseInt(nro_envio),
              idCliente: idCliente,
              valorDeclarado: valorTotal,
              fecha: fecha,
            });

            return {
              data: {
                message: "La operacion se realizo Correctamente",
                insertId: idFacturaNegro,
              },
            };
          }
        }
      } catch (e) {
        console.error(e);
        return {
          error: { message: "Ocurrio un error al agregar a mercaderia" },
        };
      }
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }
}
