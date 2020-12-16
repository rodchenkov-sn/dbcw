const mysql = require('mysql');
const util = require('util');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class AuthRepository {

  constructor() {
    this.authorizedUser = null;
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null, //'MadokaSupremacyGoddess',
      database: 'db_cw',
      port: 3306
    });
    this.connection.connect((err) => {
      if (err) {
        console.log(err.code);
        console.log(err.fatal);
      }
    });
    this.query = util.promisify(this.connection.query).bind(this.connection);
  }

  async registerUser(user) {
    let userArr = [
      user.login,
      await bcrypt.hash(users.password, saltRounds),
      user.employment,
      user.firstName,
      user.lastName,
      user.salary
    ];
    let result = await this.query(
      'exec add_employee(?, ?, ?, ?, ?, ?)',
      userArr
    );
    return result.length == 0 ? 0 : result.insertId;
  }

  async authUser(login, password) {
    let result = await this.query(
      'select * from employees where login = ?',
      [login]
    );
    if (result.length == 0) {
      throw 'invalid user';
    }
    let resUser = result[0];
    let passwordCorrect = await bcrypt.compare(password, result[0].pwd);
    if (passwordCorrect) {
      this.authorizedUser = {
        id: resUser.id,
        login: resUser.login,
        password: resUser.pwd,
        employment: resUser.employment,
        firstName: resUser.first_name,
        lastName: resUser.last_name,
        salary: resUser.salary
      }
      return this.authorizedUser;
    }
    throw 'unauthorized'
  }

  async getRoles() {
    return new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(this.roles);
      }, 1000);
    });
  }

}

const authRepository = new AuthRepository();
module.exports = authRepository;
