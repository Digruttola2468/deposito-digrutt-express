//historialFechaPedidos
import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/historialFechaPedidos.test.js
describe("** TESTING HISTORIAL FECHAS PEDIDOS /api/historialFechaPedidos **", () => {
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
    let historial = null;
    const newHistorial = {
      idPedido: "27",
      cantidad_enviada: "144",
      stringDate: "2024-02-15"
    };
    const updateHistorial = {
      idPedido: "27",
      cantidad_enviada: "518",
      stringDate: "2024-02-20"
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/historialFechaPedidos")
        .send(newHistorial)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      historial = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/historialFechaPedidos/${historial.id}`)
        .send(updateHistorial)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/historialFechaPedidos/${historial.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/historialFechaPedidos/${historial.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
    });
  });
});
