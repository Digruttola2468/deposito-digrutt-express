import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/clientes.test.js
describe("** TESTING CLIENTES /api/clientes **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let cliente = null;
    const newCliente = {
      cliente: "prueba",
      domicilio: "prueba 010",
      idLocalidad: 1,
    };
    const updateCliente = {
      cliente: "pepito",
      domicilio: "casa arijon 2012",
      localidad: 2,
      mail: "prueba@gmail.com",
      cuit: "295487819758",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/clientes")
        .send(newCliente)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      cliente = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/clientes/${cliente.id}`)
        .send(updateCliente)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/clientes/${cliente.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/clientes/${cliente.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
