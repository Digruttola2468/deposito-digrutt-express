import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/matrices.test.js
describe("** TESTING MATRICES /api/matrices **", () => {
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
    let matrices = null;
    let matrizUpdated = null;
    const newMatriz = {
      descripcion: "sdfsdf",
      idmaterial: "1",
      idcliente: "1",
      cantPiezaGolpe: "5",
      numero_matriz: "100",
    };
    const updateMatriz = {
      descripcion: "noseeee",
      idmaterial: "1",
      cantPiezaGolpe: "3",
      ubicacion: "A1",
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/matrices")
        .send(newMatriz)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(newMatriz);
      expect(result.body.status).to.include("success");

      matrices = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/matrices/${matrices.id}`)
        .send(updateMatriz)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");

      matrizUpdated = result.body.data
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/matrices/${matrices.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.data).to.include(matrizUpdated);
      expect(result.body.status).to.include("success");
    });

    it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/matrices/${matrices.id}`)
        .set("Cookie", [`access_token=${token}`]);

      expect(result.ok).to.be.ok;
      expect(result.body.status).to.include("success");
    });
  });
});
