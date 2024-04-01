import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/produccion.test.js
describe("** TESTING PRODUCCION /api/producion **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let produccion = null;
    const newProduccion = {
      numMaquina: "1",
      fecha: "2023-12-27",
      idInventario: 525,
      golpesReales: "50",
      piezasProducidas: "541",
      promGolpesHora: 14,
    };
    const updateProduccion = {
      numMaquina: "2",
      fecha: "2023-12-30",
      golpesReales: "168",
      piezasProducidas: "168",
      promGolpesHora: 50,
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/producion")
        .send(newProduccion)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      produccion = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/producion/${produccion.id}`)
        .send(updateProduccion)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/producion/${produccion.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/producion/${produccion.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
