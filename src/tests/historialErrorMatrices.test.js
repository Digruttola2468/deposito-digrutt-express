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
      idMatriz: 2,
      descripcion_deterioro: "sdfsdfs",
      idCategoria: 3,
    };
    const updateHistorial = {
      stringDate: "2024/04/15",
      descripcion_deterioro: "esta es una prueba noma",
      idCategoria: 4,
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/historialMatriz")
        .send(newHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");

      historial = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/historialMatriz/${historial.id}`)
        .send(updateHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");

      historial = result._body.data;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(historial);
      expect(result.body.data.isSolved).to.eq(0);
      expect(result.body.data.fechaTerminado).to.be.null;
      expect(result.body.status).to.include("success");
    });

    it("Method: UPDATE SOLVED TRUE", async () => {
      const result = await requester
        .put(`/api/historialMatriz/${historial.id}/1`)
        .send(updateHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");

      historial = result._body.data;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(historial);
      expect(result.body.data.isSolved).to.eq(1);
      expect(result.body.data.fechaTerminado).to.not.null;
      expect(result.body.status).to.include("success");
    });

    it("Method: UPDATE SOLVED FALSE", async () => {
      const result = await requester
        .put(`/api/historialMatriz/${historial.id}/0`)
        .send(updateHistorial)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");

      historial = result._body.data;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(historial);
      expect(result.body.data.isSolved).to.eq(0);
      expect(result.body.data.fechaTerminado).to.be.null;
      expect(result.body.status).to.include("success");
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/historialMatriz/${historial.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });
  });
});
