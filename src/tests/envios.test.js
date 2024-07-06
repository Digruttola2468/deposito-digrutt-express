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
    const resultCookie = result.headers["set-cookie"][0]
    token = resultCookie.split("=")[1].split(";")[0];
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
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
      envio = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/envios/${envio.id}`)
        .send(updateEnvio)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/envios/${envio.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/envios/${envio.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });
  });
});
