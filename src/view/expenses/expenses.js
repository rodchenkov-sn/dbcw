const Tabulator = require('tabulator-tables');

const projectsRepository = require('../../model/projects-repository');
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

document.querySelector('form').addEventListener('submit', (_event) => {
  let project = document.getElementById('project-input').value;
  let amount = document.getElementById('amount-input').value;
  let date = document.getElementById('date-input').value;
  projectsRepository.addExpenses({
    amount: amount,
    relatedProject: project,
    date: date
  }).then(reloadTableData);
});
