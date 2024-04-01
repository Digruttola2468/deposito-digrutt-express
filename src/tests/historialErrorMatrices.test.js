import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/historialErrorMatrices.test.js
describe("** TESTING HISTORIAL ERRORES/MANTENIMIENTO MATRICES /api/historialMatriz **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let historial = null;
    const newHistorial = {
      idMatriz: "2",
      descripcion_deterioro: "sdfsdfs",
      idCategoria: "3",
    };
    const updateHistorial = {
      idMatriz: "2",
      descripcion_deterioro: "esta es una prueba noma",
      idCategoria: "4",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/historialMatriz")
        .send(newHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      historial = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/historialMatriz/${historial.id}`)
        .send(updateHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
