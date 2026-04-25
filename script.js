// ---------------- НАСТРОЙКИ ЦВЕТОВ ----------------

const childColors = [
    "#f7dce5", // пудровый
    "#f9e8c8", // кремовый
    "#dcefff", // небесный
    "#e2f7e1", // мятный
    "#ece3ff"  // лавандовый
];

const strongColors = [
    "#ff7aa2",
    "#ffb347",
    "#5ecbff",
    "#7ed957",
    "#b57bff"
];

// ---------------- ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ----------------

let currentChild = 0;
let currentQuarter = 1;

let storage = JSON.parse(localStorage.getItem("diary_v5") || "[]");

// Если пусто — создаём 5 детей
if (storage.length === 0) {
    storage = Array(5).fill(null).map(() => ({
        name: "",
        years: {}
    }));
    save();
}

// ---------------- СОХРАНЕНИЕ ----------------

function save() {
    localStorage.setItem("diary_v5", JSON.stringify(storage));
}

// ---------------- ОТРИСОВКА ВКЛАДОК ДЕТЕЙ ----------------

function renderChildTabs() {
    const box = document.getElementById("childTabs");
    box.innerHTML = "";

    storage.forEach((child, i) => {
        const tab = document.createElement("div");
        tab.className = "tab";
        tab.textContent = child.name || `Ребёнок ${i + 1}`;
        tab.style.background = strongColors[i];

        if (i === currentChild) tab.classList.add("active");

        // Переименование
        let timer;
        tab.onmousedown = () => {
            timer = setTimeout(() => {
                const newName = prompt("Введите имя:", child.name);
                if (newName) {
                    child.name = newName;
                    save();
                    renderChildTabs();
                    loadChild();
                }
            }, 700);
        };
        tab.onmouseup = () => clearTimeout(timer);

        tab.onclick = () => {
            currentChild = i;
            loadChild();
        };

        box.appendChild(tab);
    });
}

// ---------------- ОТРИСОВКА ПЕРИОДОВ ----------------

function renderPeriodTabs() {
    const box = document.getElementById("periodTabs");
    box.innerHTML = "";

    ["I", "II", "III", "IV"].forEach((label, i) => {
        const tab = document.createElement("div");
        tab.className = "period-tab";
        tab.textContent = label + " период";

        if (i + 1 === currentQuarter) tab.classList.add("active");

        tab.onclick = () => {
            currentQuarter = i + 1;
            loadChild();
        };

        box.appendChild(tab);
    });
}

// ---------------- ПОЛУЧЕНИЕ ДАННЫХ ПЕРИОДА ----------------

function getQuarter() {
    const child = storage[currentChild];
    const year = new Date().getFullYear();

    if (!child.years[year]) child.years[year] = {};
    if (!child.years[year][currentQuarter]) {
        child.years[year][currentQuarter] = {
            edu: "",
            social: "",
            health: "",
            friends: "",
            family: "",
            hobby: "",
            events: {}
        };
    }

    return child.years[year][currentQuarter];
}

// ---------------- КАРТОЧКА ПЕРИОДА ----------------

function renderSavedCard() {
    const card = document.getElementById("savedCard");
    const q = getQuarter();

    card.style.background = strongColors[currentChild] + "dd";

    card.innerHTML = `
        <h2>${currentQuarter} период — сохранено</h2>
        <p><b>Учёба:</b> ${q.edu}</p>
        <p><b>Социальные навыки:</b> ${q.social}</p>
        <p><b>Здоровье:</b> ${q.health}</p>
        <p><b>Дружба:</b> ${q.friends}</p>
        <p><b>Семья:</b> ${q.family}</p>
        <p><b>Хобби:</b> ${q.hobby}</p>
    `;
}

// ---------------- РЕДАКТИРОВАНИЕ ПЕРИОДА ----------------

function enableEditMode() {
    const q = getQuarter();

    document.getElementById("edu").value     = q.edu     || "";
    document.getElementById("social").value  = q.social  || "";
    document.getElementById("health").value  = q.health  || "";
    document.getElementById("friends").value = q.friends || "";
    document.getElementById("family").value  = q.family  || "";
    document.getElementById("hobby").value   = q.hobby   || "";
}




