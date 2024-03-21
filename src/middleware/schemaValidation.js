export default (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
  
    if (!result.success) {
      //console.log(result.error.issues);
  
      const error = result.error.issues;
  
      let listErrors = [];
      for (let i = 0; i < error.length; i++) {
        const element = error[i];
  
        switch (element.code) {
          case "invalid_type":
            if (element.received == "undefined") {
              listErrors.push({
                campus: element.path[0],
                message: `El campo ${element.path[0]} esta vacio`,
              });
            } else
              listErrors.push({
                campus: element.path[0],
                message: `Se esperaba un ${element.expected}`,
              });
            break;
          case "invalid_enum_value":
            listErrors.push({
              campus: element.path[0],
              message: `No existe esa/e ${element.path[0]} `,
            });
            break;
          case "too_small":
            listErrors.push({
              campus: element.path[0],
              message: `El campo ${element.path[0]} esta vacio `,
            });
            break;
        }
      }
  
      return res.status(400).json({ status: "error", errors: listErrors });
    } else next();
  };
  