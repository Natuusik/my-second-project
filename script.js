/****************************************************
 *  БЛОК 1 — ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
 ****************************************************/
let currentChildId = "child1";
let selectedQuarter = null;
let selectedDate = null;
let currentYear = new Date().getFullYear();
let holdTimer = null;

/****************************************************
 *  БЛОК 2 — СПИСОК ДЕТЕЙ (5 детей)
 ****************************************************/
const children = [
    { id: "child1", name: "Ребёнок 1" },
    { id: "child2", name: "Ребёнок 2" },
    { id: "child3", name: "Ребёнок 3" },
    { id: "child4", name: "Ребёнок 4" },
    { id: "child5", name: "Ребёнок 5" }
];
// Цвета для каждого ребёнка
const childColors = {
    1: "#8ecaff", // голубой
    2: "#ffb3d9", // розовый
    3: "#b8f5b1", // зелёный
    4: "#ffe8a3", // жёлтый
    5: "#d5b3ff", // сиреневый
    6: "#ffc7a3"  // персиковый
};
const childBackgrounds = {
    1: "#eaf6ff", // нежно-голубой
    2: "#ffe6f2", // нежно-розовый
    3: "#e9ffe9", // нежно-зелёный
    4: "#fff8e1", // нежно-жёлтый
    5: "#f5eaff", // нежно-сиреневый
    6: "#fff1e6"  // нежно-персиковый
};
const quarterColors = {
    1: "#7ec7ff", // ярко-голубой
    2: "#ff8ec2", // ярко-розовый
    3: "#7dff7d", // ярко-зелёный
    4: "#ffd86b", // ярко-жёлтый
    5: "#c59aff", // ярко-сиреневый
    6: "#ffb27a"  // ярко-персиковый
};



/****************************************************
 *  БЛОК 3 — ХРАНИЛИЩЕ (LocalStorage)
 ****************************************************/
const STORAGE_KEY = "diary_v4";

