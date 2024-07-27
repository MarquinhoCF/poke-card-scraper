// Elementos referentes aos Dados da Carta TCG
const form = document.getElementById('form');
const name = document.getElementById('name');
const pre_evolution = document.getElementById('pre-evolution');
const type = document.getElementById('type');
const text = document.getElementById('text');

// Elementos referentes ao Usuário
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');

// Elemento que envolve as checkboxes
const formCheckboxes = document.getElementById('form-checkboxes');

// Elementos das checkboxes
const emailCheckbox = document.getElementById('email-checkbox');
const smsCheckbox = document.getElementById('sms-checkbox');
const telegramCheckbox = document.getElementById('telegram-checkbox');

// Elemento que envolve os campos que definem os métodos de notificação
const notificationFields = document.getElementById('notification-container');

// Elementos dos campos de notificação
const emailField = document.getElementById('email-field');
const phoneField = document.getElementById('phone-field');

// Elemento do select do código do país
const countryCodeSelect = document.getElementById('country-code');

// Evento para atualizar os campos de notificação quando as checkboxes são marcadas
document.addEventListener('DOMContentLoaded', () => {
    emailCheckbox.addEventListener('change', updateNotificationFields);
    smsCheckbox.addEventListener('change', updateNotificationFields);
    telegramCheckbox.addEventListener('change', updateNotificationFields);
    phone.addEventListener('input', handlePhoneInput); 
});

// Lógica para atualizar os campos de notificação no formulário
function updateNotificationFields() {
    let anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;
    let anyCheckedPhone = smsCheckbox.checked || telegramCheckbox.checked;
    
    notificationFields.classList.toggle('show', anyChecked);
    
    toggleValue(emailCheckbox.checked, emailField);
    toggleValue(anyCheckedPhone, phoneField);
}

// Mostra e esconde o input conforme valor da checkbox e cuida para resetar o input
function toggleValue(checked, field) {
    field.classList.toggle('show', checked);

    if (!checked) {
        let input = field.querySelector('input');
        if (input) {
            input.value = '';
            field.className = 'form-content-notifications';
        }
    }
}

function handlePhoneInput() {
    let value = phone.value.replace(/\D/g, ''); // Remove todos os caracteres não numéricos
    let formattedValue = '';
    const countryCode = countryCodeSelect.value;

    switch (countryCode) {
        case '+55': // Brasil
            if (value.length <= 11) {
                formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3');
            } else {
                formattedValue = value.replace(/(\d{2})(\d{5})(\d{4})/, '$1 $2-$3').slice(0, 13);
            }
            break;
        case '+1': // EUA
            if (value.length <= 10) {
                formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
            } else {
                formattedValue = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3').slice(0, 12);
            }
            break;
        default:
            formattedValue = value; // Caso padrão para códigos não suportados
    }

    phone.value = formattedValue;
}

// Evento para checar os valores do input
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameValue = name.value.trim();
    const pre_evolutionValue = pre_evolution.value.trim();
    const typeValue = type.value;
    const textValue = text.value.trim();
    const usernameValue = username.value.trim();
    const emailValue = email.value.trim();
    const phoneValue = phone.value.trim();

    if (checkInputs(nameValue, pre_evolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue)) {
        alert(
            `
            Nome: ${nameValue}
            Pré-evolução: ${pre_evolutionValue}
            Tipo: ${typeValue}
            Texto: ${textValue}
            Nome de usuário: ${usernameValue}
            E-mail: ${emailValue}
            Telefone: ${phoneValue}
            Métodos de notificação: ${emailCheckbox.checked ? 'E-mail' : ''} ${smsCheckbox.checked ? 'SMS' : ''} ${telegramCheckbox.checked ? 'Telegram' : ''}
            `
        );
    }
    updateNotificationFields();
});

// Função para checar os valores do input
function checkInputs(nameValue, pre_evolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue) {
    let isInvalid = true;
    let anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;

    if (nameValue === '') {
        setErrorFor(name, 'Nome não pode estar em branco');
        isInvalid = false;
    } else {
       setSuccessFor(name);
    }

    if (pre_evolutionValue === '') {
        setErrorFor(pre_evolution, 'Pré-evolução não pode estar em branco');
        isInvalid = false;
    } else {
        setSuccessFor(pre_evolution);
    }

    if (textValue === '') {
        setErrorFor(text, 'Texto da carta não pode estar em branco');
        isInvalid = false;
    } else {
        setSuccessFor(text);
    }

    if (usernameValue === '') {
        setErrorFor(username, 'Nome de usuário não pode estar em branco');
        isInvalid = false;
    } else {
        setSuccessFor(username);
    }

    // O usuário pode escolher os modos de notificação
    // Mas pelo menos um deve ser escolhido
    if (!anyChecked) {
        const errorText = formCheckboxes.querySelector('small');
        errorText.innerText = 'É necessário selecionar pelo menos uma forma de notificação';
        formCheckboxes.className = 'form-checkboxes error';
        isInvalid = false;
    } else {
        formCheckboxes.className = 'form-checkboxes';
    }

    if (anyChecked) {
        if (emailCheckbox.checked && emailValue === '') {
            setErrorFor(email, 'E-mail não pode estar em branco', 'form-content-notifications error');
            isInvalid = false;
        } else {
            setSuccessFor(email, 'form-content-notifications');
        }

        if ((smsCheckbox.checked || telegramCheckbox.checked) && phoneValue === '') {
            setErrorFor(phone.parentElement, 'Telefone não pode estar em branco', 'form-content-notifications error');
            isInvalid = false;
        } else {
            validatePhoneNumber();
        }
    }

    return isInvalid;
}

function validatePhoneNumber() {
    let value = phone.value.replace(/\D/g, '');
    const countryCode = countryCodeSelect.value;

    let valid = true;
    switch (countryCode) {
        case '+55': // Brasil
            if (value.length !== 11) valid = false;
            break;
        case '+1': // EUA
            if (value.length !== 10) valid = false;
            break;
        default:
            valid = false; // Caso padrão para códigos não suportados
    }

    if (valid) {
        setSuccessFor(phone.parentElement, 'form-content-notifications');
    } else {
        setErrorFor(phone.parentElement, 'Telefone inválido', 'form-content-notifications error');
    }
}

// Altera o estilo para representar um valor inválido
function setErrorFor(input, message, className = 'form-content error') {
    const formItem = input.parentElement;
    const errorText = formItem.querySelector('small');

    errorText.innerText = message;

    formItem.className = className;
}

// Altera o estilo de volta para representar um valor válido
function setSuccessFor(input, className = 'form-content') {
    const formItem = input.parentElement;
    formItem.className = className;
}