# Python Module - Raspagem de dados Pokemon TCG

Este documento fornece instruções sobre como configurar e usar um ambiente virtual (`venv`) para rodar o script `scrape.py` no seu projeto. 

## Requisitos

- [Python](https://www.python.org/downloads/) instalado no seu sistema.
- [pip](https://pip.pypa.io/en/stable/) para gerenciar pacotes Python.

## Passos para Configuração e Execução

### 1. **Clonar o Repositório**

Se ainda não tiver o projeto, clone o repositório para o seu diretório local:

```bash
git clone <URL_DO_REPOSITÓRIO>
cd nome_do_repositório
```

Substitua `<URL_DO_REPOSITÓRIO>` pelo URL do repositório e `nome_do_repositório` pelo nome da pasta do projeto.

### 2. **Criar o Ambiente Virtual**

Navegue para o diretório do projeto e crie um novo ambiente virtual. Substitua `venv` pelo nome desejado para o ambiente virtual, se preferir.

```bash
python -m venv venv
```

### 3. **Ativar o Ambiente Virtual**

- **No Windows (PowerShell):**

  ```powershell
  .\venv\Scripts\Activate
  ```

- **No Windows (Prompt de Comando):**

  ```cmd
  venv\Scripts\activate
  ```

- **No macOS/Linux:**

  ```bash
  source venv/bin/activate
  ```

### 4. **Instalar as Dependências**

Com o ambiente virtual ativado, instale as dependências necessárias usando o arquivo `requirements.txt`. Execute:

```bash
pip install -r requirements.txt
```

### 5. **Executar o Script**

Agora você pode executar o script `scrape.py`:

```bash
python scripts/scrape.py
```

### 6. **Desativar o Ambiente Virtual**

Depois de terminar, você pode desativar o ambiente virtual com o comando:

```bash
deactivate
```

## Estrutura do Projeto

- `venv/` - Diretório do ambiente virtual.
- `scripts/` - Diretório contendo o script `scrape.py`.
- `requirements.txt` - Arquivo com as dependências do projeto.
- `data/` - Diretório onde os dados raspados são salvos.

## Troubleshooting

- **Ambiente Virtual Não Encontrado:** Certifique-se de que você está no diretório correto e que o ambiente virtual foi criado corretamente.
- **Problemas com Dependências:** Verifique o arquivo `requirements.txt` para garantir que todas as dependências estejam listadas corretamente e instale-as novamente se necessário.

Se você encontrar algum problema ou precisar de assistência adicional, sinta-se à vontade para abrir uma issue no repositório ou consultar a documentação oficial do [Python](https://docs.python.org/3/library/venv.html).

```

Esse `README.md` cobre os principais passos para configurar e usar o ambiente virtual para executar o script. Ajuste conforme necessário para se adequar ao seu projeto específico.