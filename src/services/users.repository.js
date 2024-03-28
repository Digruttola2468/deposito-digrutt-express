export default class UsersRepository {
  constructor(userDao, mailModuleDao) {
    this.dao = userDao;
    this.mailModule = mailModuleDao;
  }

  getUserById = async (uid) => await this.dao.getOne(uid);
  getUserByGmail = async (gmail) => await this.dao.getByGmail(gmail);

  createNewUser_gmail = async (user) => {
    const [result] = await this.dao.insert(user);

    // Send Validate Correo
    await this.mailModule.send(user.gmail, 'Not Reply', `
    <div>
      <a href="http://localhost:3000/api/session/validateGmail/${user.gmail}">Click Aca Para validar el correo</a>
    </div>
    `)

    //Return user
    return result
  }

  updateOkValidateGmail = async (gmail) => {
    return await this.dao.updateValidateGmail(gmail)
  }

  createNewUser_google = async (user) => await this.dao.insertGoogle(user);

  deleteUser = async (uid) => await this.dao.delete(uid);
}
