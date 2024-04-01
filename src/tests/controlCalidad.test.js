import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/controlCalidad.test.js
describe("** TESTING CONTROL CALIDAD /api/controlCalidad **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let controlCalidad = null;
    const newControlCalidad = {
      fecha: "2024-01-02",
      idinventario: 525,
      critica:
        "La pieza posee manchas en la parte superior del mismo a las esquinas",
      idcliente: 1,
      stockMal: 205,
    };
    const updateControlCalidad = {
      fecha: "2024-01-10",
      idinventario: 526,
      critica: "Falta terminacion ya q no posee agujeros",
      idcliente: 2,
      stockMal: 100,
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/controlCalidad")
        .send(newControlCalidad)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      controlCalidad = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/controlCalidad/${controlCalidad.id}`)
        .send(updateControlCalidad)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/controlCalidad/${controlCalidad.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/controlCalidad/${controlCalidad.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});
