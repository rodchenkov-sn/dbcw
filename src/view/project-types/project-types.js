const Tabulator = require('tabulator-tables');

const projectsRepository = require('../../model/projects-repository');

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
  groupBy: 'active',
  layout: "fitColumns",
  columns: [
    { title: 'Name', field: 'name', editor: true },
    { title: 'Price', field: 'price', editor: true, validator: ["min:0", "numeric"] },
    { title: 'Active', field: 'active', hozAlign: "center", formatter: "tickCross" }
  ],
  rowContextMenu: [
    {
      label: 'Archive',
      action: async (_e, row) => {
        let t = row.getData();
        t.active = false;
        await projectsRepository.updateType(t);
        reloadTableData()
      }
    },
    {
      label: 'Restore',
      action: async (_e, row) => {
        let t = row.getData();
        t.active = true;
        await projectsRepository.updateType(t);
        reloadTableData();
      }
    },
    {
      label: 'Delete',
      action: async (_e, row) => {
        await projectsRepository.deleteType(row.getData().id);
        reloadTableData();
      }
    }
  ],
  cellEdited: async (cell) => {
    await projectsRepository.updateType(cell.getRow().getData());
    reloadTableData();
  }
});

async function reloadTableData() {
  let projectTypes = await projectsRepository.getTypesObjects();
  table.replaceData(projectTypes);
}

reloadTableData();

document.querySelector('form').addEventListener('submit', (_event) => {
  let name = document.getElementById('name-input').value;
  let price = document.getElementById('price-input').value;
  projectsRepository.addType({
    name: name,
    price: price
  }).then(reloadTableData);
});
