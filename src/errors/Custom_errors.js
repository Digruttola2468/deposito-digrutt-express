export default class CustomError {
  //message => Error info
  //name    => Campo del Error
  //code    => Info error for User
  //cause   => Code from enum.js error
  static createError({ name = "Error", cause, message, code }) {
    const error = new Error(message, { cause });
    error.name = name;
    error.code = code;

    throw error;
  }
}
