const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote;

const scheduleRepository = require('../../model/schedule-repository');
const employeesRepository = require('../../model/employees-repository');
const projectsRepository = require('../../model/projects-repository');
const dateFormatter = require('../../common/formatting');

const makeNavbar = require('../../common/navbar-builder');

makeNavbar().then((navbar) => document.querySelector('body').insertAdjacentHTML('afterbegin', navbar));

employeesRepository.getAuthorizedUserEmployment().then((employment) => preparePage(employment === 2));

async function preparePage(readOnly) {
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

  if (!readOnly) {
    let brigadeSelection = document.querySelector('#brigade-input');
    let brigades = await scheduleRepository.getBrigades();
    for (let brigade of brigades) {
      brigadeSelection.insertAdjacentHTML(
        'beforeend',
        `<option value="${brigade.id}">#${brigade.id} of ${brigade.baseLocation}</option>`
      );
    }

    let projectSelection = document.querySelector('#project-input');
    let projects = await projectsRepository.getProjectsFull();
    for (let project of projects) {
      if (project.state === 3) {
        projectSelection.insertAdjacentHTML(
          'beforeend',
          `<option value="${project.id}">#${project.id} of ${project.typeName}</option>`
        );
      }
    }
  }

  var table = new Tabulator("#example-table", {
    height: 400,
    data: [],
    layout: "fitColumns",
    columns: [
      { title: 'Date', field: 'started', formatter: dateFormatter },
      { title: 'Project', field: 'project' },
      { title: 'Brigade', field: 'brigadeId', editor: !readOnly, validator: ["min:0", "numeric"] },
      {
        title: 'Foreman',
        columns: [
          { title: 'First name', field: 'firstName' },
          { title: 'Last name', field: 'lastName' }
        ]
      }
    ],
    rowContextMenu: readOnly ? [] : [
      {
        label: 'Delete',
        action: async (_e, row) => {
          await scheduleRepository.deleteSchedule(row.getData().id);
          reloadTableData();
        }
      }
    ],
    cellEdited: async (cell) => {
      let bId = cell.getRow().getData().brigadeId;
      let sId = cell.getRow().getData().id;
      await scheduleRepository.updateScheduleBrigade(sId, bId);
      reloadTableData();
    }
  });

  async function reloadTableData() {
    let shifts = await scheduleRepository.getSchedule();
    table.replaceData(shifts);
  }

  reloadTableData();

  if (readOnly) {
    document.querySelector('.columns').classList.add('is-hidden');
  }

  document.querySelector('form').addEventListener('submit', (_event) => {
    let started = document.getElementById('started-input').value;
    let brigade = document.getElementById('brigade-input').value;
    let project = document.getElementById('project-input').value;
    scheduleRepository.addSchedule({
      started: started,
      brigadeId: brigade,
      project: project
    }).then(reloadTableData).catch((reason) => dialog.showErrorBox('Couldn\'t add to schedule', reason));
  });

}