function loadStorage() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveStorage(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function getChildData(all, id) {
    if (!all[id]) all[id] = { name: id, quarters: {} };
    return all[id];
}

function ensureQuarter(childData, year, q) {
    const key = `${year}-Q${q}`;
    if (!childData.quarters[key]) {
        childData.quarters[key] = {
            quarterData: {
                edu: "",
                social: "",
                health: "",
                friends: "",
                family: "",
                hobby: ""
            },
            dates: {}
        };
    }
    return childData.quarters[key];
}

function quarterFromDate(dateStr) {
    const m = new Date(dateStr).getMonth() + 1;
    if (m <= 3) return 1;
    if (m <= 6) return 2;
    if (m <= 9) return 3;
    return 4;
}

/****************************************************
 *  БЛОК 4 — ВКЛАДКИ ДЕТЕЙ + ПЕРЕИМЕНОВАНИЕ УДЕРЖАНИЕМ
 ****************************************************/
function renderChildTabs() {
    const tabs = document.getElementById("childTabs");
    tabs.innerHTML = "";

    const all = loadStorage();

    children.forEach((ch, index) => {
        const div = document.createElement("div");

        // активная вкладка
        div.className = "tab" + (ch.id === currentChildId ? " active" : "");

        // имя из хранилища или дефолтное
        div.textContent = all[ch.id]?.name || ch.name;

        // ЦВЕТ ПО ПОРЯДКУ
        const color = childColors[index + 1] || "#ddd";
        div.style.backgroundColor = color;

        // короткое нажатие — переключение
       div.onclick = () => {
    if (holdTimer !== null) return;

    currentChildId = ch.id;
    selectedDate = null;
    selectedQuarter = null;

    // меняем фон страницы
    const bg = childBackgrounds[index + 1] || "#ffffff";
    document.body.style.backgroundColor = bg;

    loadChild();
};


        // удержание — переименование
        div.onmousedown = () => {
            holdTimer = setTimeout(() => {
                renameChild(ch.id);
                holdTimer = null;
            }, 800);
        };

        div.onmouseup = () => {
            clearTimeout(holdTimer);
            holdTimer = null;
        };

        div.onmouseleave = () => {
            clearTimeout(holdTimer);
            holdTimer = null;
        };

        tabs.appendChild(div);
    });
}

/****************************************************
 *  ФУНКЦИЯ ПЕРЕИМЕНОВАНИЯ РЕБЁНКА (ДОЛЖНА БЫТЬ СНАРУЖИ)
 ****************************************************/
function renameChild(id) {
    const all = loadStorage();
    const child = getChildData(all, id);

    const newName = prompt("Введите новое имя ребёнка:", child.name);
    if (!newName) return;

    child.name = newName;
    saveStorage(all);

    renderChildTabs();
    document.getElementById("childName").textContent = "Дневник — " + newName;
}

/****************************************************
 *  БЛОК 5 — ОБНОВЛЕНИЕ UI (бейдж, дата)
 ****************************************************/
function updateQuarterBadge() {
    const badge = document.getElementById("quarterBadge");
    if (!selectedQuarter) {
        badge.style.display = "none";
        return;
    }
    const roman = ["I","II","III","IV"][selectedQuarter - 1];
    badge.textContent = `${roman} квартал ${currentYear}`;
    badge.style.display = "inline-block";
}

function updateSelectedDateInfo() {
    const el = document.getElementById("selectedDateInfo");
    el.textContent = selectedDate 
        ? `Выбрана дата: ${selectedDate}` 
        : "Дата не выбрана";
}

/****************************************************
 *  БЛОК 6 — ВЫБОР ПЕРИОДА (I–IV)
 ****************************************************/
function renderPeriodSelector() {
    const box = document.getElementById("periodSelector");

    // если выбрана дата — скрываем периоды
    if (selectedDate !== null) {
        box.innerHTML = "";
        return;
    }

    const periods = ["I", "II", "III", "IV"];

    // индекс ребёнка для цвета
    const childIndex = children.findIndex(c => c.id === currentChildId);
    const activeColor = quarterColors[childIndex + 1] || "#eee";

    // очищаем
    box.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "10px";
    wrapper.style.flexWrap = "wrap";

    periods.forEach((p, i) => {
        const num = i + 1;

        const div = document.createElement("div");
        div.classList.add("period-pill");
        div.textContent = `${p} период`;

        // подсветка выбранного квартала
        if (selectedQuarter === num) {
            div.style.backgroundColor = activeColor;
            div.style.fontWeight = "600";
        } else {
           const defaultPeriodColor = "#e8e8ff"; // нежно‑лавандовый

        }

        div.style.padding = "8px 14px";
        div.style.borderRadius = "8px";
        div.style.cursor = "pointer";
        div.style.transition = "0.3s";

        div.onclick = () => {
            selectPeriod(num);
        };

        wrapper.appendChild(div);
    });

    box.appendChild(wrapper);
}

function selectPeriod(num) {
    selectedQuarter = num;
    selectedDate = null;

    updateQuarterBadge();
    updateSelectedDateInfo();
    renderPeriodSelector();

    loadQuarterFields();
   
    renderQuarterDisplay();


}

/****************************************************
 *  БЛОК 7 — ЗАГРУЗКА И СОХРАНЕНИЕ ПЕРИОДА (1–6)
 ****************************************************/
function loadQuarterFields() {
    if (!selectedQuarter) return;

    // ПОЛЯ ВСЕГДА ПУСТЫЕ — чтобы не перезаписывать старые данные
    document.getElementById("edu").value = "";
    document.getElementById("social").value = "";
    document.getElementById("health").value = "";
    document.getElementById("friends").value = "";
    document.getElementById("family").value = "";
    document.getElementById("hobby").value = "";
}

function saveQuarter() {
    if (!selectedQuarter) selectedQuarter = 1;

    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);

    // ДОБАВЛЕНИЕ, А НЕ ПЕРЕЗАПИСЬ
    const edu = document.getElementById("edu").value.trim();
    const social = document.getElementById("social").value.trim();
    const health = document.getElementById("health").value.trim();
    const friends = document.getElementById("friends").value.trim();
    const family = document.getElementById("family").value.trim();
    const hobby = document.getElementById("hobby").value.trim();

    if (edu) qData.quarterData.edu += (qData.quarterData.edu ? "\n" : "") + edu;
    if (social) qData.quarterData.social += (qData.quarterData.social ? "\n" : "") + social;
    if (health) qData.quarterData.health += (qData.quarterData.health ? "\n" : "") + health;
    if (friends) qData.quarterData.friends += (qData.quarterData.friends ? "\n" : "") + friends;
    if (family) qData.quarterData.family += (qData.quarterData.family ? "\n" : "") + family;
    if (hobby) qData.quarterData.hobby += (qData.quarterData.hobby ? "\n" : "") + hobby;

    saveStorage(all);

    // ПОЛЯ ОЧИЩАЕМ ПОСЛЕ СОХРАНЕНИЯ
    document.getElementById("edu").value = "";
    document.getElementById("social").value = "";
    document.getElementById("health").value = "";
    document.getElementById("friends").value = "";
    document.getElementById("family").value = "";
    document.getElementById("hobby").value = "";

  
    updateQuarterBadge();
renderQuarterDisplay();

    alert("Период сохранён.");
}
/****************************************************
 *  БЛОК 7.2 — КРАСИВЫЙ БЛОК ПЕРИОДА (один блок!)
 ****************************************************/

