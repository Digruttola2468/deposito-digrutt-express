import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/envios.test.js
describe("** TESTING ENVIOS /api/envios **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let envio = null;
    const newEnvio = {
      idVehiculo: "1",
      ubicacion: "fsafsaf",
      idLocalidad: "5",
      lat: "60",
      lon: "60",
    };
    const updateEnvio = {
      idVehiculo: "2",
      ubicacion: "AV. Arijon",
      idLocalidad: "1",
      lat: "20",
      lon: "10",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/envios")
        .send(newEnvio)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      envio = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/envios/${envio.id}`)
        .send(updateEnvio)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/envios/${envio.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/envios/${envio.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });
  });
});