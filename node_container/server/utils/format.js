function formatTimestamp(timestamp) {
    const [datePart, timePart] = timestamp.split('_');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split('-').map(Number);

    return `${hours}:${minutes} da data ${day}/${month}/${year}`;
}

function formatPhoneNumber(phoneNumber) {
    // Remove todos os caracteres que não são dígitos
    return phoneNumber.replace(/(?!^\+)[^\d]/g, '');
}

module.exports = {
    formatTimestamp,
    formatPhoneNumber
};