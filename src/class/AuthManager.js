import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

import { db_supabase } from "../supabase/supabase.js";

export default class AuthManager {
  constructor() {
    this.listUsers = [];
  }

  async getToken(gmail) {
    if (this.listUsers.length != 0) {
      const findUserByGmail = this.listUsers.filter(
        (elem) => elem.gmail == gmail
      );

      //Si se encontro el usuario
      if (findUserByGmail) {
        console.log("findUserByGmail",findUserByGmail);
        return {
          data: {
            ...findUserByGmail
          },
        };
      }
    }
    console.log("List: ",this.listUsers);
    if (gmail != null) {
      try {
        const { data, error } = await db_supabase
          .from("users")
          .select()
          .eq("gmail", gmail);

        if (error)
          return {
            error: {
              message: "something wrong",
            },
          };

        if (data.length === 0)
          return {
            error: {
              message: "No se encontro el usuario",
            },
          };

        const userForToken = {
          created_at: data[0].created_at,
          nombre: data[0].nombre,
          apellido: data[0].apellido,
          is_admin: data[0].is_admin,
          is_mercaderia: data[0].is_mercaderia,
          is_oficina: data[0].is_oficina,
          is_produccion: data[0].is_produccion,
          is_matriceria: data[0].is_matriceria,
          gmail: data[0].gmail,
        };

        if (
          userForToken.is_admin ||
          userForToken.is_mercaderia ||
          userForToken.is_oficina ||
          userForToken.is_produccion ||
          userForToken.is_matriceria
        ) {
          const token = jwt.sign(userForToken, JWT_SECRET);

          if (this.listUsers.length != 0) {
            const findUserByToken = this.listUsers.filter(
              (elem) => elem.token == token
            );
            if (findUserByToken == null) {
              this.listUsers.push({
                ...userForToken,
                token,
              });
            }
          } else {
            this.listUsers.push({
              ...userForToken,
              token,
            });
          }

          return {
            data: {
              ...userForToken,
              token,
            },
          };
        } else
          return {
            error: {
              message:
                "Todavia No estas habilitado, avisale al dueño de la pagina para que te habilite",
            },
          };
      } catch (error) {
        return {
          error: {
            message: "Something wrong",
          },
        };
      }
    } else
      return {
        error: {
          message: "No se encontro",
        },
      };
  }
}
