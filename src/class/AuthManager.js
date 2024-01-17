import { con } from "../config/db.js";

export default class AuthManager {
  constructor() {
    this.listUsers = [];
  }

  async getUsers() {
    try {
      const [rows] = await con.query("SELECT * FROM users;");
      this.listUsers = rows;
      return { data: rows };
    } catch (e) {
      console.error(e);
      return { error: { message: "Something wrong" } };
    }
  }

  getUserByGmail = async (gmail) => {
    await this.getUsers();
    if (this.listUsers.length != 0) {
      const findByGmail = this.listUsers.find((elem) => elem.gmail == gmail);
      if (findByGmail) return findByGmail;
      else return [];
    } else return null;
  };

  existUser = async (gmail) => {
    await this.getUsers();
    if (this.listUsers.length != 0) {
      const findByGmail = this.listUsers.find((elem) => elem.gmail == gmail);
      if (findByGmail) return true;
      else return false;
    } else return null;
  };

  async postUser(user) {
    try {
      const result = await con.query(
        "INSERT INTO users (nombre,apellido,gmail,role) VALUES (?,?,?,?) ;",
        [user.nombre, user.apellido, user.gmail, "user"]
      );

      console.log(result);

      this.listUsers.push(user);

      return { data: { status: "success", message: "Agregado base de datos" } };
    } catch (error) {
      console.log(error);
      return { error: { status: "error", message: "Something Wrong" } };
    }
  }
}
