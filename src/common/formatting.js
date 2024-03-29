var moment = require('moment');

const dateFormatter = (cell, _formatterParams) => {
  var value = cell.getValue();

  if (value) {
    value = moment(value, "YYYY/MM/DD").format("DD/MM/YYYY");
  }

  return value;
};

module.exports = dateFormatter;
