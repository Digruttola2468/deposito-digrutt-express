import { con } from "../db.js";
import InventarioManager from "./InventarioManager.js";

const inventarioManager = new InventarioManager();

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

  async getAllListFacturaNegro() {
    if (this.listFacturaNegro.length == 0) {
      try {
        const [rows] = await con.query("SELECT * FROM facturaNegro;");
        this.listFacturaNegro = rows;
        return { data: rows };
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    } else return { data: this.listFacturaNegro };
  }

  async getAllListFacturaNegroBBDD() {
    try {
      const [rows] = await con.query("SELECT * FROM facturaNegro;");
      this.listFacturaNegro = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
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

    if (products == null || products == "")
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

    //Validar si el nro_envio no se repita
    const repeatSameNroFacturaNegro = this.listFacturaNegro.find(
      (elem) => elem.nro_envio == nroEnvioInt
    );
    if (repeatSameNroFacturaNegro != null)
      return { error: { message: "Ya existe ese N° Envio" } };

    const fechaDate = new Date(fecha);

    let idFacturaNegro = null;
    try {
      const [rows] = await con.query(
        "INSERT INTO facturaNegro (`nro_envio`,`idCliente`,`valorDeclarado`) VALUES (?,?,?);",
        [parseInt(nro_envio), idCliente, parseFloat(valorDeclarado)]
      );
      idFacturaNegro = rows.insertId;

      this.listFacturaNegro.push({
        id: idFacturaNegro,
        nro_envio: parseInt(nro_envio),
        idCliente: idCliente,
        valorDeclarado: parseFloat(valorDeclarado)
      });

      //Agregar todos los products como salida
      try {
        if (idFacturaNegro != null) {
          //verificamos si el array esta vacia
          if (products.length > 0) {
            for (let i = 0; i < products.length; i++) {
              const element = products[i];

              //Agregar a mercaderia
              const [rows] = await con.query(
                "INSERT INTO mercaderia (`fecha`, `stock`, `idcategoria`, `idinventario`, `idFacturaNegro`) VALUES (?,?,?,?,?);",
                [fechaDate, element.stock, 1, element.idProduct, idFacturaNegro]
              );

              //Update Inventario
              const resultado = await inventarioManager.suminventario(element.idProduct);

              const [result] = await con.query(
                ` UPDATE inventario 
                  SET salida  = IFNULL(?,salida),
                      entrada = IFNULL(?,entrada)
                  WHERE id = ?
                `,
                [
                  parseInt(resultado[0].salida),
                  parseInt(resultado[0].entrada),
                  resultado[0].id,
                ]
              );
              if (result.affectedRows === 0)
                return { error: { message: "No se encontro el Inventario" } };
            }

            
            return {
              data: { message: "La operacion se realizo Correctamente" },
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
