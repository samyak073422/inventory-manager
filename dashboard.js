// =================== USER DATA HANDLING ===================
const activeUser = localStorage.getItem("activeUser");
if (!activeUser) window.location.href = "index.html";

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || {};
}

function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// =================== INVENTORY DATA ===================
function getInventory() {
  return getUsers()[activeUser].inventory || [];
}

function setInventory(data) {
  const users = getUsers();
  users[activeUser].inventory = data;
  setUsers(users);
  renderInventory();
  updateDashboard();
}

// =================== STOCK MOVEMENT LOG ===================
function logStockAction(action) {
  const key = `log_${activeUser}`;
  const logs = JSON.parse(localStorage.getItem(key)) || [];
  logs.unshift(`${new Date().toLocaleString()}: ${action}`);
  localStorage.setItem(key, JSON.stringify(logs));
}

// =================== FORM TOGGLE ===================
function toggleForm() {
  const form = document.getElementById("formSection");
  form.style.display = form.style.display === "none" ? "block" : "none";
  document.getElementById("itemForm").reset();
  document.getElementById("itemIndex").value = "";
  document.getElementById("formTitle").textContent = "Add New Item";
}

// =================== SAVE ITEM ===================
function saveItem(event) {
  event.preventDefault();
  const index = document.getElementById("itemIndex").value;
  const name = document.getElementById("itemName").value.trim();
  const qty = +document.getElementById("itemQty").value;
  const price = +document.getElementById("itemPrice").value;
  const category = document.getElementById("itemCategory").value.trim();

  const inventory = getInventory();
  if (index) {
    inventory[index] = { name, qty, price, category };
    logStockAction(`Edited: ${name} updated.`);
  } else {
    inventory.push({ name, qty, price, category });
    logStockAction(`Added: ${qty} ${name}(s)`);
  }
  setInventory(inventory);
  toggleForm();
}

// =================== DELETE ITEM ===================
function deleteItem(index) {
  const inventory = getInventory();
  const deleted = inventory.splice(index, 1)[0];
  logStockAction(`Deleted: ${deleted.qty} ${deleted.name}(s)`);
  setInventory(inventory);
}

// =================== RENDER INVENTORY ===================
function renderInventory() {
  const table = document.getElementById("inventoryTable");
  const inventory = getInventory();
  const search = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;

  let filtered = inventory.filter(i => 
    i.name.toLowerCase().includes(search) &&
    (categoryFilter === "all" || i.category === categoryFilter)
  );

  if (filtered.some(item => item.qty < 5)) {
    alert("⚠️ Some items have low stock!");
  }

  const rows = filtered.map((item, i) => `
    <tr>
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>₹${item.price}</td>
      <td>${item.category}</td>
      <td>
        <button onclick="editItem(${i})">✏️</button>
        <button onclick="deleteItem(${i})">🗑️</button>
      </td>
    </tr>
  `).join("");

  table.innerHTML = `
    <table>
      <tr><th>Name</th><th>Qty</th><th>Price</th><th>Category</th><th>Actions</th></tr>
      ${rows || "<tr><td colspan='5'>No items found</td></tr>"}
    </table>
  `;

  updateCategoryDropdown();
}

// =================== EDIT ITEM ===================
function editItem(index) {
  const item = getInventory()[index];
  document.getElementById("itemIndex").value = index;
  document.getElementById("itemName").value = item.name;
  document.getElementById("itemQty").value = item.qty;
  document.getElementById("itemPrice").value = item.price;
  document.getElementById("itemCategory").value = item.category;
  document.getElementById("formTitle").textContent = "Edit Item";
  document.getElementById("formSection").style.display = "block";
}

// =================== CATEGORY DROPDOWN ===================
function updateCategoryDropdown() {
  const dropdown = document.getElementById("categoryFilter");
  const categories = [...new Set(getInventory().map(i => i.category))];
  dropdown.innerHTML = `<option value="all">All Categories</option>` +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
}

// =================== DASHBOARD ===================
function updateDashboard() {
  const inventory = getInventory();
  const totalItems = inventory.length;
  const totalQty = inventory.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = inventory.reduce((sum, item) => sum + (item.qty * item.price), 0);
  const lowStock = inventory.filter(item => item.qty < 5).length;
  const topCategory = Object.entries(inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

  document.getElementById("totalItems").textContent = `📦 Total Items: ${totalItems}`;
  document.getElementById("totalQty").textContent = `🔢 Total Quantity: ${totalQty}`;
  document.getElementById("totalValue").textContent = `💰 Total Value: ₹${totalValue}`;
  document.getElementById("lowStock").textContent = `⚠️ Low Stock Items: ${lowStock}`;
  document.getElementById("topCategory").textContent = `🏷️ Top Category: ${topCategory}`;
}

// =================== LOGOUT ===================
function logout() {
  localStorage.removeItem("activeUser");
  window.location.href = "index.html";
}

// Init
renderInventory();
updateDashboard();
// =================== DARK MODE TOGGLE ===================
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDark ? "enabled" : "disabled");
  }
  
  function loadTheme() {
    const mode = localStorage.getItem("darkMode");
    if (mode === "enabled") document.body.classList.add("dark-mode");
  }
  loadTheme();
  
  // =================== VIEW STOCK LOG ===================
  function showStockLog() {
    const key = `log_${activeUser}`;
    const logs = JSON.parse(localStorage.getItem(key)) || [];
    const logList = logs.map(l => `<li>${l}</li>`).join("") || "<li>No logs yet.</li>";
    document.getElementById("logList").innerHTML = `<ul>${logList}</ul>`;
    document.getElementById("logModal").style.display = "block";
  }
  function closeLogModal() {
    document.getElementById("logModal").style.display = "none";
  }
  
  // =================== PRINT INVENTORY ===================
  function printInventory() {
    const inventory = getInventory();
    let content = `<h2>Inventory Sheet</h2><table border="1" cellspacing="0" cellpadding="5">
      <tr><th>Name</th><th>Qty</th><th>Price</th><th>Category</th></tr>`;
    inventory.forEach(item => {
      content += `<tr>
        <td>${item.name}</td>
        <td>${item.qty}</td>
        <td>₹${item.price}</td>
        <td>${item.category}</td>
      </tr>`;
    });
    content += "</table>";
  
    const win = window.open('', '', 'width=800,height=600');
    win.document.write(`<html><head><title>Inventory Sheet</title></head><body>${content}</body></html>`);
    win.print();
    win.close();
  }
  function login(event) {
    event.preventDefault();
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;
  
    const users = JSON.parse(localStorage.getItem("users")) || [];
  
    const user = users.find(u => u.username === username && u.password === password);
  
    if (user) {
      localStorage.setItem("activeUser", username);
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid credentials");
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    renderInventory(); // or any other functions
  });
  
