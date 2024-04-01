import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/notaEnvios.test.js
describe("** TESTING NOTA ENVIO **", () => {
  let token = "";
  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD /api/notaEnvio", () => {
    let notaEnvio = null;
    const mercaderiaOutput = {
      stock: 50,
      idProduct: 525,
    };
    const newNotaEnvio = {
      nro_envio: 500,
      idCliente: 1,
      valorTotal: 500,
      fecha: "2024-01-01",
      products: [mercaderiaOutput],
    };
    const updateNotaEnvio = {
      nro_envio: 512,
      idCliente: 2,
      fecha: "2024-01-02",
    };
    const addNewMercaderiaInNotaEnvio = {
      idInventario: 526,
      stock: 350,
      price: 50,
    };
    const updateNotaEnvioOnlyProducts = {
      products: [],
    };

    it("Method: POST", async () => {
      const result = await requester
        .post(`/api/notaEnvio`)
        .send(newNotaEnvio)
        .set("Authorization", `Bearer ${token}`);
      notaEnvio = result._body.data;
      expect(result.ok).to.be.ok;
    });
    it("Method: PUT", async () => {
      const result = await requester
        .put(`/api/notaEnvio/${notaEnvio.id}`)
        .send(updateNotaEnvio)
        .set("Authorization", `Bearer ${token}`);
      console.log("UPDATE: ", result._body);
      expect(result.ok).to.be.ok;
    });
    it("Method: GET ONE", async () => {
      const result = await requester
        .get(`/api/notaEnvio/${notaEnvio.id}`)
        .set("Authorization", `Bearer ${token}`);
      console.log("GET ONE: ", result._body);
      console.log("GET ONE: ", result._body.data.mercaderia);
      //
      updateNotaEnvioOnlyProducts.products.push({
        stock: 23,
        idMercaderia: result._body.data.mercaderia[0].id,
      });
      expect(result.ok).to.be.ok;
    });
    it("Method: PUT - NEW MERCADERIA", async () => {
      const result = await requester
        .put(`/api/notaEnvio/${notaEnvio.id}/newProduct`)
        .send(addNewMercaderiaInNotaEnvio)
        .set("Authorization", `Bearer ${token}`);
      console.log("UPDATE new Mercaderia: ", result._body);
      expect(result.ok).to.be.ok;
    });
    it("Method: UPDATE - MERCADERIA OUTPUT", async () => {
      const result = await requester
        .put(`/api/notaEnvio/${notaEnvio.id}`)
        .send(updateNotaEnvioOnlyProducts)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });
    it("Method: GET ONE", async () => {
      const result = await requester
        .get(`/api/notaEnvio/${notaEnvio.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });
    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/notaEnvio/${notaEnvio.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });
  });
});
