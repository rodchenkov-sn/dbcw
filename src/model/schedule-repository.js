const mysql = require('mysql');
const util = require('util');

class ScheduleRepository {
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

  async addBrigade(foremanLogin, baseLocation) {
    let result = await this.query('call add_brigade(?, ?)', [foremanLogin, baseLocation]);
    if (result.affectedRows !== 1) {
      throw 'Foreman with specified login does not exists';
    }
  }

  async getBrigades() {
    return await this.query(`
      select
        b.id as id,
        b.base_location as baseLocation,
        e.id as foremanId,
        e.login as login,
        e.first_name as firstName,
        e.last_name as lastName
      from brigades as b
        left join employees as e on e.id = b.chief`
    );
  }

  async deleteBrigade(id) {
    await this.query('delete from brigades where id = ?', [id]);
  }

  async changeForeman(newLogin, brigadeId) {
    await this.query('call change_foreman(?, ?)', [newLogin, brigadeId]);
  }

  async getShifts() {
    return await this.query(`
      select
        s.id,
        s.started,
        b.id as brigadeId,
        b.base_location as baseLocation,
        e.first_name as firstName,
        e.last_name as lastName,
        c.id as foremanId,
        c.first_name as chiefFirstName,
        c.last_name as chiefLastName
      from shifts as s
        join brigades b on b.id = s.brigade
        join employees e on e.id = s.employee
        join employees c on c.id = b.chief`
    );
  }

  async deleteShift(id) {
    await this.query('delete from shifts where id = ?', [id]);
  }

  async addShift(shift) {
    try {
      let result = await this.query('call add_shift(?, ?, ?)', [shift.login, shift.brigadeId, shift.started]);
      if (result.affectedRows !== 1) {
        throw 'User does not exists or can not have shift at the moment';
      }
    } catch (_e) {
      throw 'User does not exists or can not have shift at the moment';
    }
  }

  async updateShiftBrigade(shiftId, brigadeId) {
    await this.query('call change_shift_brigade(?, ?)', [shiftId, brigadeId]);
  }

  async getSchedule() {
    return await this.query(`
      select
        s.id,
        s.started,
        s.project,
        b.id as brigadeId,
        e.first_name as firstName,
        e.last_name as lastName
       from schedule as s
        left join brigades as b on b.id = s.brigade
        left join employees as e on e.id = b.chief`
    );
  }

  async deleteSchedule(id) {
    await this.query('delete from schedule where id = ?', [id]);
  }

  async updateScheduleBrigade(scheduleId, brigadeId) {
    await this.query('call change_schedule_brigade(?, ?)', [scheduleId, brigadeId]);
  }

  async addSchedule(scheduleInfo) {
    let result = await this.query('call add_to_schedule(?, ?, ?)', [scheduleInfo.project, scheduleInfo.brigadeId, scheduleInfo.started]);
    if (result.affectedRows !== 1) {
      throw 'Can\'t add to schedule because brigade is already busy, project is closed or opened after date';
    }
  }

  async getFreeLabourer(wDate) {
    try {
      let result = await this.query('select get_free_labourer(?) as login', [wDate]);
      if (result.length !== 1) {
        throw 'Couldn\'t find a free labourer for specified date';
      }
      return result[0].login
    } catch (_e) {
      throw 'Couldn\'t find a free labourer for specified date';
    }
  }
}

const scheduleRepository = new ScheduleRepository();
module.exports = scheduleRepository;
