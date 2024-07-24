// Elementos referentes aos Dados da Carta TCG
const form = document.getElementById('form');
const name = document.getElementById('name');
const pre_evolution = document.getElementById('pre-evolution');
const type = document.getElementById('type');
const text = document.getElementById('text');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const telegram = document.getElementById('telegram');

// Elemento que envolve as checkboxes
const formCheckboxes = document.getElementById('form-checkboxes');

// Elementos das checkboxes
const emailCheckbox = document.getElementById('email-checkbox');
const smsCheckbox = document.getElementById('sms-checkbox');
const telegramCheckbox = document.getElementById('telegram-checkbox');

// Elemento que envolve os campos que definem os métodos de notificação
const notificationFields = document.getElementById('notification-fields');

// Campos dos métodos de notificação
const emailField = document.getElementById('email-field');
const smsField = document.getElementById('sms-field');
const telegramField = document.getElementById('telegram-field');

// Evento para atualizar os campos de notificação quando as checkboxes são marcadas
document.addEventListener('DOMContentLoaded', () => {
    emailCheckbox.addEventListener('change', updateNotificationFields);
    smsCheckbox.addEventListener('change', updateNotificationFields);
    telegramCheckbox.addEventListener('change', updateNotificationFields);

    updateNotificationFields();
});

// Lógica para atualizar os campos de notificação no formulário
function updateNotificationFields() {
    let anyChecked = emailCheckbox.checked || smsCheckbox.checked || telegramCheckbox.checked;

    notificationFields.classList.toggle('show', anyChecked);

    emailField.classList.toggle('show', emailCheckbox.checked);
    smsField.classList.toggle('show', smsCheckbox.checked);
    telegramField.classList.toggle('show', telegramCheckbox.checked);
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
    const telegramValue = telegram.value.trim();

    if (checkInputs(nameValue, pre_evolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue, telegramValue)) {
        console.log(nameValue);
        console.log(pre_evolutionValue);
        console.log(typeValue);
        console.log(textValue);
        console.log(usernameValue);
        console.log(emailValue);
        console.log(phoneValue);
        console.log(telegramValue);
    }
    updateNotificationFields();
});


// Função para checar os valores do input
function checkInputs(nameValue, pre_evolutionValue, typeValue, textValue, usernameValue, emailValue, phoneValue, telegramValue) {
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

    if (typeValue === '') {
        setErrorFor(type, 'É necessário selecionar um tipo');
        isInvalid = false;
    } else {
        setSuccessFor(type);
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
        const errorText = formCheckboxes.querySelector('p');
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

        if (smsCheckbox.checked && phoneValue === '') {
            setErrorFor(phone, 'Telefone não pode estar em branco', 'form-content-notifications error');
            isInvalid = false;
        } else {
            setSuccessFor(phone, 'form-content-notifications');
        }

        if (telegramCheckbox.checked && telegramValue === '') {
            setErrorFor(telegram, 'Telegram não pode estar em branco', 'form-content-notifications error');
            isInvalid = false;
        } else {
            setSuccessFor(telegram, 'form-content-notifications');
        }
    }

    return isInvalid;
}

// Altera o estilo para representar um valor inválido
function setErrorFor(input, message, className = 'form-content error') {
    const formItem = input.parentElement;
    const errorText = formItem.querySelector('p');

    errorText.innerText = message;

    formItem.className = className;
}

// Altera o estilo de volta para representar um valor válido
function setSuccessFor(input, className = 'form-content') {
    const formItem = input.parentElement;
    formItem.className = className;
}