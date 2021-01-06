const { dialog } = require('electron').remote
const path = require('path');

const employeesRepository = require('../../model/employees-repository')

document.querySelector('form').addEventListener('submit', async (event) => {
  event.preventDefault();
  let login = document.getElementById('login-input').value;
  let password = document.getElementById('password-input').value;
  try {
    await employeesRepository.authUser(login, password);
    window.location.assign(path.join(__dirname, '../index/index.html'));
  } catch (e) {
    dialog.showErrorBox('Login went wrong!', `An error occured while login: ${e}`);
  }
});

function togglePassword() {
  var x = document.getElementById("password-input");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
}
