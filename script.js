const lengthInput = document.getElementById("length");
const widthInput = document.getElementById("width");
const areaInput = document.getElementById("area");
const historyTableBody = document.getElementById("historyBody");
const clearHistoryButton = document.getElementById("clearHistory");

function trackDt(event, additionalData) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: event, ...additionalData });
}

function generateId() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 16; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function calculatePing(e) {
  let length = parseFloat(lengthInput.value);
  let width = parseFloat(widthInput.value);
  let area = parseFloat(areaInput.value);
  if (
    e.target.getAttribute("id") == "length" ||
    e.target.getAttribute("id") == "width"
  ) {
    if (!length || !width) {
      return false;
    }
    let m_length = length / 100;
    let m_width = width / 100;

    if (m_length > 0 && m_width > 0) {
      area = m_length * m_width;
      areaInput.value = area.toFixed(2);
    }
  } else if (e.target.getAttribute("id") == "area") {
    lengthInput.value = "";
    widthInput.value = "";
    length = "";
    width = "";
  }
  let ping;

  if (area > 0) {
    ping = area / 3.3058;
    addRecord(length, width, area, ping);
  }
}

function addRecord(length, width, area, ping) {
  const randomId = generateId();
  const record = { length, width, area, ping, randomId };
  let history = JSON.parse(localStorage.getItem("history")) || [];
  history.unshift(record);
  history = history.slice(0, 10);
  localStorage.setItem("history", JSON.stringify(history));
  trackDt("calculate_ping", {
    ping: ping,
    length: length,
    area: area,
    randomId: randomId,
  });
  renderHistory();
}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  historyTableBody.innerHTML = "";
  history.forEach((record) => {
    const row = historyTableBody.insertRow();
    row.innerHTML = `
        <td>${record.length || "-"} cm</td>
        <td>${record.width || "-"} cm</td>
        <td>${record.area.toFixed(2)} ㎡</td>
        <td>${record.ping.toFixed(2)} 坪</td>
        <td><button class="delete-record-btn" onclick="deleteRecord(this)">X</button></td>
    `;
    row.setAttribute("data-id", record.randomId);
  });
}

function clearHistory() {
  localStorage.removeItem("history");
  history = [];
  renderHistory();
}

function deleteRecord(btn) {
  let row = btn.parentNode.parentNode;
  let rowId = row.getAttribute("data-id");
  console.log({ rowId: rowId });
  let dataArray = JSON.parse(localStorage.getItem("history"));
  let objectIndex = dataArray.findIndex((obj) => obj.randomId === rowId);
  if (objectIndex !== -1) {
    dataArray.splice(objectIndex, 1);
    localStorage.setItem("history", JSON.stringify(dataArray));
  }
  trackDt("delete_record", { randomId: rowId });
  row.parentNode.removeChild(row);
}

lengthInput.addEventListener("change", calculatePing);
widthInput.addEventListener("change", calculatePing);
areaInput.addEventListener("change", calculatePing);
clearHistoryButton.addEventListener("click", clearHistory);

renderHistory();
