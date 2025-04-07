// dashboard.js

function getActiveUser() {
    return localStorage.getItem("activeUser");
  }
  
  function getUsers() {
    return JSON.parse(localStorage.getItem("users")) || {};
  }
  
  function setUsers(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }
  
  function getInventory() {
    const username = getActiveUser();
    const users = getUsers();
    return users[username]?.inventory || [];
  }
  
  function setInventory(inventory) {
    const username = getActiveUser();
    const users = getUsers();
    users[username].inventory = inventory;
    setUsers(users);
  }
  
  function logout() {
    localStorage.removeItem("activeUser");
    window.location.href = "index.html";
  }
  
  function toggleForm(editIndex = null) {
    const formSection = document.getElementById("formSection");
    formSection.style.display = formSection.style.display === "none" ? "block" : "none";
  
    if (editIndex !== null) {
      const item = getInventory()[editIndex];
      document.getElementById("formTitle").innerText = "✏️ Edit Item";
      document.getElementById("itemIndex").value = editIndex;
      document.getElementById("itemName").value = item.name;
      document.getElementById("itemQty").value = item.qty;
      document.getElementById("itemPrice").value = item.price;
      document.getElementById("itemCategory").value = item.category;
    } else {
      document.getElementById("formTitle").innerText = "➕ Add New Item";
      document.getElementById("itemForm").reset();
      document.getElementById("itemIndex").value = "";
    }
  }
  
  function saveItem(event) {
    event.preventDefault();
    const index = document.getElementById("itemIndex").value;
    const name = document.getElementById("itemName").value.trim();
    const qty = parseInt(document.getElementById("itemQty").value);
    const price = parseFloat(document.getElementById("itemPrice").value);
    const category = document.getElementById("itemCategory").value.trim();
  
    let inventory = getInventory();
  
    const newItem = { name, qty, price, category };
  
    if (index === "") {
      inventory.push(newItem);
    } else {
      inventory[index] = newItem;
    }
  
    setInventory(inventory);
    toggleForm();
    renderInventory();
  }
  
  function deleteItem(index) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    let inventory = getInventory();
    inventory.splice(index, 1);
    setInventory(inventory);
    renderInventory();
  }
  
  function renderInventory() {
    const inventory = getInventory();
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const categoryFilter = document.getElementById("categoryFilter").value;
  
    const filtered = inventory.filter(item =>
      (item.name.toLowerCase().includes(searchValue) ||
        item.category.toLowerCase().includes(searchValue)) &&
      (categoryFilter === "all" || item.category === categoryFilter)
    );
  
    const tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Category</th>
            <th>Total</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map((item, i) => `
            <tr>
              <td>${item.name}</td>
              <td>${item.qty}</td>
              <td>₹${item.price.toFixed(2)}</td>
              <td>${item.category}</td>
              <td>₹${(item.qty * item.price).toFixed(2)}</td>
              <td>
                <button onclick="toggleForm(${i})">✏️</button>
                <button onclick="deleteItem(${i})">🗑️</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  
    document.getElementById("inventoryTable").innerHTML = tableHTML;
    updateDashboardStats(filtered);
    updateCategoryFilter();
  }
  
  function updateDashboardStats(items) {
    let totalQty = 0, totalValue = 0;
    const categoryCount = {};
    let lowStockCount = 0;
  
    items.forEach(item => {
      totalQty += item.qty;
      totalValue += item.qty * item.price;
      if (item.qty < 5) lowStockCount++;
      categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
    });
  
    const topCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";
  
    document.getElementById("totalItems").innerText = `📦 Total Items: ${items.length}`;
    document.getElementById("totalQty").innerText = `🔢 Total Quantity: ${totalQty}`;
    document.getElementById("totalValue").innerText = `💰 Total Value: ₹${totalValue.toFixed(2)}`;
    document.getElementById("lowStock").innerText = `⚠️ Low Stock Items: ${lowStockCount}`;
    document.getElementById("topCategory").innerText = `🏷️ Top Category: ${topCategory}`;
  }
  
  function updateCategoryFilter() {
    const inventory = getInventory();
    const categorySelect = document.getElementById("categoryFilter");
    const uniqueCategories = [...new Set(inventory.map(item => item.category))];
  
    categorySelect.innerHTML = `<option value="all">All Categories</option>` +
      uniqueCategories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }
  
  function exportCSV() {
    const inventory = getInventory();
    const rows = [["Item", "Quantity", "Price", "Category"]];
    inventory.forEach(item => rows.push([item.name, item.qty, item.price, item.category]));
  
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
  
    a.href = URL.createObjectURL(blob);
    a.download = "inventory.csv";
    a.click();
  }
  
  window.onload = () => {
    if (!getActiveUser()) {
      alert("Please login first.");
      window.location.href = "index.html";
      return;
    }
    renderInventory();
  };
  