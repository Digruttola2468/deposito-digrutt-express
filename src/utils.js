import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default __dirname;

//Create Hash
export const createHash = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

//Validate Hash
export const isValidPassword = (userPassword, password) => {
  return bcrypt.compareSync(password, userPassword);
};
