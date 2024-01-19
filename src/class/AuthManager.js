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
    const [rows] = await con.query(`SELECT * FROM users WHERE gmail=?`, gmail);

    if (rows.length != 0) {
      const update = this.listUsers.map((elem) => {
        if (elem.id == rows[0].id) return rows[0];
        else return elem;
      });

      this.listUsers = update;

      return rows[0];
    } else return [];
  };

  existUser = async (gmail) => {
    const { data } = await this.getUsers();
    const findByGmail = data.find((elem) => elem.gmail == gmail);
    if (findByGmail) return true;
    else return false;
  };

  async postUser(user) {
    try {
      const [rows] = await con.query(
        "INSERT INTO users (nombre,apellido,gmail,role) VALUES (?,?,?,?) ;",
        [user.nombre, user.apellido, user.gmail, "user"]
      );

      this.listUsers.push(user);

      return {
        data: {
          status: "success",
          message: "Agregado base de datos",
          user: {
            nombre: user.nombre,
            apellido: user.apellido,
            gmail: user.gmail,
            role: "user",
            id: rows.insertId,
          },
        },
      };
    } catch (error) {
      console.log(error);
      return { error: { status: "error", message: "Something Wrong" } };
    }
  }
}
