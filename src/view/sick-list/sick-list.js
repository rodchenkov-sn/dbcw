const Tabulator = require('tabulator-tables');

const employeesRepository = require('../../model/employees-repository')

var moment = require('moment');

function dateFormatter(cell, _formatterParams) {
  var value = cell.getValue();

  if (value) {
    value = moment(value, "YYYY/MM/DD").format("MM/DD/YYYY");
  }

  return value;
}

const fieldEl = document.getElementById("filter-field");
const typeEl = document.getElementById("filter-type");
const valueEl = document.getElementById("filter-value");

function updateFilter() {
  let filterVal = fieldEl.options[fieldEl.selectedIndex].value;
  let typeVal = typeEl.options[typeEl.selectedIndex].value;

  let filter = filterVal;

  if (filterVal == "function") {
    typeEl.disabled = true;
    valueEl.disabled = true;
  } else {
    typeEl.disabled = false;
    valueEl.disabled = false;
  }

  if (filterVal) {
    table.setFilter(filter, typeVal, valueEl.value);
  }
}

document.getElementById("filter-field").onchange = updateFilter;
document.getElementById("filter-type").onchange = updateFilter;
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

document.getElementById("filter-clear").onclick = () => {
  fieldEl.value = "";
  typeEl.value = "=";
  valueEl.value = "";
  table.clearFilter();
};

var table = new Tabulator("#example-table", {
  height: 400,
  data: [],
  layout: "fitColumns",
  columns: [
    { title: 'First name', field: 'firstName' },
    { title: 'Last name', field: 'lastName' },
    { title: 'Opened', field: 'opened', formatter: dateFormatter },
    { title: 'Closed', field: 'closed', formatter: dateFormatter },
    { title: 'Serial number', field: 'serialNumber' }
  ]
});

async function reloadTableData() {
  let sickList = await employeesRepository.getSickList();
  table.replaceData(sickList);
}

reloadTableData();
