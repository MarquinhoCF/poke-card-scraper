// Elementos referentes aos Dados da Carta TCG
const form = document.getElementById('form');
const name = document.getElementById('name');
const preEvolution = document.getElementById('pre-evolution');
const type = document.getElementById('type');
const text = document.getElementById('text');

// Elementos referentes ao Usuário
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');

// Elemento que envolve as checkboxes e campos de notificação
const formCheckboxes = document.getElementById('form-checkboxes');
const emailCheckbox = document.getElementById('email-checkbox');
const smsCheckbox = document.getElementById('sms-checkbox');
const telegramCheckbox = document.getElementById('telegram-checkbox');
const notificationFields = document.getElementById('notification-container');
const emailField = document.getElementById('email-field');
const phoneField = document.getElementById('phone-field');
const countryCodeSelect = document.getElementById('country-code');

// Inicializa os eventos
document.addEventListener('DOMContentLoaded', () => {
    emailCheckbox.addEventListener('change', updateNotificationFields);
    smsCheckbox.addEventListener('change', updateNotificationFields);
    telegramCheckbox.addEventListener('change', updateNotificationFields);
    phone.addEventListener('input', handlePhoneInput);
});

// Atualiza os campos de notificação quando as checkboxes são marcadas
function updateNotificationFields() {
    const anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;
    const anyCheckedPhone = smsCheckbox.checked || telegramCheckbox.checked;
    
    toggleDisplay(notificationFields, anyChecked);
    toggleDisplay(emailField, emailCheckbox.checked);
    toggleDisplay(phoneField, anyCheckedPhone);
}

// Mostra e esconde o input conforme valor da checkbox e reseta o input
function toggleDisplay(element, show) {
    element.classList.toggle('show', show);

    if (!show) {
        const input = element.querySelector('input');
        if (input) {
            input.value = '';
            element.classList.remove('error');
        }
    }
}

// Formata a entrada de telefone com base no código do país
function handlePhoneInput() {
    let value = phone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    const countryCode = countryCodeSelect.value;
    let formattedValue = '';

    switch (countryCode) {
        case '+55': // Brasil
            formattedValue = formatBrazilPhone(value);
            break;
        case '+1': // EUA
            formattedValue = formatUSPhone(value);
            break;
        default:
            formattedValue = value; // Caso padrão para códigos não suportados
    }

    phone.value = formattedValue;
}

// Formata o número de telefone brasileiro
function formatBrazilPhone(value) {
    if (value.length <= 11) {
        return value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
    }
    return value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3').slice(0, 13);
}

// Formata o número de telefone dos EUA
function formatUSPhone(value) {
    if (value.length <= 10) {
        return value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').slice(0, 12);
}

// Evento para checar os valores do input ao submeter o formulário
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameValue = name.value.trim();
    const preEvolutionValue = preEvolution.value.trim();
    const typeValue = type.value;
    const textValue = text.value.trim();
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();

    if (checkInputs(nameValue, preEvolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue)) {
        alert(
            `Nome: ${nameValue}\nPré-evolução: ${preEvolutionValue}\nTipo: ${typeValue}\nTexto: ${textValue}\nNome de usuário: ${usernameValue}\nE-mail: ${emailValue}\nTelefone: ${phoneValue}\nMétodos de notificação: ${getCheckedNotifications()}`
        );
    }
    updateNotificationFields();
});

// Verifica os inputs do formulário
function checkInputs(nameValue, preEvolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue) {
    let isValid = true;
    const anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;
    
    isValid &= validateInput(name, nameValue, 'Nome não pode estar em branco');
    isValid &= validateInput(preEvolution, preEvolutionValue, 'Pré-evolução não pode estar em branco');
    isValid &= validateInput(type, typeValue, 'Tipo não pode estar em branco');
    isValid &= validateInput(text, textValue, 'Texto da carta não pode estar em branco');
    isValid &= validateInput(username, usernameValue, 'Nome de usuário não pode estar em branco');
    isValid &= validateCheckboxes(anyChecked);
    isValid &= validateNotificationFields(anyChecked, emailValue, phoneValue);

    return isValid;
}

// Valida um input individual
function validateInput(input, value, errorMessage) {
    if (value === '') {
        setErrorFor(input, errorMessage);
        return false;
    } else {
        setSuccessFor(input);
        return true;
    }
}

// Valida se pelo menos uma checkbox foi marcada
function validateCheckboxes(anyChecked) {
    if (!anyChecked) {
        setErrorFor(formCheckboxes.querySelector('small'), 'É necessário selecionar pelo menos uma forma de notificação', 'form-checkboxes error');
        return false;
    } else {
        formCheckboxes.classList.remove('error');
        return true;
    }
}

// Valida os campos de notificação
function validateNotificationFields(anyChecked, emailValue, phoneValue) {
    let isValid = true;

    if (anyChecked) {
        if (emailCheckbox.checked) {
            isValid &= validateInput(email, emailValue, 'E-mail não pode estar em branco');
        }
        if (smsCheckbox.checked || telegramCheckbox.checked) {
            isValid &= validateInput(phone.parentElement, phoneValue, 'Telefone não pode estar em branco');
            if (isValid) {
                isValid &= validatePhoneNumber();
            }
        }
    }

    return isValid;
}

// Valida o número de telefone com base no código do país
function validatePhoneNumber() {
    const value = phone.value.replace(/\D/g, '');
    const countryCode = countryCodeSelect.value;
    let valid = true;

    switch (countryCode) {
        case '+55': // Brasil
            valid = (value.length === 11);
            break;
        case '+1': // EUA
            valid = (value.length === 10);
            break;
        default:
            valid = false; // Caso padrão para códigos não suportados
    }

    if (valid) {
        setSuccessFor(phone.parentElement, 'form-content-notifications');
    } else {
        setErrorFor(phone.parentElement, 'Telefone inválido', 'form-content-notifications error');
    }

    return valid;
}

// Define a mensagem de erro para um input
function setErrorFor(input, message, className = 'form-content error') {
    const formItem = input.parentElement;
    const errorText = formItem.querySelector('small');

    errorText.innerText = message;
    formItem.className = className;
}

// Define o estilo de sucesso para um input
function setSuccessFor(input, className = 'form-content') {
    const formItem = input.parentElement;
    formItem.className = className;
}

// Retorna os métodos de notificação selecionados
function getCheckedNotifications() {
    const methods = [];
    if (emailCheckbox.checked) methods.push('E-mail');
    if (smsCheckbox.checked) methods.push('SMS');
    if (telegramCheckbox.checked) methods.push('Telegram');
    return methods.join(', ');
}
