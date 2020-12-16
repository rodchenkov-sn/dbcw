'use strict';

const path = require('path');

const authRepository = require('../../model/auth-repository')

const loginInput = document.getElementById('login_input');
const passwordInput = document.getElementById('password_input');
const loginButton = document.getElementById('login_button');

function validateInputs(login, password) {
  return login.length > 0 && password.length > 0;
}

loginButton.onclick = async () => {
  let login = loginInput.value;
  let password = passwordInput.value;
  if (validateInputs(login, password)) {
    authRepository.authUser(login, password).then(() => {
      window.location.assign(path.join(__dirname, '../index/index.html'));
    });
  }
}
