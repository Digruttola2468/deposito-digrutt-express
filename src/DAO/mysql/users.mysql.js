import con from "../../config/db.js";

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

  async getOne(uid) {
    return await con.query(`SELECT * FROM users WHERE id = ?;`, [uid]);
  }

  async insert(data) {
    return await con.query(
      `INSERT INTO users (nombre, apellido, gmail, password) VALUES (?,?,?,?) `,
      [data.nombre, data.apellido, data.gmail, data.password]
    );
  }

  async insertGoogle(data) {
    return await con.query(
      `INSERT INTO users (nombre, apellido, gmail, isGmailValidate, isGoogleAuth) VALUES (?,?,?,?,?) `,
      [data.nombre, data.apellido, data.gmail, 0, 1]
    );
  }

  async updateValidateGmail (gmail) {
    return await con.query(`UPDATE users SET isGmailValidate = 1 WHERE gmail = ?;`, [gmail])
  }

  async delete(iid) {
    return await con.query("DELETE FROM users WHERE (`id` = ?);", [iid]);
  }
}
