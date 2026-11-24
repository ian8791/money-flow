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
- personalização individual da cor de destaque do perfil;
- gráficos interativos com detalhes por categoria e período;
- acompanhamento de despesas por categoria, total e percentual;
- metas financeiras e caixinhas de controle interno;
- dicas de organização financeira, incluindo uma leitura automática dos gastos;
- conversor de moedas com taxas de referência atuais da API Frankfurter;
- persistência de dados no navegador.

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript puro (Vanilla JavaScript)
- LocalStorage
- Arrays e objetos JavaScript
- Canvas 2D para gráficos interativos
- Intl para formatação de moeda e datas
- API pública Frankfurter para taxas de câmbio (sem chave; requer internet)

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
│   ├── relatorios.html
│   ├── perfil.html
│   ├── metas.html
│   ├── dicas.html
│   └── conversor.html
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
│   ├── reports.js
│   ├── profile.js
│   ├── goals.js
│   ├── tips.js
│   └── currency.js
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
- Consulte e compare o histórico dos meses com movimentações registradas.
- Consulte totais e percentuais por categoria e filtre a análise por mês.

### Perfil

- Escolha uma cor de destaque entre opções prontas ou use o seletor personalizado.
- A cor afeta elementos de identificação e destaque sem substituir o tema claro/escuro.
- A preferência fica salva por conta no LocalStorage e pode ser restaurada ao padrão.

### Metas e caixinhas

- Crie, edite e exclua objetivos, com descrição, valor desejado, valor reservado e prazo opcional.
- Adicione ou retire valores, acompanhe o progresso e identifique metas concluídas ou valores excedentes.
- Os valores são controles internos do MoneyFlow: não movimentam uma conta bancária e não criam receitas/despesas no histórico.

### Dicas de economia

- Consulte orientações agrupadas sobre orçamento, despesas, planejamento e metas.
- A página também apresenta uma sugestão automática baseada na categoria com maior participação nas despesas registradas. Ela não é uma recomendação de investimento.

### Conversor de moedas

- Informe valor e moedas de origem/destino, inverta o par e consulte a conversão estimada.
- A página consulta `https://api.frankfurter.dev/v2/rate/{origem}/{destino}`. Não exige chave, mas depende de conexão com a internet.
- Exibe a taxa usada, a data publicada pela fonte e o horário local da consulta. As taxas são referências diárias e podem diferir do valor final de bancos/casas de câmbio.
- Se a API estiver indisponível, a tela informa a falha e não inventa nem reutiliza uma taxa sem data.

## Armazenamento de dados

Os dados são mantidos no LocalStorage do navegador. O sistema grava:

- usuários cadastrados;
- usuário conectado;
- categorias;
- movimentações;
- preferências do sistema (tema);
- preferências de perfil por usuário (`moneyflow_profiles`);
- metas por usuário (`moneyflow_goals`).

As chaves antigas de usuários, sessão, categorias, movimentações e tema continuam inalteradas. Metas e preferências usam chaves próprias e cada registro recebe o ID do usuário atual. A separação é feita no navegador e não constitui controle de segurança de servidor. O conversor não armazena cotações: uma falha de rede não exibe uma taxa antiga ou fictícia.

## Gráficos e atualização dos dados

Os gráficos continuam usando Canvas 2D, sem biblioteca externa. Passe o mouse ou toque/clique em um elemento para consultar os valores e percentuais; nos gráficos mensais são exibidos receitas e despesas do mês. Ao alterar transações ou categorias, as telas de dashboard/relatórios atualizam seus dados ao recarregar e também respondem a alterações de armazenamento/eventos enquanto abertas.

## Limitações conhecidas

- A aplicação segue sem backend e sem banco remoto; os dados locais não sincronizam entre dispositivos e podem ser apagados pelo navegador.
- A autenticação existente continua local. Não use o sistema para guardar credenciais ou informações financeiras sensíveis em produção.
- Metas representam valores reservados para planejamento, não saldo bancário bloqueado ou transferência real.
- O conversor depende da disponibilidade da API Frankfurter e de conexão de rede; as taxas são de referência, não intradiárias nem garantias de cotação comercial.
- As dicas são educativas e a personalização automática é uma leitura simples das movimentações cadastradas, não aconselhamento financeiro individual.

## Integrantes

- Bruno Lima Cavalcanti
- Ian Richard

## Disciplina

Desenvolvimento de Sistemas Web II

Faculdade da AESA – Autarquia de Ensino Superior de Arcoverde
