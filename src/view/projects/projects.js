const Tabulator = require('tabulator-tables');

const projectsRepository = require('../../model/projects-repository')

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
    { tytle: 'Id', field: 'id' },
    { title: 'Type', field: 'typeName' },
    { title: 'Price', field: 'price' },
    { title: 'Opened', field: 'opened', formatter: dateFormatter },
    { title: 'Closed', field: 'closed', formatter: dateFormatter },
    { title: 'State', field: 'stateName' }
  ],
  rowContextMenu: [
    {
      label: "Close",
      action: onProjectClosed
    },
    {
      label: "Drop",
      action: onProjectDropped
    },
  ],
});

async function onProjectClosed(_e, row) {
  await projectsRepository.closeProject(row.getData().id);
  reloadTableData();
}

async function onProjectDropped(_e, row) {
  await projectsRepository.dropProject(row.getData().id);
  reloadTableData();
}

async function reloadTableData() {
  let projects = await projectsRepository.getProjects();
  let states = await projectsRepository.getStates();
  let types = await projectsRepository.getTypes();
  for (let project of projects) {
    project.stateName = states.get(project.state);
    let projectType = types.get(project.type);
    project.price = projectType.price;
    project.typeName = projectType.name;
  }
  table.replaceData(projects);
}

reloadTableData();