// ---------------- ДОБАВЛЕНИЕ СОБЫТИЙ ----------------

function addEventRow() {
    const table = document.getElementById("eventsTable");

    while (table.rows.length > 1) table.deleteRow(1);

    const row = table.insertRow(-1);
    row.insertCell(0).innerHTML = `
        <select>
            <option value="">Выберите...</option>
            <option value="doctor">Посещение врача</option>
            <option value="relatives">Встреча с родственниками</option>
            <option value="custom">Другое событие</option>
            <option value="study">Учёба</option>
        </select>
    `;
    row.insertCell(1).innerHTML = `<input type="text" placeholder="Комментарий">`;
}

function saveEvent() {
    const date = document.getElementById("eventDateInput").value;
    if (!date) return alert("Выберите дату");

    const table = document.getElementById("eventsTable");
    const q = getQuarter();

    if (!q.events) q.events = {};

    for (let i = 1; i < table.rows.length; i++) {
        const row = table.rows[i];
        const type = row.cells[0].querySelector("select").value;
        const text = row.cells[1].querySelector("input").value;

        if (!type && !text) continue;

        const key = date + "_" + i;
        q.events[key] = { date, type, text };
    }

    save();
    renderEvents();

    document.getElementById("eventDateInput").value = "";

    addEventRow();
}

// ---------------- ОТОБРАЖЕНИЕ СОБЫТИЙ ----------------

function renderEvents() {
    const table = document.getElementById("recordsTable");
    while (table.rows.length > 1) table.deleteRow(1);

    const q = getQuarter();
    if (!q.events) return;

    Object.keys(q.events).forEach(key => {
        const ev = q.events[key];
        const date = ev.date;

        const row = table.insertRow(-1);

        if (ev.type === "doctor") row.className = "event-doctor";
        if (ev.type === "relatives") row.className = "event-relatives";
        if (ev.type === "custom") row.className = "event-custom";
        if (ev.type === "study") row.className = "event-study";

        let markerColor =
            ev.type === "doctor" ? "#00cc44" :
            ev.type === "relatives" ? "#ff3333" :
            ev.type === "custom" ? "#0066ff" :
            "#ff9900";

        row.insertCell(0).innerHTML = `
            <span class="marker" style="background:${markerColor}"></span>
            ${date}
        `;

        row.insertCell(1).textContent =
            ev.type === "doctor" ? "Посещение врача" :
            ev.type === "relatives" ? "Встреча с родственниками" :
            ev.type === "custom" ? "Другое событие" :
            "Учёба";

        row.insertCell(2).textContent = ev.text;

        const actions = row.insertCell(3);

        const edit = document.createElement("button");
        edit.textContent = "✎";
        edit.onclick = () => {
            document.getElementById("eventDateInput").value = date;

            const table2 = document.getElementById("eventsTable");
            while (table2.rows.length > 1) table2.deleteRow(1);

            const r = table2.insertRow(-1);
            r.insertCell(0).innerHTML = `
                <select>
                    <option value="">Выберите...</option>
                    <option value="doctor">Посещение врача</option>
                    <option value="relatives">Встреча с родственниками</option>
                    <option value="custom">Другое событие</option>
                    <option value="study">Учёба</option>
                </select>
            `;
            r.cells[0].querySelector("select").value = ev.type;

            r.insertCell(1).innerHTML = `<input type="text" value="${ev.text}">`;

            delete q.events[key];
            save();
        };
        actions.appendChild(edit);

        const del = document.createElement("button");
        del.textContent = "X";
        del.onclick = () => {
            delete q.events[key];
            save();
            renderEvents();
        };
        actions.appendChild(del);
    });
}
function editQuarter() {
    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);
    const q = qData.quarterData;

    const roman = ["I","II","III","IV"][selectedQuarter - 1];

    document.getElementById("quarterDisplay").innerHTML = `
        <div class="title">${roman} период — редактирование</div>

        <p><b>Учёба:</b><br><textarea id="qEditEdu">${q.edu}</textarea></p>
        <p><b>Социальные навыки:</b><br><textarea id="qEditSocial">${q.social}</textarea></p>
        <p><b>Здоровье:</b><br><textarea id="qEditHealth">${q.health}</textarea></p>
        <p><b>Дружба:</b><br><textarea id="qEditFriends">${q.friends}</textarea></p>
        <p><b>Семья:</b><br><textarea id="qEditFamily">${q.family}</textarea></p>
        <p><b>Хобби:</b><br><textarea id="qEditHobby">${q.hobby}</textarea></p>

        <button onclick="saveQuarterBlock()">Сохранить изменения</button>
    `;
}

