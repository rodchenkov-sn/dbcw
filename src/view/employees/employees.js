const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote

const employeesRepository = require('../../model/employees-repository');

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
  data: [],
  layout: "fitColumns",
  pagination: "local",
  paginationSize: 10,
  paginationSizeSelector: [10, 25, 50, 100],
  columns: [
    { title: 'Employment', field: 'employmentName' },
    { title: 'Login', field: 'login' },
    { title: 'First name', field: 'firstName', editor: true },
    { title: 'Last name', field: 'lastName', editor: true },
    { title: 'Salary', field: 'salary', editor: true, validator: ["min:0", "numeric"] }
  ],
  cellEdited: onDataChanged,
  rowContextMenu: [
    {
      label: "Delete",
      action: onRowDeleted
    },
  ]
});

async function onDataChanged(cellComponent) {
  let editedUser = cellComponent.getRow().getData();
  await employeesRepository.updateEmployee(editedUser);
  reloadTableData();
}

async function onRowDeleted(_e, row) {
  await employeesRepository.deleteEmployee(row.getData());
  reloadTableData();
}

async function reloadTableData() {
  let employees = await employeesRepository.getEmployees();
  let roles = await employeesRepository.getRoles();
  for (let employee of employees) {
    employee.employmentName = roles.get(employee.employment);
  }
  table.replaceData(employees);
}

reloadTableData();

employeesRepository.getRoles().then((roles) => {
  let employmentSelection = document.getElementById('employment-input');
  for (let [id, title] of roles) {
    employmentSelection.insertAdjacentHTML(
      'beforeend',
      `<option value="${id}">${title}</option>`
    );
  }
})

document.querySelector('form').addEventListener('submit', (_event) => {
  let ulogin = document.getElementById('login-input').value;
  let upassword = document.getElementById('password-input').value;
  let ufirstName = document.getElementById('first-name-input').value;
  let ulastName = document.getElementById('last-name-input').value;
  let usalary = document.getElementById('salary-input').value;
  let uemployment = document.getElementById('employment-input').value;
  employeesRepository.registerUser({
    login: ulogin,
    password: upassword,
    firstName: ufirstName,
    lastName: ulastName,
    salary: usalary,
    employment: uemployment
  }).then(reloadTableData).catch((reason) => dialog.showErrorBox('Could not register employee', reason));
});
