import { con } from "../config/db.js";
import CustomError from "../errors/Custom_errors.js";
import { ENUM_ERRORS } from "../errors/enums.js";

export default class ClientesManager {
  constructor() {
    this.listClientes = [];
  }

  async getClientes() {
    try {
      const [rows] = await con.query(
        "SELECT *,clientes.id FROM clientes LEFT JOIN localidad ON clientes.idLocalidad = localidad.id;"
        //"SHOW CREATE TABLE clientes"
        //"ALTER TABLE remitos ADD CONSTRAINT fk_idcliente FOREIGN KEY (idCliente) REFERENCES clientes (id);"
        //"ALTER TABLE controlCalidad DROP KEY id_2"
        //"ALTER TABLE clientes MODIFY COLUMN cliente VARCHAR(30) UNIQUE"
      );
      //console.log(rows);
      this.listClientes = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getOneCliente(idCliente) {
    if (this.listClientes.length != 0) {
      const findClienteById = this.listClientes.find(
        (elem) => elem.id == idCliente
      );
      return { data: findClienteById };
    } else return { error: { message: "Lista Clientes Vacia" } };
  }

  handleErrors(e) {
    switch (e.code) {
      case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
        if (e.sqlMessage.includes("idLocalidad")) {
          CustomError.createError({
            name: "idLocalidad",
            cause: "Error tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          });
        }
        break;
      case "WARN_DATA_TRUNCATED":
        if (e.sqlMessage.includes("idLocalidad")) {
          CustomError.createError({
            name: "idLocalidad",
            cause: "Error tipo de dato",
            message: "Error tipo de dato",
            code: ENUM_ERRORS.INVALID_TYPES_ERROR,
          });
        }
        break;
      case "ER_NO_REFERENCED_ROW_2":
        if (e.sqlMessage.includes("idLocalidad")) {
          CustomError.createError({
            name: "idLocalidad",
            cause: "BBDD: No existe esa localidad",
            message: "No existe esa localidad",
            code: ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS,
          });
        }
        break;
      case "ER_DUP_ENTRY":
        if (e.sqlMessage.includes("cliente"))
          CustomError.createError({
            cause: "Ya existe ese Cliente",
            message: "Error al intentar crear cliente",
            code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
            name: "cliente",
          });
        if (e.sqlMessage.includes("codigo"))
          CustomError.createError({
            cause: "Ya existe ese Codigo",
            message: "Error al intentar crear cliente",
            code: ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS,
            name: "codigo",
          });
        break;
      default:
        throw e;
    }
  }

  async createCliente(object) {
    try {
      const { cliente, domicilio, idLocalidad, mail, cuit } = object;

      if (cliente == null || cliente == "")
        CustomError.createError({
          name: "cliente",
          cause: "Cliente: esta vacio",
          message: "Campo Cliente Vacio",
          code: ENUM_ERRORS.INVALID_TYPES_ERROR,
        });

      const [rows] = await con.query(
        "INSERT INTO clientes (cliente,domicilio,idLocalidad,mail,cuit) VALUES (?,?,?,?,?) ;",
        [cliente.trim(), domicilio, idLocalidad, mail, cuit]
      );

      //add object at listClientes
      this.listClientes.push({
        id: rows.insertId,
        cliente,
        domicilio,
        idLocalidad,
        mail,
        cuit,
      });

      return {
        status: "success",
        data: {
          id: rows.insertId,
          cliente,
          domicilio,
          idLocalidad,
          mail,
          cuit,
        },
      };
    } catch (e) {
      this.handleErrors(e);
    }
  }

  async updateCliente(idClientes, object) {
    let { cliente, domicilio, localidad, mail, cuit } = object;

    //Establecer a los string "" como NULL
    if (cliente == "") cliente = null;
    if (domicilio == "") domicilio = null;
    if (localidad == "") localidad = null;
    if (mail == "") mail = null;
    if (cuit == "") cuit = null;

    //
    try {
      const [result] = await con.query(
        `UPDATE clientes SET
              cliente = IFNULL(IF(STRCMP(cliente, ?) = 0, cliente, ?), cliente),
              domicilio = IFNULL(?,domicilio),
              idLocalidad = IFNULL(?,idLocalidad),
              mail = IFNULL(?,mail),
              cuit = IFNULL(?,cuit)
          WHERE id = ?`,
        [cliente, cliente, domicilio, localidad, mail, cuit, idClientes]
      );

      if (result.affectedRows === 0)
        CustomError.createError({
          name: "idCliente",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          cause: "No existe ese cliente",
          message: "No existe ese cliente",
        });

      const [rows] = await con.query("SELECT * FROM clientes WHERE id = ?", [
        idClientes,
      ]);

      //update ListClientes
      const mapListClientesUpdate = this.listClientes.map((elem) => {
        if (elem.id == idClientes) return { ...rows[0] };
        else return elem;
      });

      this.listClientes = mapListClientesUpdate;

      return { status: "success", data: rows[0] };
    } catch (e) {
      console.log(e);
      this.handleErrors(e);
    }
  }

  async deleteCliente(idCliente) {
    try {
      const [result] = await con.query(
        "DELETE FROM clientes WHERE (`id` = ?);",
        [idCliente]
      );

      if (result.affectedRows <= 0)
        CustomError.createError({
          name: "idCliente",
          code: ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS,
          cause: "No existe ese cliente",
          message: "No existe ese cliente",
        });

      //Delete from listCliente
      const filterListCliente = this.listClientes.filter(
        (elem) => elem.id != idCliente
      );
      this.listClientes = filterListCliente;

      return { message: "Se elimino Correctamente", status: "success" };
    } catch (e) {
      console.error(e);
      this.handleErrors(e);
    }
  }
}
