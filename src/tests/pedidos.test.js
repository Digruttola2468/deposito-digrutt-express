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
    token = result._body.token;
  });

  describe("CRUD", () => {
    let pedido = null;
    const newPedido = {
      idInventario: "525",
      idcliente: "1",
      cantidadEnviar: "1232",
      fecha_entrega: "2024-01-20",
      ordenCompra: "",
    };
    const updatePedido = {
      idInventario: "526",
      idcliente: "5",
      cantidadEnviar: "1550",
      fecha_entrega: "2024-01-30",
      ordenCompra: "OC 7030",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/pedidos")
        .send(newPedido)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      pedido = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/pedidos/${pedido.id}`)
        .send(updatePedido)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/pedidos/${pedido.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/pedidos/${pedido.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
