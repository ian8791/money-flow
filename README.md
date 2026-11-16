# MoneyFlow

MoneyFlow é um sistema de controle financeiro pessoal desenvolvido com HTML5, CSS3 e JavaScript puro, utilizando LocalStorage para persistência dos dados no navegador. O objetivo é permitir o cadastro de receitas e despesas, acompanhamento de saldo, organização por categorias e geração de relatórios financeiros.

## Objetivo

Organizar a vida financeira do usuário com uma interface moderna, intuitiva e responsiva, oferecendo:

- cadastro de usuários e autenticação local;
- controle de receitas e despesas;
- cálculo automático de saldo e totais;
- filtros, pesquisa e ordenação de movimentações;
- cadastro e gestão de categorias;
- relatórios mensais e comparativos;
- persistência de dados no navegador.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro (Vanilla JavaScript)
- LocalStorage
- Arrays e objetos JavaScript

## Estrutura de arquivos

```text
MoneyFlow/
├── index.html
├── pages/
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── movimentacoes.html
│   ├── categorias.html
│   └── relatorios.html
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── dashboard.css
│   └── responsive.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── storage.js
│   ├── transactions.js
│   ├── categories.js
│   ├── dashboard.js
│   └── reports.js
├── assets/
│   ├── images/
│   └── icons/
├── README.md
└── .gitignore
```

## Como executar

1. Baixe ou clone o projeto.
2. Abra a pasta do projeto no VS Code.
3. Inicie um servidor local simples, por exemplo:

```bash
python -m http.server 8000
```

4. Acesse `http://localhost:8000` no navegador.

> O sistema também funciona ao abrir o arquivo `index.html` diretamente, porém o uso de um servidor local é recomendado para uma experiência mais estável.

## Como utilizar

### Cadastro e login

- Acesse a tela de cadastro para criar um usuário.
- Informe nome completo, e-mail e senha.
- Faça login com suas credenciais.
- O sistema depende do LocalStorage e mantém cada usuário separadamente.

### Dashboard

- Visualize saldo total, receitas, despesas e quantidade de movimentações.
- Consulte os gráficos e o histórico recente.
- Os valores são calculados automaticamente.

### Movimentações

- Cadastre receitas e despesas.
- Edite ou exclua qualquer registro.
- Use filtros por descrição, tipo, categoria e período.
- Ordene por valor ou data.

### Categorias

- Crie categorias personalizadas por tipo.
- Defina cor e ícone.
- Exclua categorias que não estejam em uso.

### Relatórios

- Analise receitas e despesas mensais.
- Consulte o saldo mensal e a distribuição por categoria.
- Compare o período atual com meses anteriores.

## Armazenamento de dados

Os dados são mantidos no LocalStorage do navegador. O sistema grava:

- usuários cadastrados;
- usuário conectado;
- categorias;
- movimentações;
- preferências do sistema (tema).

Cada usuário acessa somente suas próprias informações.

## Integrantes

- Bruno Lima Cavalcanti
- Ian Richard

## Disciplina

Desenvolvimento de Sistemas Web II

Faculdade da AESA – Autarquia de Ensino Superior de Arcoverde
