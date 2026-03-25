async function exportDayPDF() {
    const { jsPDF } = window.jspdf;

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

    const doc = new jsPDF();

    // ВОТ СЮДА — сразу после создания doc
    doc.setFont("Roboto", "normal");

    doc.setFontSize(14);
