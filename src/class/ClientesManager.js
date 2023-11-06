import { con } from "../db.js";

export default class ClientesManager {
  constructor() {
    this.listClientes = [];
  }

  async emptyListClientes() {
    if (this.listClientes.length == 0) await this.getAllClientes();
  }

  async getAllClientes() {
    if (this.listClientes.length == 0) {
      try {
        const [rows] = await con.query("SELECT * FROM clientes;");
        this.listClientes = rows;
        return { data: rows };
      } catch (e) {
        console.error(e);
        return { error: { message: "Something wrong" } };
      }
    }else return { data: this.listClientes };
  }

  getListCliente() {
    return this.listClientes;
  }

  getOneCliente(idCliente) {
    if (this.listClientes.length != 0) {
      const findClienteById = this.listClientes.find(
        (elem) => elem.id == idCliente
      );
      return { data: findClienteById };
    } else return { error: { message: "Lista Clientes Vacia" } };
  }

  getLengthList() {
    if (this.listClientes.length != 0) return this.listClientes.length;
    else return -1;
  }

  async createCliente(object) {
    await this.emptyListClientes();
    let lenghtCliente = this.getLengthList();

    if (lenghtCliente != -1) {
      const id = lenghtCliente + 1;
      try {
        const { codigo, cliente, domicilio, idLocalidad, mail, cuit } = object;

        if (cliente == null)
          return { error: { message: "Campo Cliente Vacio" } };

        if (codigo == null) return { error: { message: "Campo Codigo Vacio" } };

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
          [id, codigo, cliente, domicilio, idLocalidad, mail, cuit]
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
    }
  }

  async updateCliente(idClientes, object) {
    await this.emptyListClientes();
    try {
      const { cliente, codigo, domicilio, localidad, mail, cuit } = object;

      //Validar si el codigo o el cliente son los mismos
      if (codigo != null) {
        const repeatSameCodigo = this.listClientes.find(
          (elem) => elem.codigo.toLowerCase() == codigo.toLowerCase()
        );
        if (repeatSameCodigo != null)
          return { error: { message: "Ya existe ese Codigo" } };
      }
      if (cliente != null) {
        const repeatSameCliente = this.listClientes.find(
          (elem) => elem.cliente.toLowerCase() == cliente.toLowerCase()
        );

        if (repeatSameCliente != null)
          return { error: { message: "Ya existe ese Cliente" } };
      }

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
    await this.emptyListClientes();
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
