// Dados do Formulário da Carta
const form = document.getElementById('form');
const name = document.getElementById('name');
const pre_evolution = document.getElementById('pre-evolution');
const type = document.getElementById('type');
const text = document.getElementById('text');
const username = document.getElementById('username');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const telegram = document.getElementById('telegram');

const notificationFields = document.getElementById('notification-fields');
const emailCheckbox = document.getElementById('email-checkbox');
const smsCheckbox = document.getElementById('sms-checkbox');
const telegramCheckbox = document.getElementById('telegram-checkbox');

form.addEventListener('submit', (event) => {
    event.preventDefault();
    checkInputs();
});

function checkInputs() {
    console.log('checkInputs');
    const nameValue = name.value.trim();
    const pre_evolutionValue = pre_evolution.value.trim();
    const typeValue = type.value;
    const textValue = text.value.trim();

    console.log(nameValue);
    console.log(pre_evolutionValue);
    console.log(typeValue);
    console.log(textValue);

    if (nameValue === '') {
        setErrorFor(name, 'Nome não pode estar em branco');
    } else {
       setSuccessFor(name);
    }

    if (pre_evolutionValue === '') {
        setErrorFor(pre_evolution, 'Pré-evolução não pode estar em branco');
    } else {
         setSuccessFor(pre_evolution);
    }

    if (typeValue === '') {
        setErrorFor(type, 'É necessário selecionar um tipo');
    } else {
        setSuccessFor(type);
    }

    if (textValue === '') {
        setErrorFor(text, 'Texto da carta não pode estar em branco');
    } else {
        setSuccessFor(text);
    }

    if (username.value === '') {
        setErrorFor(username, 'Nome de usuário não pode estar em branco');
    } else {
        setSuccessFor(username);
    }

    if (!emailCheckbox.checked || !smsCheckbox.checked || !telegramCheckbox.checked) {
        const errorText = notificationFields.querySelector('p');
        errorText.innerText = 'É necessário selecionar pelo menos uma forma de notificação';
        formItem.className = 'form-checkboxes error';
        console.log('Erro');
    } else {
        notificationFields.className = 'form-checkboxes';
    }
}

function setSuccessFor(input, className = 'form-content') {
    const formItem = input.parentElement;
    formItem.className = className;
}

function setErrorFor(input, message, className = 'form-content error') {
    const formItem = input.parentElement;
    const errorText = formItem.querySelector('p');

    errorText.innerText = message;

    formItem.className = className;
}
