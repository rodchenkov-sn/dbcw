const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote

const employeesRepository = require('../../model/employees-repository')
const dateFormatter = require('../../common/formatting');

const makeNavbar = require('../../common/navbar-builder');

makeNavbar().then((navbar) => document.querySelector('body').insertAdjacentHTML('afterbegin', navbar));

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
  pagination: "local",
  paginationSize: 10,
  paginationSizeSelector: [10, 25, 50, 100],
  data: [],
  layout: "fitColumns",
  columns: [
    { title: 'Login', field: 'login' },
    { title: 'First name', field: 'firstName' },
    { title: 'Last name', field: 'lastName' },
    { title: 'Opened', field: 'opened', formatter: dateFormatter },
    { title: 'Closed', field: 'closed', formatter: dateFormatter },
    { title: 'Serial number', field: 'serialNumber' }
  ],
  rowContextMenu: [
    {
      label: 'Delete',
      action: async (_e, row) => {
        await employeesRepository.deleteSickList(row.getData().id);
        reloadTableData();
      }
    }
  ]
});

async function reloadTableData() {
  let sickList = await employeesRepository.getSickList();
  table.replaceData(sickList);
}

reloadTableData();

document.querySelector('form').addEventListener('submit', (event) => {
  let login = document.getElementById('login-input').value;
  let opened = document.getElementById('opened-input').value;
  let closed = document.getElementById('closed-input').value;
  let serial = document.getElementById('serial-input').value;
  if (opened >= closed) {
    event.preventDefault();
    document.getElementById('closed-input').value = null;
    dialog.showErrorBox('Could not add sick list', 'Open date must be less then close date');
  } else {
    employeesRepository.addToSickList({
      login: login,
      opened: opened,
      closed: closed,
      serial: serial
    }).then(reloadTableData).catch((reason) => dialog.showErrorBox('Could not add sick list', reason));
  }
});
