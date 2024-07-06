import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/pedidos.test.js
describe("** TESTING PEDIDOS /api/pedidos **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    const resultCookie = result.headers["set-cookie"][0]
    token = resultCookie.split("=")[1].split(";")[0];
  });

  describe("CRUD", () => {
    let inventario = null;
    let pedido = null;
    let newPedido = {
      idcliente: "1",
      cantidadEnviar: "1232",
      fecha_entrega: "2024-01-20",
      ordenCompra: "",
    };
    const updatePedido = {
      idinventario: "10",
      idcliente: "5",
      cantidadEnviar: "1550",
      fecha_entrega: "2024-01-30",
      ordenCompra: "OC 7030",
    };

    it("Method: POST INVENTARIO", async () => {
      const newInventario = {
        nombre: "prueba0108",
        descripcion: "Esto es una prueba testing",
        pesoUnidad: 10,
        stockCaja: 200,
        idCliente: 1,
      };
      const result = await requester
        .post("/api/inventario")
        .send(newInventario)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      inventario = result._body.data;
      newPedido = {
        ...newPedido,
        idinventario: inventario.id,
      };
    });

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/pedidos")
        .send(newPedido)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data.is_done).to.eq(0);
      expect(result.body.status).to.include("success");

      pedido = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/pedidos/${pedido.id}`)
        .send(updatePedido)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data.is_done).to.eq(0);
      expect(result.body.status).to.include("success");

      pedido = result._body.data;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/pedidos/${pedido.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data.is_done).to.eq(0);
      expect(result.body.status).to.include("success");
    });

    it("Method: UPDATE DONE PEDIDO", async () => {
      const result = await requester
        .put(`/api/pedidos/${pedido.id}/doneStock`)
        .send({ isDone: 1 })
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data.is_done).to.eq(1);
      expect(result.body.status).to.include("success");

      pedido = result._body.data;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/pedidos/${pedido.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data.is_done).to.eq(1);
      expect(result.body.status).to.include("success");
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/pedidos/${pedido.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });

    it("DELETE /api/inventario/:iid", async () => {
      const result = await requester
        .delete(`/api/inventario/${inventario.id}`)
        .set("Cookie", [`access_token=${token}`]);
      expect(result.ok).to.be.ok;
    });
  });
});
