const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote;

const projectsRepository = require('../../model/projects-repository');
const employeesRepository = require('../../model/employees-repository');
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

projectsRepository.getProjectsFull().then((projects) => {
  let projectSelection = document.querySelector('#project-input');
  for (let project of projects) {
    if (project.state === 3) {
      projectSelection.insertAdjacentHTML(
        'beforeend',
        `<option value="${project.id}">#${project.id} of ${project.typeName}</option>`
      );
    }
  }
});

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
    { title: 'Project', field: 'relatedProject' },
    { title: 'Amount', field: 'amount' },
    { title: 'Date', field: 'date', formatter: dateFormatter }
  ],
  rowContextMenu: [
    {
      label: "Delete",
      action: async (_e, row) => {
        await projectsRepository.deleteExpense(row.getData().id);
        reloadTableData();
      }
    }
  ],
});

async function reloadTableData() {
  let expenses = await projectsRepository.getExpenses();
  table.replaceData(expenses);
}

reloadTableData();

var salaryTable = new Tabulator("#salary-table", {
  pagination: "local",
  paginationSize: 10,
  paginationSizeSelector: [10, 25, 50, 100],
  data: [],
  layout: "fitColumns",
  columns: [
    { title: 'First name', field: 'firstName' },
    { title: 'Last name', field: 'lastName' },
    { title: 'Salary', field: 'salary' }
  ]
});

document.querySelector('#low-date').onchange = reloadSalaryData;
document.querySelector('#high-date').onchange = reloadSalaryData;

async function reloadSalaryData() {
  let low = document.querySelector('#low-date').value;
  let high = document.querySelector('#high-date').value;
  if (low && high && low < high) {
    salaryTable.replaceData(await employeesRepository.getSalaries(low, high));
    document.querySelector('#expenses-output').value = await employeesRepository.getExpenses(low, high);
    document.querySelector('#profits-output').value = await employeesRepository.getProfits(low, high);
    document.querySelector('#budget-output').value = await employeesRepository.getBudget(low, high);
  }
}

document.querySelector('form').addEventListener('submit', (_event) => {
  let project = document.getElementById('project-input').value;
  let amount = document.getElementById('amount-input').value;
  let date = document.getElementById('date-input').value;
  projectsRepository.addExpenses({
    amount: amount,
    relatedProject: project,
    date: date
  }).then(reloadTableData).catch((reason) => dialog.showErrorBox('Couldn\'t add expense', reason));
});
