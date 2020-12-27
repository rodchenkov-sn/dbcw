const Tabulator = require('tabulator-tables');
const { dialog } = require('electron').remote;

const scheduleRepository = require('../../model/schedule-repository');
const employeesRepository = require('../../model/employees-repository');
const dateFormatter = require('../../common/formatting');

const makeNavbar = require('../../common/navbar-builder');

makeNavbar().then((navbar) => document.querySelector('body').insertAdjacentHTML('afterbegin', navbar));

employeesRepository.getAuthorizedUserEmployment().then((employment) => preparePage(employment === 1));

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

  let brigadeSelection = document.querySelector('#brigade-input');
  let brigades = await scheduleRepository.getBrigades();
  let foremanId = await employeesRepository.getAuthorizedUserId();
  for (let brigade of brigades) {
    if (brigade.foremanId === foremanId) {
      brigadeSelection.insertAdjacentHTML(
        'beforeend',
        `<option value="${brigade.id}">#${brigade.id} of ${brigade.baseLocation}</option>`
      );
    }
  }

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
          { title: 'Id', field: 'brigadeId', editor: !readOnly, validator: ["min:0", "numeric"] },
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
    rowContextMenu: readOnly ? [] : [
      {
        label: 'Delete',
        action: async (_e, row) => {
          if (row.getData().foremanId === foremanId) {
            await scheduleRepository.deleteShift(row.getData().id);
            reloadTableData();
          } else {
            dialog.showErrorBox('Couldn\'t delete shift', 'You can\'t delete shifts for brigades you don\'t own');
          }
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

  if (readOnly) {
    document.querySelector('.columns').classList.add('is-hidden');
  }

  document.querySelector('form').addEventListener('submit', (_event) => {
    let login = document.getElementById('login-input').value;
    let brigadeId = document.getElementById('brigade-input').value;
    let started = document.getElementById('started-input').value;
    scheduleRepository.addShift({
      login: login,
      brigadeId: brigadeId,
      started: started
    }).then(reloadTableData).catch((reason) => dialog.showErrorBox('Could not add shift', reason));
  });

}
