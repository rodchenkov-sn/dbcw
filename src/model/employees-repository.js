const settings = require('electron-settings');
const mysql = require('mysql');
const util = require('util');
const bcrypt = require('bcrypt');
const saltRounds = 10;

class EmployeesRepository {

  constructor() {
    this.connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: null,
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
      await bcrypt.hash(user.password, saltRounds),
      user.employment,
      user.firstName,
      user.lastName,
      user.salary
    ];
    let result = await this.query(
      'call add_employee(?, ?, ?, ?, ?, ?)',
      userArr
    );
    if (result.affectedRows !== 1) {
      throw 'Login already exists';
    }
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
      await settings.set('user', {
        'id': resUser.id,
        'employment': resUser.employment
      });
    } else {
      throw 'invalid password';
    }
  }

  async getEmployees() {
    let result = await this.query('select * from employees');
    let users = [];
    for (let row of result) {
      users.push({
        id: row.id,
        login: row.login,
        password: row.pwd,
        employment: row.employment,
        firstName: row.first_name,
        lastName: row.last_name,
        salary: row.salary
      })
    }
    return users;
  }

  async getRoles() {
    let result = await this.query('select id, name from employments');
    let rolesMap = new Map();
    for (let row of result) {
      rolesMap.set(row.id, row.name);
    }
    return rolesMap
  }

  async updateEmployee(employee) {
    await this.query(
      'update employees set employment = ?, first_name = ?, last_name = ?, salary = ? where id = ?',
      [employee.employment, employee.firstName, employee.lastName, employee.salary, employee.id]
    );
  }

  async deleteEmployee(employee) {
    await this.query(
      'delete from employees where id = ?', [employee.id]
    );
  }

  async getSickList() {
    return await this.query(`
      select
        s.id,
        s.opened,
        s.closed,
        s.serial_number as serialNumber,
        e.login as login,
        e.first_name as firstName,
        e.last_name as lastName
      from sick_list as s
        left join employees as e on e.id = s.related_employee;`
    );
  }

  async addToSickList(sickList) {
    let result = await this.query('call add_sick_list(?, ?, ?, ?)', [
      sickList.login,
      sickList.opened,
      sickList.closed,
      sickList.serial
    ]);
    if (result.affectedRows !== 1) {
      throw 'Login does not exists';
    }
  }

  async deleteSickList(id) {
    await this.query('delete from sick_list where id = ?', [id]);
  }

  async getAuthorizedUserEmployment() {
    return await settings.get('user.employment');
  }

  async getAuthorizedUserId() {
    return await settings.get('user.id');
  }

}

const employeesRepository = new EmployeesRepository();
module.exports = employeesRepository;
