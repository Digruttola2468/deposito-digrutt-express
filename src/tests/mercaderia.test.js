import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

const idInventario = 525;

//npx mocha src/tests/mercaderia.test.js
describe("** TESTING MERCADERIA **", () => {
  const updateMercaderia = {
    fecha: "2024-12-07",
    stock: 30,
  };
  let token = "";
  let valueEntrada = null;
  let valueSalida = null;

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    const resultCookie = result.headers["set-cookie"][0]
    token = resultCookie.split("=")[1].split(";")[0];
  });

  describe("CRUD /api/mercaderia", () => {
    it("Method: POST ENTRADA", async () => {
      const result = await requester
        .post(`/api/mercaderia`)
        .send({
          fecha: "2024-01-01",
          stock: 50,
          idcategoria: "2",
          idinventario: idInventario,
        })
        .set("Cookie", [`access_token=${token}`]);

      valueEntrada = result._body.data;
      expect(result.ok).to.be.ok;
    });
    it("Method: POST SALIDA", async () => {
      const result = await requester
        .post(`/api/mercaderia/salida`)
        .send({
          fecha: "2024-01-01",
          stock: 36,
          idinventario: idInventario,
          observacion: "Prueba de salida",
        })
        .set("Cookie", [`access_token=${token}`]);
      valueSalida = result._body.data;
      expect(result.ok).to.be.ok;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/mercaderia/${valueEntrada.id}`)
        .send(updateMercaderia)
        .set("Cookie", [`access_token=${token}`]);
      expect(result.ok).to.be.ok;
    });
    it("Method: GET ONE", async () => {
      const result = await requester
        .get(`/api/mercaderia/${valueEntrada.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE ENTRADA", async () => {
      const result = await requester
        .delete(`/api/mercaderia/${valueEntrada.id}`)
        .set("Cookie", [`access_token=${token}`]);
      expect(result.ok).to.be.ok;
    });
    it("Method: DELETE SALIDA", async () => {
      const result = await requester
        .delete(`/api/mercaderia/${valueSalida.id}`)
        .set("Cookie", [`access_token=${token}`]);
      expect(result.ok).to.be.ok;
    });
  });

});
