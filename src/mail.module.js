import nodemailer from "nodemailer";
import {MAIL_USER,MAIL_PASS} from "./config/dotenv.js";

export default class Mail {
  constructor() {
    this.transport = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: MAIL_USER,
        pass: MAIL_PASS,
      },
    });
  }

  send = async (gmail, subject, html) => {
    const opt = {
      from: MAIL_USER,
      to: gmail,
      subject,
      html,
    };

    const result = await this.transport.sendMail(opt);

    return result;
  };
}
