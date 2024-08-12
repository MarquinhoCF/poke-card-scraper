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

function translateRarity(rarity) {
    switch (rarity) {
        case 'Common':
            return 'Comum';
        case 'Uncommon':
            return 'Incomum';
        case 'Double Rare':
            return 'Duplo Raro';
        case 'Hyper Rare':
            return 'Hiper Raro';
        case 'Ultra Rare':
            return 'Ultra Raro';
        case 'Secret Rare':
            return 'Secreto Raro';
        case 'Holo Rare':
            return 'Holo Raro';
        case 'Illustration Rare':
            return 'Ilustração Rara';
        case 'Special Illustration Rare':
            return 'Ilustração Especial Rara';
        case 'Rare BREAK':
            return 'Raro BREAK';
        case 'Code Card':
            return 'Carta de Código';
        default:
            return rarity; // Retorna a raridade original se não for encontrada uma correspondência
    }
}

function translateCondition(condition) {
    switch (condition) {
        case 'Near Mint':
            return 'Quase Novo';
        case 'Near Mint Holofoil':
            return 'Holofoil Quase Novo';
        case 'Near Mint Reverse Holofoil':
            return 'Holofoil Reverso Quase Novo';
        case 'Lightly Played':
            return 'Levemente Usado';
        case 'Lightly Played Holofoil':
            return 'Holofoil Levemente Usado';
        case 'Lightly Played Reverse Holofoil':
            return 'Holofoil Reverso Levemente Usado';
        case 'Moderately Played':
            return 'Moderadamente Usado';
        case 'Moderately Played Holofoil':
            return 'Holofoil Moderadamente Usado';
        case 'Moderately Played Reverse Holofoil':
            return 'Holofoil Reverso Moderadamente Usado';
        case 'Heavily Played':
            return 'Bastante Usado';
        case 'Heavily Played Holofoil':
            return 'Holofoil Bastante Usado';
        case 'Heavily Played Reverse Holofoil':
            return 'Holofoil Reverso Bastante Usado';
        case 'Damaged':
            return 'Danificado';
        case 'Damaged Holofoil':
            return 'Holofoil Danificado';
        case 'Damaged Reverse Holofoil':
            return 'Holofoil Reverso Danificado';
        default:
            return condition; // Retorna a condição original se não for encontrada uma correspondência
    }
}


module.exports = {
    formatTimestamp,
    formatPhoneNumber,
    translateRarity,
    translateCondition
};