function saveQuarter() {
    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);

    qData.quarterData.edu = document.getElementById("qEditEdu").value.trim();
    qData.quarterData.social = document.getElementById("qEditSocial").value.trim();
    qData.quarterData.health = document.getElementById("qEditHealth").value.trim();
    qData.quarterData.friends = document.getElementById("qEditFriends").value.trim();
    qData.quarterData.family = document.getElementById("qEditFamily").value.trim();
    qData.quarterData.hobby = document.getElementById("qEditHobby").value.trim();

    saveStorage(all);

    renderQuarterDisplay();
    updateQuarterBadge();

    alert("Изменения сохранены.");
}


// ---------------- ЗАГРУЗКА РЕБЁНКА ----------------

function loadChild() {
    document.body.style.background = childColors[currentChild];

    renderChildTabs();
    renderPeriodTabs();
    renderSavedCard();
    renderEvents();

    document.getElementById("childName").textContent =
        storage[currentChild].name || `Ребёнок ${currentChild + 1}`;

    document.getElementById("periodTitle").textContent =
        `${currentQuarter} период — ${new Date().getFullYear()}`;
}
function openCalendar() {
    document.getElementById("eventDateInput").showPicker();
}



function exportTXT() {
    const data = JSON.stringify(storage, null, 2);

    const blob = new Blob([data], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "diary_data.txt";
    a.click();

    URL.revokeObjectURL(url);
}

function importTXT(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            storage = data;
            save();
            loadChild();
            alert("Данные успешно загружены!");
        } catch (err) {
            alert("Ошибка: неверный формат файла");
        }
    };
    reader.readAsText(file);
}
function downloadPDF() {
    const child = storage[currentChild];
    const year = new Date().getFullYear();
    const q = getQuarter();

    // Собираем текст периодов
    let html = `
        <h1>${child.name || "Ребёнок " + (currentChild + 1)}</h1>
        <h2>${currentQuarter} период — ${year}</h2>

        <h3>Информация периода:</h3>
        <p><b>Учёба:</b> ${q.edu || "—"}</p>
        <p><b>Социальные навыки:</b> ${q.social || "—"}</p>
        <p><b>Здоровье:</b> ${q.health || "—"}</p>
        <p><b>Дружба:</b> ${q.friends || "—"}</p>
        <p><b>Семья:</b> ${q.family || "—"}</p>
        <p><b>Хобби:</b> ${q.hobby || "—"}</p>

        <h3>События:</h3>
    `;

    // События
    if (!q.events || Object.keys(q.events).length === 0) {
        html += "<p>Нет событий</p>";
    } else {
        html += "<ul>";
        Object.keys(q.events).sort().forEach(date => {
            const ev = q.events[date];
            const type =
                ev.type === "doctor" ? "Посещение врача" :
                ev.type === "relatives" ? "Встреча с родственниками" :
                ev.type === "custom" ? "Другое событие" :
                ev.type === "study" ? "Учёба" :
                "Событие";

            html += `<li><b>${date}</b> — ${type}: ${ev.text}</li>`;
        });
        html += "</ul>";
    }

    // Помещаем в скрытый блок
    const pdfArea = document.getElementById("pdfArea");
    pdfArea.innerHTML = html;
    pdfArea.style.display = "block";

    // Генерация PDF
    html2canvas(pdfArea).then(canvas => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jspdf.jsPDF("p", "mm", "a4");

        const imgWidth = 190;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 10;

        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            pdf.addPage();
            position = heightLeft - imgHeight;
            pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save("diary.pdf");

        // Скрываем блок обратно
        pdfArea.style.display = "none";
    });
}
window.onload = () => {
    loadChild();
    addEventRow(); // ← строка создаётся только здесь
};
// ---------------- ЗАГРУЗКА ПРИ СТАРТЕ ----------------

