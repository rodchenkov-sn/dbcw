const mysql = require('mysql');
const util = require('util');

class ProjectsRepository {

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

  async getProjects() {
    return await this.query('select * from projects');
  }

  async addProject(project) {
    await this.query('insert into projects value (null, ?, ?, null, 3)', [project.type, project.opened]);
  }

  async getStates() {
    let result = await this.query('select * from project_states');
    let states = new Map();
    for (let row of result) {
      states.set(row.id, row.name);
    }
    return states;
  }

  async getTypes() {
    let result = await this.query('select * from project_types');
    let types = new Map();
    for (let row of result) {
      types.set(row.id, { name: row.name, price: row.price, active: row.active });
    }
    return types;
  }

  async getTypesObjects() {
    return await this.query('select * from project_types');
  }

  async addType(projectType) {
    await this.query('insert into project_types value (null, ?, ?, 1)', [projectType.name, projectType.price]);
  }

  async deleteType(id) {
    await this.query(`
      delete from project_types where id = ? and not exists(
        select * from projects where projects.type = ?)`,
      [id, id]
    )
  }

  async updateType(projectType) {
    await this.query(
      'call update_project_type(?, ?, ?, ?)',
      [projectType.id, projectType.name, projectType.price, projectType.active]
    );
  }

  async updateProject(project) {
    await this.query(
      'update projects set state = ?', [project.state]
    );
  }

  async closeProject(id) {
    await this.query('call close_project(?)', [id]);
  }

  async dropProject(id) {
    await this.query('call drop_project(?)', [id]);
  }

  async getExpenses(id) {
    return await this.query('select * from expenses where related_project = ?', [id]);
  }

  async deleteExpense(id) {
    await this.query('delete from expenses where id = ?', [id]);
  }

  async getExpenses() {
    return await this.query('select id, amount, related_project as relatedProject, date from expenses');
  }

  async addExpenses(expense) {
    await this.query(`
      insert into expenses
        select null, ?, ?, ?
          where exists(select * from projects where id = ?)`,
      [expense.amount, expense.relatedProject, expense.date, expense.relatedProject]
    );
  }

}

const projectsRepository = new ProjectsRepository();
module.exports = projectsRepository;
