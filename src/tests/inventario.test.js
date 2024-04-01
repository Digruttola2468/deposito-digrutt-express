import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/inventario.test.js
describe("** TESTING INVENTARIO /api/inventario **", () => {
  let token = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    token = result._body.token;
  });

  describe("CRUD", () => {
    let inventario = null;
    const newInventario = {
      nombre: "prueba0108",
      descripcion: "Esto es una prueba testing",
      pesoUnidad: 10,
      stockCaja: 200,
      idCliente: 1,
    };
    const updateInventario = {
      nombre: "testing010",
      descripcion: "esto es para boludear",
      pesoUnidad: 3,
      stockCaja: 10,
      idCliente: 5,
    };

    it("Method: POST", async () => {
      const result = await requester
        .post("/api/inventario")
        .send(newInventario)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
      inventario = result._body.data;
    });

    it("Method: UPDATE", async () => {
      const result = await requester
        .put(`/api/inventario/${inventario.id}`)
        .send(updateInventario)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    it("Method: GET", async () => {
      const result = await requester
        .get(`/api/inventario/${inventario.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(result.ok).to.be.ok;
    });

    describe("POST /api/mercaderia", () => {
      const valores = { entrada: 1500, salida: 1137 };

      it("Input Mercaderia / sumar valor de entrada del inventario", async () => {
        const result = await requester
          .post(`/api/mercaderia`)
          .send({
            fecha: "2024-01-01",
            stock: valores.entrada,
            idcategoria: 2,
            idinventario: inventario.id,
          })
          .set("Authorization", `Bearer ${token}`);

        expect(result.ok).to.be.ok;
      });
      it("Output Mercaderia / sumar valor de salida del inventario", async () => {
        const result = await requester
          .post(`/api/mercaderia/salida`)
          .send({
            fecha: "2024-01-01",
            stock: valores.salida,
            idinventario: inventario.id,
            observacion: "Prueba de salida",
          })
          .set("Authorization", `Bearer ${token}`);

        expect(result.ok).to.be.ok;
      });
      it(`GET /api/inventario/:iid - ${valores.entrada} - ${valores.salida} = ${
        valores.entrada - valores.salida
      }?`, async () => {
        const result = await requester
          .get(`/api/inventario/${inventario.id}`)
          .set("Authorization", `Bearer ${token}`);

        expect(result.ok).to.be.ok;
      });
      it("DELETE /api/inventario/:iid", async () => {
        const result = await requester
          .delete(`/api/inventario/${inventario.id}`)
          .set("Authorization", `Bearer ${token}`);
        expect(result.ok).to.be.ok;
      });
    });
  });
});
