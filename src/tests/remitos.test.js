import { expect } from "chai";
import supertest from "supertest";

const requester = supertest("http://localhost:3000");

//npx mocha src/tests/remitos.test.js
describe("** TESTING REMITOS **", () => {
  let token = "";
  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: "ivansandigruttola@gmail.com",
      password: "secret",
    });
    token = result._body.token;
  });

  describe("CRUD /api/remito", () => {
    let remito = null;
    const mercaderiaOutput = { stock: 50, idProduct: 525 };
    const newRemito = {
      fecha: "2024-01-01",
      numRemito: "0000100002550",
      idCliente: "1",
      nroOrden: "",
      valorDeclarado: 5000,
      products: [mercaderiaOutput],
    };
    const updateRemito = {
      valorDeclarado: "321",
      fecha: "2024-01-02",
      nroOrden: "0541",
      numRemito: "0000100002551",
    };
    const addNewMercaderiaInRemito = [
      {
        idInventario: 526,
        stock: 350,
        price: 50,
      },
    ];
    const updateRemitoOnlyProducts = {
      products: [],
    };

    it("Method: POST", async () => {
      const result = await requester
        .post(`/api/remito`)
        .send(newRemito)
        .set("Authorization", `Bearer ${token}`);
      remito = result._body.data;
      expect(result.ok).to.be.ok;
    });
    it("Method: PUT", async () => {
      const result = await requester
        .put(`/api/remito/${remito.id}`)
        .send(updateRemito)
        .set("Authorization", `Bearer ${token}`);
      console.log("UPDATE: ", result._body);
      expect(result.ok).to.be.ok;
    });
    it("Method: GET ONE", async () => {
      const result = await requester
        .get(`/api/remito/${remito.id}`)
        .set("Authorization", `Bearer ${token}`);
      console.log("GET ONE: ", result._body);
      console.log("GET ONE: ", result._body.data.mercaderia);
      //
      updateRemitoOnlyProducts.products.push({
        stock: 23,
        idMercaderia: result._body.data.mercaderia[0].id,
      });
      expect(result.ok).to.be.ok;
    });
    it("Method: PUT - NEW MERCADERIA", async () => {
      const result = await requester
        .put(`/api/remito/newProduct/${remito.id}`)
        .send(addNewMercaderiaInRemito)
        .set("Authorization", `Bearer ${token}`);
      console.log("UPDATE new Mercaderia: ", result._body);
      expect(result.ok).to.be.ok;
    });
    it("Method: UPDATE - MERCADERIA OUTPUT", async () => {
      const result = await requester
        .put(`/api/remito/${remito.id}`)
        .send(updateRemitoOnlyProducts)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });
    it("Method: GET ONE", async () => {
      const result = await requester
        .get(`/api/remito/${remito.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });
    /*it("Method: DELETE", async () => {
      const result = await requester
        .delete(`/api/remito/${remito.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(result.ok).to.be.ok;
    });*/
  });
});
