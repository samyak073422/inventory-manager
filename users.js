function toggleAuthForm() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
  registerForm.style.display = registerForm.style.display === "none" ? "block" : "none";
}

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function register(event) {
  event.preventDefault();
  const username = document.getElementById("registerUsername").value.trim();
  const password = document.getElementById("registerPassword").value;

  let users = getUsers();

  if (users[username]) {
    alert("Username already exists!");
    return;
  }

  users[username] = { password, inventory: [] };
  setUsers(users);
  alert("Registration successful. Please login.");
  toggleAuthForm();
}

function login(event) {
  event.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;

  let users = getUsers();

  if (!users[username] || users[username].password !== password) {
    alert("Invalid username or password!");
    return;
  }

  localStorage.setItem("activeUser", username);
  window.location.href = "dashboard.html";
}
