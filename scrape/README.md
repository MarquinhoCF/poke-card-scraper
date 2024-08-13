## Ao usar o Script Python pela primeira vez

1. Criar e ativar ambiente virtual do Python

```shell script
python -m venv venv
Set-ExecutionPolicy Unrestricted -Scope Process
.\venv\Scripts\activate
```

2. Instalar as dependências

```shell script
python -m pip install -r requirements.txt
```

3. No Linux: instalar `python-tk` para conseguir usar matplotlib

```shell script
sudo apt-get install python3-tk
```

# Sempre que usar o Script Python

1. Ativar ambiente virtual do Python

```shell script
Set-ExecutionPolicy Unrestricted -Scope Process
.\venv\Scripts\activate
```