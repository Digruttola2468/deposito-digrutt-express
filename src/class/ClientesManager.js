import { con } from "../config/db.js";

export default class ClientesManager {
  constructor() {
    this.listClientes = [];
  }

  async getClientes() {
    try {
      const [rows] = await con.query(
        "SELECT *,clientes.id FROM clientes LEFT JOIN localidad ON clientes.localidad = localidad.id;"
      );
      this.listClientes = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getLenghtClientes() {
    return this.listClientes.length;
  }

  getOneCliente(idCliente) {
    if (this.listClientes.length != 0) {
      const findClienteById = this.listClientes.find(
        (elem) => elem.id == idCliente
      );
      return { data: findClienteById };
    } else return { error: { message: "Lista Clientes Vacia" } };
  }

  existsIdCliente(idCliente) {
    if (this.listClientes.length != 0) {
      const findByIdCliente = this.listClientes.find(
        (elem) => elem.id == idCliente
      );
      if (findByIdCliente) return true;
      else return false;
    } else return null;
  }

  async createCliente(object) {
    let lenghtCliente = this.getLenghtClientes();

    if (lenghtCliente != 0) {
      const id = lenghtCliente + 1;
      try {
        const { codigo, cliente, domicilio, idLocalidad, mail, cuit } = object;

        if (cliente == null || cliente == "")
          return { error: { message: "Campo Cliente Vacio" } };

        if (codigo == null || codigo == "")
          return { error: { message: "Campo Codigo Vacio" } };

        if (codigo.length != 3)
          return { error: { message: "El Codigo tiene que ser de 3 Digitos" } };

        //Validar si el codigo o el cliente son los mismos
        const repeatSameCliente = this.listClientes.find(
          (elem) => elem.cliente.toLowerCase() == cliente.toLowerCase()
        );

        const repeatSameCodigo = this.listClientes.find(
          (elem) => elem.codigo.toLowerCase() == codigo.toLowerCase()
        );

        if (repeatSameCliente != null)
          return { error: { message: "Ya existe ese Cliente" } };

        if (repeatSameCodigo != null)
          return { error: { message: "Ya existe ese Codigo" } };

        const [rows] = await con.query(
          "INSERT INTO clientes (id,codigo,cliente,domicilio,localidad,mail,cuit) VALUES (?,?,?,?,?,?,?) ;",
          [
            id,
            codigo.toUpperCase(),
            cliente,
            domicilio,
            idLocalidad,
            mail,
            cuit,
          ]
        );

        //add object at listClientes
        this.listClientes.push({
          id,
          codigo,
          cliente,
          domicilio,
          idLocalidad,
          mail,
          cuit,
        });

        return {
          data: {
            id,
            codigo,
            cliente,
            domicilio,
            idLocalidad,
            mail,
            cuit,
          },
        };
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    } else return { error: { message: "Something wrong" } };
  }

  async updateCliente(idClientes, object) {
    try {
      let { cliente, domicilio, localidad, mail, cuit } = object;

      if (cliente != null || cliente == "") {
        const findClienteById = this.listClientes.find(
          (elem) => elem.id == idClientes
        );
        //Validar q no se repita el cod.Producto
        const repeatSameCliente = this.listClientes.find(
          (elem) => elem.cliente.toLowerCase() == cliente.toLowerCase()
        );
        //Validamos si existe ese nombre
        if (repeatSameCliente) {
          //Si existe, validar si es igual que el anterior
          if (repeatSameCliente.cliente != findClienteById.cliente)
            return { error: { message: "Ya existe ese Cod.Producto" } };
        }

        if (repeatSameCliente)
          return { error: { message: "Ya existe ese Cliente" } };
      }

      //Establecer a los string "" como nulos
      if (domicilio == "") domicilio = null;
      if (localidad == "") localidad = null;
      if (mail == "") mail = null;
      if (cuit == "") cuit = null;

      const [result] = await con.query(
        `UPDATE clientes SET
              cliente = IFNULL(?,cliente),
              codigo = IFNULL(?,codigo),
              domicilio = IFNULL(?,domicilio),
              localidad = IFNULL(?,localidad),
              mail = IFNULL(?,mail),
              cuit = IFNULL(?,cuit)
          WHERE id = ?`,
        [cliente, codigo, domicilio, localidad, mail, cuit, idClientes]
      );

      if (result.affectedRows === 0)
        return { error: { message: "No se encontro el Cliente" } };

      const [rows] = await con.query("SELECT * FROM clientes WHERE id = ?", [
        idClientes,
      ]);

      //update ListClientes
      const mapListClientesUpdate = this.listClientes.map((elem) => {
        if (elem.id == idClientes) return { ...rows[0] };
        else return elem;
      });

      this.listClientes = mapListClientesUpdate;

      return { data: rows[0] };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  async deleteCliente(idCliente) {
    try {
      const [result] = await con.query(
        "DELETE FROM clientes WHERE (`id` = ?);",
        [idCliente]
      );

      if (result.affectedRows <= 0)
        return { error: { message: "No se encontro" } };

      //Delete from listCliente
      const filterListCliente = this.listClientes.filter(
        (elem) => elem.id != idCliente
      );
      this.listClientes = filterListCliente;

      return { data: { message: "Se elimino Correctamente" } };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }
}