function renderQuarterDisplay() {
    const box = document.getElementById("quarterDisplay");

    if (!selectedQuarter) {
        box.innerHTML = "";
        return;
    }

    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);
    const q = qData.quarterData;

    const roman = ["I","II","III","IV"][selectedQuarter - 1];

    box.innerHTML = `
        <div class="title">${roman} период — сохранено</div>

        <p><b>Учёба:</b> ${q.edu || "(пусто)"}</p>
        <p><b>Социальные навыки:</b> ${q.social || "(пусто)"}</p>
        <p><b>Здоровье:</b> ${q.health || "(пусто)"}</p>
        <p><b>Дружба:</b> ${q.friends || "(пусто)"}</p>
        <p><b>Семья:</b> ${q.family || "(пусто)"}</p>
        <p><b>Хобби:</b> ${q.hobby || "(пусто)"}</p>

        <button onclick="editQuarterBlock()">Редактировать период</button>
    `;
}

function editQuarterBlock() {
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

function saveQuarterBlock() {
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


/****************************************************
 *  БЛОК 9 — СОБЫТИЯ (одна строка, без комментария)
 ****************************************************/
function addEventRow(type = "", text = "") {
    const t = document.getElementById("eventsTable");

    // если строка уже есть — не создаём новую
    if (t.rows.length > 1) return;

    const row = t.insertRow(-1);
    const c1 = row.insertCell(0);
    const c2 = row.insertCell(1);

    // SELECT — тип события
    const select = document.createElement("select");
    select.innerHTML = `
        <option value="">Выберите...</option>
        <option value="doctor">Посещение врача</option>
        <option value="relatives">Встреча с родственниками</option>
        <option value="custom">Другое событие</option>
    `;
    select.value = type;
    c1.appendChild(select);

    // INPUT — комментарий
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Комментарий...";
    input.value = text;
    c2.appendChild(input);

    // Цвет строки
    function applyColor() {
        if (select.value === "doctor") row.style.background = "#d9f0ff";
        else if (select.value === "relatives") row.style.background = "#ffe0f0";
        else if (select.value === "custom") row.style.background = "#f0e6ff";
        else row.style.background = "white";
    }

    applyColor();
    select.onchange = applyColor;
}


/****************************************************
 *  БЛОК 10 — ЗАГРУЗКА ДАННЫХ ДАТЫ
 ****************************************************/
function loadDateFields() {
    if (!selectedDate || !selectedQuarter) return;

    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);

    const dData = qData.dates[selectedDate] || {
        doctors: "",
        relatives: "",
        events: []
    };

    document.getElementById("doctors").value = "";
    document.getElementById("relatives").value = "";

    clearEventsTable();

    // если есть сохранённое событие — показываем его
    if (dData.events && dData.events.length > 0) {
        const ev = dData.events[0];

        // старый формат
        if (ev.date && !ev.type) {
            addEventRow("custom");
        } else {
            addEventRow(ev.type || "");
        }
    }
}


/****************************************************
 *  БЛОК 10 — СОХРАНЕНИЕ (БЕЗ ВРАЧА И РОДСТВЕННИКОВ)
 ****************************************************/
function saveAll() {
    const dateStr = document.getElementById("dateInput").value;
    if (!dateStr) {
        alert("Выберите дату");
        return;
    }

    selectedDate = dateStr;
    selectedQuarter = quarterFromDate(dateStr);

    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);

    // создаём дату, если нет
    if (!qData.dates[dateStr]) {
        qData.dates[dateStr] = { events: [] };
    }

    const dData = qData.dates[dateStr];

    /**************  СОХРАНЕНИЕ СОБЫТИЯ  **************/
    const t = document.getElementById("eventsTable");

    if (t.rows.length > 1) {
        const select = t.rows[1].cells[0].querySelector("select");
        const input = t.rows[1].cells[1].querySelector("input");

        const type = select.value;
        const text = input.value.trim();

        if (type) {
            dData.events.push({ type, text });
        }
    }

    /**************  СОХРАНЕНИЕ В ПАМЯТЬ  **************/
    saveStorage(all);

    /**************  ОБНОВЛЕНИЕ ЭКРАНА  **************/
    renderRecordsTable();
    renderHistory();
    updateQuarterBadge();
    updateSelectedDateInfo();
    renderQuarterDisplay();

    /**************  ОЧИСТКА ПОЛЕЙ  **************/
    clearEventsTable();
    addEventRow();

    alert("Запись сохранена.");
}

