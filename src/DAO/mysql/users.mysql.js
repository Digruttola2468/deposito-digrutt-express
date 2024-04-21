import con from "../../config/db.js";
import { createHash } from "../../utils.js";

export default class UsersMySql {
  constructor() {
    this.listUsers = [];
  }

  async get() {
    const [rows] = await con.query(`SELECT * FROM users;`);
    this.listUsers = rows;
    return rows;
  }

  async getByGmail(gmail) {
    return await con.query(`SELECT * FROM users WHERE gmail = ?`, [gmail]);
  }

  getByGmailSync(gmail) {
    return this.listUsers.find((elem) => elem.gmail == gmail);
  }
  getSync() {
    return this.listUsers
  }

  async getOne(uid) {
    return await con.query(`SELECT * FROM users WHERE id = ?;`, [uid]);
  }

  async insert(data) {
    try {
      const [result] = await con.query(
        `INSERT INTO users (nombre, apellido, gmail, password) VALUES (?,?,?,?) `,
        [data.nombre, data.apellido, data.gmail, data.password]
      );

      this.listUsers.push({
        id: result.insertId,
        nombre: data.nombre,
        apellido: data.apellido,
        gmail: data.gmail,
        password: createHash(data.password),
        role: "user",
        isGmailValidate: 0,
        isGoogleAuth: 0,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async insertGoogle(data) {
    try {
      const result = await con.query(
        `INSERT INTO users (nombre, apellido, gmail, isGmailValidate, isGoogleAuth) VALUES (?,?,?,?,?) `,
        [data.nombre, data.apellido, data.gmail, 0, 1]
      );

      this.listUsers.push({
        id: result.insertId,
        nombre: data.nombre,
        apellido: data.apellido,
        gmail: data.gmail,
        role: "user",
        isGmailValidate: 0,
        isGoogleAuth: 1,
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateValidateGmail(gmail) {
    try {
      const result = await con.query(
        `UPDATE users SET isGmailValidate = 1 WHERE gmail = ?;`,
        [gmail]
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async delete(iid) {
    try {
      const result = await con.query("DELETE FROM users WHERE (`id` = ?);", [
        iid,
      ]);

      const deleteByIdUser = this.listUsers.filter((elem) => elem.id != iid);

      this.listUsers = deleteByIdUser;

      return result;
    } catch (error) {
      throw error;
    }
  }
}
