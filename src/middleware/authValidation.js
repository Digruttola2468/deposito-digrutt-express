export const auth = (req, res, next) => {
    if (req.session?.user) return next();
  
    return res
      .status(401)
      .json({ status: "error", message: "No estas permitido" });
  };
  
  export function authAdmin(req, res, next) {
    const user = req.session?.user;
    if (user) {
      if (user.role.toLowerCase() == "admin") next();
      else {
        //req.logger.error("No tenes permisos para acceder");
        return res.status(405).json({ status: "error", message: "Not Allowed" });
      }
    } else
      return res
        .status(401)
        .json({ status: "error", message: "No estas permitido" });
  }
  