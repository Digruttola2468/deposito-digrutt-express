import { ENUM_ERRORS } from "../errors/enums.js";

export default (error, req, res, next) => {
  
  switch (error.code) {
    case ENUM_ERRORS.INVALID_OBJECT_NOT_EXISTS:
      res
        .status(400)
        .send({ status: "Error", campus: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.INVALID_TYPES_ERROR:
      res
        .status(400)
        .send({ status: "Error", campus: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.DATABASE_ERROR:
      res
        .status(500)
        .send({ status: "Error", error: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.FOREING_KEY_OBJECT_NOT_EXISTS:
      res
        .status(404)
        .send({ status: "Error", campus: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.INVALID_TYPE_EMPTY:
      res
        .status(400)
        .send({ status: "Error", campus: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.ROUTING_ERROR:
      res
        .status(400)
        .send({ status: "Error", error: error.name, message: error.cause });
      break;
    case ENUM_ERRORS.THIS_OBJECT_ALREDY_EXISTS:
      res
        .status(400)
        .send({ status: "Error", campus: error.name, message: error.cause });
      break;
    default:
      res.status(500).send({
        status: "error",
        error: "Something Wrong",
      });
      break;
  }
};
