import { expect } from "chai";
import supertest from "supertest";
import { TESTING_USER_GMAIL, TESTING_USER_PASSW } from "../config/dotenv.js";

const requester = supertest("http://localhost:3000");

/*describe("/api/session AUTH", () => {
  it("POST /api/session Register", async () => {
    const result = requester.post("/api/session/register").send({
      first_name: "Ivan",
      last_name: "Di Gruttola",
      email: "ivansandigruttola@gmail.com",
      password: "secret",
    });

    console.log(result);

    expect(result.ok).to.be.ok;
  });
});*/

describe("", () => {
  let cookie = "";

  before(async () => {
    const result = await requester.post("/api/session/login").send({
      email: TESTING_USER_GMAIL,
      password: TESTING_USER_PASSW,
    });
    const resultCookie = result.headers["set-cookie"][0]
    token = resultCookie.split("=")[1].split(";")[0];
  });

  it("GET /api/session current", async () => {
    const result = requester
      .get("/api/session/current")
      .send({
        email: "ivansandigruttola@gmail.com",
        password: "secret",
      })
      .set("Cookie", [`connect.sid=${cookie}`]);

    console.log(result);

    expect(result.ok).to.be.ok;
  });
});
