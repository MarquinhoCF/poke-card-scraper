const form = document.getElementById('form');
const name = document.getElementsByName('name')[0];
const pre_evolution = document.getElementsByName('pre-evolution')[0];
const type = document.getElementsByName('type')[0];
const text = document.getElementsByName('text')[0];

form.addEventListener('submit', (event) => {
    event.preventDefault();
    checkInputs();
});

function checkInputs() {
    console.log('checkInputs');
    const nameValue = name.value.trim();
    const pre_evolutionValue = pre_evolution.value.trim();
    const typeValue = type.value;  // O select não precisa de trim()
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
}

function setSuccessFor(input) {
    const formItem = input.parentElement;
    formItem.className = 'form-content';
}

function setErrorFor(input, message) {
    console.log('setErrorFor');
    const formItem = input.parentElement;
    const errorText = formItem.querySelector('p');

    errorText.innerText = message;

    formItem.className = 'form-content error';
}
