const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote;

const projectsRepository = require('../../model/projects-repository')
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
  height: 400,
  data: [],
  layout: "fitColumns",
  columns: [
    { title: 'Id', field: 'id' },
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
  if (row.getData().opened > Date.now()) {
    dialog.showErrorBox('Couldn\'t close project', 'Project can be closed only after it\'s been opened');
  } else {
    await projectsRepository.closeProject(row.getData().id);
    reloadTableData();
  }
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

projectsRepository.getTypes().then((types) => {
  let typeSelection = document.querySelector('#type-input');
  for (let [id, val] of types) {
    if (val.active) {
      typeSelection.insertAdjacentHTML(
        'beforeend',
        `<option value="${id}">${val.name}</option>`
      );
    }
  }
});

document.querySelector('form').addEventListener('submit', (_event) => {
  let opened = document.getElementById('opened-input').value;
  let type = document.getElementById('type-input').value;
  projectsRepository.addProject({
    type: type,
    opened: opened
  }).then(reloadTableData);
});
