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
    const resultCookie = result.headers["set-cookie"][0]
    token = resultCookie.split("=")[1].split(";")[0];
  });

  describe("CRUD", () => {
    let cliente = null;
    const newCliente = {
      cliente: "nose",
      idLocalidad: 1,
    };
    const updateCliente = {
      cliente: "pepito",
      domicilio: "casa arijon 2012",
      idLocalidad: 2,
      mail: "prueba@gmail.com",
      cuit: "295487819758",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/clientes")
        .send(newCliente)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(newCliente);
      expect(result.body.status).to.include("success");

      cliente = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/clientes/${cliente.id}`)
        .send(updateCliente)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(updateCliente);
      expect(result.body.status).to.include("success");
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/clientes/${cliente.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(updateCliente);
      expect(result.body.status).to.include("success");
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/clientes/${cliente.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });
  });
});
