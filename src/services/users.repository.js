export default class UsersRepository {
  constructor(userDao, mailModuleDao) {
    this.dao = userDao;
    this.mailModule = mailModuleDao;
  }

  getUserById = async (uid) => await this.dao.getOne(uid);
  getUserByGmail = async (gmail) => await this.dao.getByGmail(gmail);

  createNewUser_gmail = async (user) => {
    const result = await this.dao.insert(user);

    // Send Validate Correo
    await this.mailModule.send(user.gmail, 'Not Reply', `
        <div>
            <p style="font-family: Arial, Helvetica, sans-serif;display: inline">Bienvenido <b>${user.apellido} ${user.nombre}</b>, necesitamos que valides tu correo electronico haciendo click en el siguiente boton</p>
        </div>
        <div>
            <a href="http://localhost:3000/api/session/validateGmail/${user.gmail}" style="font-family: Arial, Helvetica, sans-serif;background-color: #2962ff; display: block; padding: 8px; border-radius: 2px;outline: none; cursor: pointer; border: none; font-weight: bold; color: #fff;">Validar Correo Electronico</a>
        </div>
        <div>
            <p style="font-family: Arial, Helvetica, sans-serif;">No responder este mensaje</p>
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
