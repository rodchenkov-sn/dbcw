const Tabulator = require('tabulator-tables');

const projectsRepository = require('../../model/projects-repository')

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
    { title: 'Name', field: 'name', editor: true },
    { title: 'Price', field: 'price', editor: true, validator: ["min:0", "numeric"] }
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
