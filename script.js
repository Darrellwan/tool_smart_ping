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
    areaInput.value = "";
    lengthInput.value = "";
    widthInput.value = "";
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
  showPopup();
  renderHistory();

}

function renderHistory() {
  let history = JSON.parse(localStorage.getItem("history")) || [];
  historyTableBody.innerHTML = "";
  history.forEach((record) => {
    const row = historyTableBody.insertRow();
    row.innerHTML = `
        <td class="view">
            <span class="view-value">
            ${record.length || record.width ? `${record.length || "  -  "} x ${record.width || "  -  "} cm` : ""}
            </span>
        </td>
        <td class="view"><span class="view-value">${record.area.toFixed(2)} ㎡ </span></td>
        <td class="view"><span class="view-value">${record.ping.toFixed(2)} 坪 </span></td>
        <td class="view"><button class="delete-record-btn" onclick="deleteRecord(this)">X</button></td>
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
  let dataArray = JSON.parse(localStorage.getItem("history"));
  let objectIndex = dataArray.findIndex((obj) => obj.randomId === rowId);
  if (objectIndex !== -1) {
    dataArray.splice(objectIndex, 1);
    localStorage.setItem("history", JSON.stringify(dataArray));
  }
  trackDt("delete_record", { randomId: rowId });
  row.parentNode.removeChild(row);
}

function showPopup() {
    const popup = document.getElementById('popup');
    popup.classList.add('show');
    setTimeout(function() {
        popup.classList.remove('show');
    }, 3000);
}


lengthInput.addEventListener("change", calculatePing);
widthInput.addEventListener("change", calculatePing);
areaInput.addEventListener("change", calculatePing);
clearHistoryButton.addEventListener("click", clearHistory);

renderHistory();
