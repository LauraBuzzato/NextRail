
# NextRail - Sistema de Visualização de Dados Ferroviários  

NextRail é um projeto acadêmico desenvolvido como parte da disciplina de **Pesquisa e Inovação I**, no curso de **Ciência da Computação** da **SPTech School**.  
O sistema tem como objetivo auxiliar no **gerenciamento e análise de dados ferroviários**, oferecendo uma interface organizada, segura e interativa para usuários.

---

## Objetivo do Projeto

> [!INFO]
> O setor ferroviário desempenha papel essencial na logística e transporte de cargas e passageiros.  
> O **NextRail** surge como uma ferramenta para apoiar o monitoramento e gestão de informações, proporcionando:
>
> - Cadastro e autenticação de usuários;  
> - Gestão de avisos e medições em tempo real;  
> - Visualização organizada e responsiva de dados;  
> - Base sólida para futuras análises gráficas e dashboards.  

---

## Funcionalidades

> [!INFO]
> O projeto já conta com as seguintes funcionalidades implementadas:
>
> - Página inicial de apresentação do sistema;  
> - Cadastro e login de usuários com persistência em banco de dados;  
> - CRUD de avisos e medições;  
> - Estrutura modular com **routes**, **controllers** e **models**;  
> - Configuração de ambientes (desenvolvimento/produção);  
> - Backend funcional em Node.js integrado a MySQL;  
> - Design responsivo em HTML5 e CSS3.  

---

## Tecnologias Utilizadas

> [!NOTE]
> - **HTML5** → Estrutura do front-end.  
> - **CSS3** → Estilização e layout responsivo.  
> - **JavaScript (ES6+)** → Interatividade e manipulação de dados.  
> - **Node.js + Express** → Backend e API REST.  
> - **MySQL** → Banco de dados relacional.  
> - **dotenv** → Configuração de variáveis de ambiente.  

---

## Como Executar o Projeto

### 1. Clonar o repositório
```bash
git clone https://github.com/igor-trindade/NextRail.git
cd NextRail
````

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar ambiente

No arquivo `app.js`, selecione o ambiente:

```js
// Produção (remoto)
// var ambiente_processo = 'producao';

// Desenvolvimento (local)
var ambiente_processo = 'desenvolvimento';
```

### 4. Criar tabelas no banco

Execute o script localizado em:

```
/src/database/script-tabelas.sql
```

### 5. Configurar variáveis de ambiente

Edite o arquivo `.env` com credenciais de banco e porta.

### 6. Executar servidor

```bash
npm start
```

---

## Estrutura do Projeto

```plaintext
NextRail/
├── public/              # Arquivos estáticos (HTML, CSS, JS)
├── src/
│   ├── database/        # Script de tabelas e configuração DB
│   ├── controllers/     # Lógica de negócio
│   ├── models/          # Modelos de dados
│   └── routes/          # Definição das rotas
├── app.js               # Arquivo principal do servidor
├── package.json         # Dependências e scripts NPM
└── README.md            # Documentação do projeto
```

---

## Próximos Passos

> \[!IMPORTANT]
>
> * Melhorar design responsivo e experiência do usuário;
> * Implementar dashboards com gráficos interativos (ex.: Chart.js);
> * Criar painel administrativo com níveis de acesso;
> * Futuras integrações com APIs externas para dados ferroviários.

---

## Sobre o Projeto

Este projeto foi desenvolvido como prática acadêmica, simulando um sistema de apoio ao setor ferroviário.
Combinando **front-end, back-end, autenticação e persistência em banco relacional**, o NextRail oferece uma base sólida para expansão de funcionalidades em cenários reais.

---

## Créditos

**Curso:** Ciência da Computação
**Instituição:** SPTech School
**Disciplina:** Pesquisa e Inovação I

> \[!NOTE]
> **Integrantes do grupo:**
>
> * Igor Trindade
> * Felipe Hideki
> * Lucas Hideo
> * Guilherme Aoki
> * Bianca Ortega
> * Kheyla Thais
> * Enrico Faraldo
> * Enzo Servilha
> * Laura Buzzato
> * Pedro Giraldi
> * Pedro Martins

---

## Licença

> \[!WARNING]
> Este projeto é de uso **educacional** e sem fins comerciais.
> Todos os direitos reservados aos autores.
