// ===============================
//   ХРАНЕНИЕ ДАННЫХ
// ===============================
let entries = JSON.parse(localStorage.getItem("entries") || "[]");
let editIndex = null;


// ===============================
//   ПОКАЗ / СКРЫТИЕ ПОЛЯ "СВОЁ"
// ===============================
function checkCustomEvent() {
    const eventSelect = document.getElementById("event");
    const customInput = document.getElementById("customEvent");

    if (eventSelect.value === "custom") {
        customInput.classList.remove("hidden");
    } else {
        customInput.classList.add("hidden");
        customInput.value = "";
    }
}


// ===============================
//   СОХРАНЕНИЕ ЗАПИСИ
// ===============================
function saveEntry() {
    const eventSelect = document.getElementById("event");
    const customEvent = document.getElementById("customEvent").value;

    const entry = {
        name: document.getElementById("name").value.trim(),
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        event: eventSelect.value === "custom" ? customEvent.trim() : eventSelect.value,
        notes: document.getElementById("notes").value.trim()
    };

    if (!entry.name || !entry.date || !entry.time) {
        alert("Заполните имя, дату и время");
        return;
    }

    if (eventSelect.value === "custom" && !customEvent.trim()) {
        alert("Введите своё событие");
        return;
    }

    if (editIndex !== null) {
        entries[editIndex] = entry;
        editIndex = null;
    } else {
        entries.push(entry);
    }

    localStorage.setItem("entries", JSON.stringify(entries));
    clearForm();
    renderTable();
}


// ===============================
//   ОЧИСТКА ФОРМЫ
// ===============================
function clearForm() {
    document.getElementById("name").value = "";
    document.getElementById("date").value = "";
    document.getElementById("time").value = "";
    document.getElementById("event").value = "Болезнь";
    document.getElementById("customEvent").classList.add("hidden");
    document.getElementById("customEvent").value = "";
    document.getElementById("notes").value = "";
}


// ===============================
//   ОТОБРАЖЕНИЕ ТАБЛИЦЫ
// ===============================
function renderTable() {
    const tbody = document.getElementById("tableBody");
    tbody.innerHTML = "";

    const fName = document.getElementById("filterName").value.toLowerCase();
    const fDate = document.getElementById("filterDate").value;
    const fEvent = document.getElementById("filterEvent").value;

    entries
        .filter(e =>
            (!fName || e.name.toLowerCase().includes(fName)) &&
            (!fDate || e.date === fDate) &&
            (!fEvent || e.event === fEvent)
        )
        .forEach((e, i) => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${e.name}</td>
                <td>${e.date}</td>
                <td>${e.time}</td>
                <td>${e.event}</td>
                <td>${e.notes}</td>
                <td>
                    <button class="btn edit" onclick="editEntry(${i})">Редактировать</button>
                    <button class="btn delete" onclick="deleteEntry(${i})">Удалить</button>
                </td>
            `;

            tbody.appendChild(row);
        });
}


// ===============================
//   РЕДАКТИРОВАНИЕ
// ===============================
function editEntry(i) {
    const e = entries[i];

    document.getElementById("name").value = e.name;
    document.getElementById("date").value = e.date;
    document.getElementById("time").value = e.time;

    const eventSelect = document.getElementById("event");
    const customInput = document.getElementById("customEvent");

    if (["Болезнь","Встреча с родственниками","Событие","Другое"].includes(e.event)) {
        eventSelect.value = e.event;
        customInput.classList.add("hidden");
    } else {
        eventSelect.value = "custom";
        customInput.classList.remove("hidden");
        customInput.value = e.event;
    }

    document.getElementById("notes").value = e.notes;

    editIndex = i;
}


// ===============================
//   УДАЛЕНИЕ
// ===============================
function deleteEntry(i) {
    if (confirm("Удалить запись?")) {
        entries.splice(i, 1);
        localStorage.setItem("entries", JSON.stringify(entries));
        renderTable();
    }
}


// ===============================
//   ЭКСПОРТ TXT
// ===============================
function exportTXT() {
    let text = "";
    entries.forEach(e => {
        text += `${e.name}|${e.date}|${e.time}|${e.event}|${e.notes}\n`;
    });

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "journal.txt";
    a.click();

    URL.revokeObjectURL(url);
}


// ===============================
//   ИМПОРТ TXT
// ===============================
function importTXT() {
    const file = document.getElementById("importFile").files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {
        const lines = e.target.result.split("\n");
        entries = [];

        lines.forEach(line => {
            if (!line.trim()) return;
            const [name, date, time, event, notes] = line.split("|");
            entries.push({ name, date, time, event, notes });
        });

        localStorage.setItem("entries", JSON.stringify(entries));
        renderTable();
    };

    reader.readAsText(file);
}


// ===============================
//   PDF ЗА ДЕНЬ
// ===============================
function exportDayPDF() {
    const selectedDate = document.getElementById("filterDate").value;

    if (!selectedDate) {
        alert("Выберите дату для экспорта");
        return;
    }

    const dayEntries = entries.filter(e => e.date === selectedDate);

    if (dayEntries.length === 0) {
        alert("Нет записей за выбранный день");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.addFileToVFS("DejaVuSans.ttf", DejaVuSans);
    doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
    doc.setFont("DejaVuSans", "normal");
    doc.setFontSize(14);

    let y = 20;

    doc.text(`Записи за ${selectedDate}`, 10, y);
    y += 10;

    dayEntries.forEach((e, index) => {
        doc.text(`${index + 1}. Имя: ${e.name}`, 10, y); y += 8;
        doc.text(`   Время: ${e.time}`, 10, y); y += 8;
        doc.text(`   Событие: ${e.event}`, 10, y); y += 8;
        doc.text(`   Комментарий:`, 10, y); y += 8;

        const notes = doc.splitTextToSize(e.notes, 180);
        doc.text(notes, 10, y);
        y += notes.length * 7 + 10;

        if (y > 270) {
            doc.addPage();
            y = 20;
        }
    });

    doc.save(`Записи_${selectedDate}.pdf`);
}


// ===============================
//   ПЕРВЫЙ РЕНДЕР
// ===============================
renderTable();

