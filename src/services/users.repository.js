export default class UsersRepository {
  constructor(userDao) {
    this.dao = userDao;
  }

  getUserById = async (uid) => await this.dao.getOne(uid);
  getUserByGmail = async (gmail) => await this.dao.getByGmail(gmail);

  createNewUser_gmail = async (user) => await this.dao.insert(user);

  createNewUser_google = async (user) => await this.dao.insertGoogle(user);

  deleteUser = async (uid) => await this.dao.delete(uid);
}
