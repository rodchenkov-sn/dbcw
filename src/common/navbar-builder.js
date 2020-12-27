const employeesRepository = require('../model/employees-repository')

async function makeNavbar() {
  let employment = await employeesRepository.getAuthorizedUserEmployment();
  let tabs = '<div class="tabs"><ul>';

  switch (employment) {
    case 1: // labourer
      tabs += '<li><a class="nav_group_item" href="../shifts/shifts.html">Shifts</a></li>';
      break;
    case 2: // foreman
      tabs += `<li><a class="nav_group_item" href="../shifts/shifts.html">Shifts</a></li>
               <li><a class="nav_group_item" href="../schedule/schedule.html">Schedule</a></li>`;
      break;
    case 4: // recruter
      tabs += `<li><a class="nav_group_item" href="../employees/employees.html">Employees</a></li>
               <li><a class="nav_group_item" href="../sick-list/sick-list.html">Sick list</a></li>`;
      break;
    case 6: // manager
      tabs += `<li><a class="nav_group_item" href="../projects/projects.html">Projects</a></li>
               <li><a class="nav_group_item" href="../project-types/project-types.html">Price list</a></li>
               <li><a class="nav_group_item" href="../expenses/expenses.html">Finance</a></li>
               <li><a class="nav_group_item" href="../brigades/brigades.html">Brigades</a></li>
               <li><a class="nav_group_item" href="../schedule/schedule.html">Schedule</a></li>`
      break;
  }

  tabs += '</ul></div>';
  return tabs;
}

module.exports = makeNavbar;
