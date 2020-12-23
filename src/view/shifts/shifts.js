const Tabulator = require('tabulator-tables');

const scheduleRepository = require('../../model/schedule-repository');

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
    { title: 'Date', field: 'started', formatter: dateFormatter },
    { title: 'First name', field: 'firstName' },
    { title: 'Last name', field: 'lastName' },
    {
      title: 'Brigade',
      columns: [
        { title: 'Id', field: 'brigadeId', editor: true, validator: ["min:0", "numeric"] },
        { title: 'Location', field: 'baseLocation' },
      ]
    },
    {
      title: 'Foreman',
      columns: [
        { title: 'First name', field: 'chiefFirstName' },
        { title: 'Last name', field: 'chiefLastName' },
      ]
    }
  ],
  rowContextMenu: [
    {
      label: 'Delete',
      action: async (_e, row) => {
        await scheduleRepository.deleteShift(row.getData().id);
        reloadTableData();
      }
    }
  ],
  cellEdited: async (cell) => {
    let bId = cell.getRow().getData().brigadeId;
    let sId = cell.getRow().getData().id;
    await scheduleRepository.updateShiftBrigade(sId, bId);
    reloadTableData();
  }
});

async function reloadTableData() {
  let shifts = await scheduleRepository.getShifts();
  table.replaceData(shifts);
}

reloadTableData();
