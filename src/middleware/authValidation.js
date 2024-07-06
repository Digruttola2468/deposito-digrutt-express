export const auth = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token)
    return res
      .status(403)
      .json({ status: "error", message: "Access not authorized" });
  
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.session.user = data;
  } catch (error) {}
  
  next();
};

export function authAdmin(req, res, next) {
  const token = req.cookies.access_token;
  if (!token)
    return res
      .status(403)
      .json({ status: "error", message: "Access not authorized" });

  try {
    const data = jwt.verify(token, JWT_SECRET);

    if (data.user.role.toLowerCase() == "admin") return next();
    else return res.status(401).json({ status: "error", message: "Access not authorized" });

  } catch (error) {
    return res
      .status(401)
      .json({ status: "error", message: "Access not authorized" });
  }
}
