const Tabulator = require('tabulator-tables');

const scheduleRepository = require('../../model/schedule-repository');

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
  paginationSize: 10,
  paginationSizeSelector: [10, 25, 50, 100],
  data: [],
  layout: "fitColumns",
  columns: [
    { title: 'Id', field: 'id' },
    { title: 'Base location', field: 'baseLocation' },
    {
      title: 'Foreman',
      columns: [
        { title: 'Login', field: 'login', editor: true },
        { title: 'First name', field: 'firstName' },
        { title: 'Last name', field: 'lastName' }
      ]
    }
  ],
  cellEdited: onForemanChanged,
  rowContextMenu: [
    {
      label: "Delete",
      action: async (_e, row) => {
        await scheduleRepository.deleteBrigade(row.getData().id);
        reloadTableData();
      }
    }
  ],
});

async function onForemanChanged(cell) {
  let newLogin = cell.getRow().getData().login;
  let brigadeId = cell.getRow().getData().id;
  console.log(newLogin);
  console.log(brigadeId);
  await scheduleRepository.changeForeman(newLogin, brigadeId);
  reloadTableData();
}

async function reloadTableData() {
  let brigades = await scheduleRepository.getBrigades();
  table.replaceData(brigades);
}

reloadTableData();

document.querySelector('form').addEventListener('submit', (_event) => {
  let foremanLogin = document.getElementById('foreman-input').value;
  let baseLocation = document.getElementById('location-input').value;
  scheduleRepository.addBrigade(foremanLogin, baseLocation).then(reloadTableData);
});
