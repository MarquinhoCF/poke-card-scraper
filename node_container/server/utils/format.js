function formatTimestamp(timestamp) {
    const [datePart, timePart] = timestamp.split('_');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split('-').map(Number);

    return `${hours}:${minutes} da data ${day}/${month}/${year}`;
}

module.exports = formatTimestamp;