/****************************************************
 *  БЛОК 11 — СКАЧИВАНИЕ ФАЙЛА
 ****************************************************/
function downloadCurrent() {
    if (!selectedDate) {
        alert("Сначала выберите дату");
        return;
    }

    const all = loadStorage();
    const child = getChildData(all, currentChildId);
    const qData = ensureQuarter(child, currentYear, selectedQuarter);
    const dData = qData.dates[selectedDate];

    let text = "";
    text += `Дата: ${selectedDate}\n\n`;
    text += `1. Учёба:\n${qData.quarterData.edu}\n\n`;
    text += `2. Социальные навыки:\n${qData.quarterData.social}\n\n`;
    text += `3. Здоровье:\n${qData.quarterData.health}\n\n`;
    text += `4. Дружба:\n${qData.quarterData.friends}\n\n`;
    text += `5. Семья:\n${qData.quarterData.family}\n\n`;
    text += `6. Хобби:\n${qData.quarterData.hobby}\n\n`;
    text += `7. Врачи:\n${dData.doctors}\n\n`;
    text += `8. Родственники:\n${dData.relatives}\n\n`;
    text += `События:\n`;

    dData.events.forEach(ev => {
        text += `- ${ev.date}: ${ev.text}\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${selectedDate}.txt`;
    a.click();
}

/****************************************************
 *  БЛОК 12 — ИСТОРИЯ
 ****************************************************/
function toggleHistory() {
    document.getElementById("historyPanel").classList.toggle("visible");
    document.getElementById("overlay").classList.toggle("visible");
}

function renderHistory() {
    const box = document.getElementById("historyContent");
    box.innerHTML = "";

    const all = loadStorage();
    const child = getChildData(all, currentChildId);

    Object.keys(child.quarters).sort().forEach(key => {
        const qDiv = document.createElement("div");
        qDiv.style.marginBottom = "10px";

        const title = document.createElement("div");
        title.style.fontWeight = "bold";
        title.textContent = key;
        qDiv.appendChild(title);

        const qData = child.quarters[key];

        // Период
        const periodBtn = document.createElement("div");
        periodBtn.textContent = "• Период";
        periodBtn.style.cursor = "pointer";
        periodBtn.style.marginLeft = "10px";

        periodBtn.onclick = () => {
            const qNum = Number(key.split("Q")[1]);
           
         

            loadQuarterFields();
            updateQuarterBadge();
            updateSelectedDateInfo();
            toggleHistory();
            renderQuarterDisplay();
        };

        qDiv.appendChild(periodBtn);

        // Даты
        Object.keys(qData.dates).sort().forEach(dateStr => {
            const d = document.createElement("div");
            d.textContent = "• " + dateStr;
            d.style.cursor = "pointer";
            d.style.marginLeft = "20px";

            d.onclick = () => {
                selectedDate = dateStr;
                selectedQuarter = Number(key.split("Q")[1]);

                document.getElementById("dateInput").value = dateStr;

                loadQuarterFields();
                loadDateFields();
                updateQuarterBadge();
                updateSelectedDateInfo();
                toggleHistory();
                    renderQuarterDisplay();
            };

            qDiv.appendChild(d);
        });

        box.appendChild(qDiv);
    });
}

/****************************************************
 *  ТАБЛИЦА СОХРАНЁННЫХ ЗАПИСЕЙ
 ****************************************************/
function renderRecordsTable() {
    const table = document.getElementById("recordsTable");
    while (table.rows.length > 1) table.deleteRow(1);

    const all = loadStorage();
    const child = getChildData(all, currentChildId);

    Object.keys(child.quarters).forEach(key => {
        const qData = child.quarters[key];

        Object.keys(qData.dates).sort().forEach(dateStr => {
            const dData = qData.dates[dateStr];

            // строка с датой
            const row = table.insertRow(-1);
            const c1 = row.insertCell(0);
            const c2 = row.insertCell(1);
            const c3 = row.insertCell(2);

            c1.textContent = dateStr;

            let summary = "";
         
            if (dData.events && dData.events.length > 0) summary = "";

            c2.textContent = summary.trim() || "";

            const del = document.createElement("button");
            del.textContent = "X";
            del.style.background = "#d9534f";
            del.onclick = (e) => {
                e.stopPropagation();
                deleteRecord(dateStr);
            };
            c3.appendChild(del);

            row.onclick = () => {
                selectedDate = dateStr;
                selectedQuarter = Number(key.split("Q")[1]);
                document.getElementById("dateInput").value = dateStr;

                loadQuarterFields();
                loadDateFields();
                updateQuarterBadge();
                updateSelectedDateInfo();
            };

            // все события этой даты
            if (dData.events && dData.events.length > 0) {
                dData.events.forEach(ev => {
                    const evRow = table.insertRow(-1);
                    const evC1 = evRow.insertCell(0);
                    const evC2 = evRow.insertCell(1);
                    const evC3 = evRow.insertCell(2);

                    evC1.textContent = "";

                    let label = "";

                    if (ev.type === "doctor") {
                        label = "Посещение врача";
                        evRow.style.background = "#d9f0ff";
                    } else if (ev.type === "relatives") {
                        label = "Встреча с родственниками";
                        evRow.style.background = "#ffe0f0";
                    } else if (ev.type === "custom") {
                        label = "Другое событие";
                        evRow.style.background = "#f0e6ff";
                    } else {
                        label = "Событие";
                    }

                    // тип события
                    evC2.textContent = label;

                    // комментарий
                    evC3.textContent = ev.text ? ev.text : "";
                });
            }

        }); // ← закрывает dates
    }); // ← закрывает quarters
} // ← закрывает функцию

function deleteRecord(dateStr) {
    if (!confirm("Удалить запись за " + dateStr + "?")) return;

    const all = loadStorage();
    const child = getChildData(all, currentChildId);

    Object.keys(child.quarters).forEach(key => {
        if (child.quarters[key].dates[dateStr]) {
            delete child.quarters[key].dates[dateStr];
        }
    });

    saveStorage(all);
    renderRecordsTable();
    renderHistory();

    if (selectedDate === dateStr) {
        selectedDate = null;
        updateSelectedDateInfo();
    }
}

/****************************************************
 *  БЛОК 13 — ЗАГРУЗКА ДАННЫХ РЕБЁНКА
 ****************************************************/
function loadChild() {
    renderChildTabs();

    const all = loadStorage();
    const child = getChildData(all, currentChildId);

    document.getElementById("childName").textContent =
        "Дневник — " + (child.name || "Без имени");

    renderPeriodSelector();
    renderHistory();
    renderRecordsTable();
    renderQuarterDisplay();

  const index = children.findIndex(c => c.id === currentChildId);
    document.body.style.backgroundColor = childBackgrounds[index + 1] || "#ffffff";
}

/****************************************************
 *  БЛОК 14 — ЗАПУСК ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
 ****************************************************/
window.addEventListener("DOMContentLoaded", () => {
    renderChildTabs();
    loadChild();

    // реакция на выбор даты
    document.getElementById("dateInput").addEventListener("change", () => {
        selectedDate = document.getElementById("dateInput").value;
        selectedQuarter = quarterFromDate(selectedDate);

        updateQuarterBadge();
        updateSelectedDateInfo();
        loadQuarterFields();
        loadDateFields();
        renderPeriodSelector();
    });
});

