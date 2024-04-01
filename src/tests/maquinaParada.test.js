import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/maquinaParada.test.js
describe("** TESTING MAQUINA PARADA /api/maquinaParada **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let maquinaParada = null;
    const newMaquinaParada = {
      idMotivoMaquinaParada: "1",
      hrs: "41",
      idMaquina: "1",
      fecha: "2023-12-22",
    };
    const updateMaquinaParada = {
      idMotivoMaquinaParada: "2",
      hrs: "14",
      idMaquina: "3",
      fecha: "2024-01-22",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/maquinaParada")
        .send(newMaquinaParada)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      maquinaParada = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/maquinaParada/${maquinaParada.id}`)
        .send(updateMaquinaParada)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/maquinaParada/${maquinaParada.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/maquinaParada/${maquinaParada.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
