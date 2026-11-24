const FINANCIAL_TIPS = [
  {
    category: 'Orçamento',
    title: 'Defina limites por categoria',
    text: 'Use seus registros recentes para escolher um limite mensal realista para cada grupo de despesas. Revise o limite quando sua renda ou rotina mudar.'
  },
  {
    category: 'Controle de gastos',
    title: 'Registre as despesas pequenas',
    text: 'Compras de baixo valor também compõem o orçamento. Anote-as perto do momento da compra para reduzir esquecimentos e enxergar o total no fim do mês.'
  },
  {
    category: 'Compras conscientes',
    title: 'Espere antes de uma compra não planejada',
    text: 'Para uma compra que não seja urgente, espere um período curto e compare o preço com outras opções. Isso ajuda a separar necessidade de impulso.'
  },
  {
    category: 'Planejamento',
    title: 'Separe despesas fixas e variáveis',
    text: 'Liste primeiro compromissos recorrentes e depois estime os gastos que variam. Essa ordem ajuda a identificar quanto do orçamento ainda pode ser destinado a outros objetivos.'
  },
  {
    category: 'Metas',
    title: 'Transforme um objetivo em etapas',
    text: 'Defina um valor total e um prazo possível. Dividir o valor restante em contribuições periódicas torna o progresso mais fácil de acompanhar.'
  },
  {
    category: 'Revisão',
    title: 'Faça uma revisão semanal breve',
    text: 'Confira lançamentos pendentes, corrija categorias e compare os gastos com seu planejamento. Uma revisão curta evita acumular registros imprecisos.'
  }
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('financialTips');
  if (!container) {
    return;
  }

  const insight = document.getElementById('financialInsight');
  const largestCategory = getExpenseCategoryTotals()[0];
  if (largestCategory) {
    insight.textContent = `Sugestão automática baseada nos seus lançamentos: ${largestCategory.name} representa ${largestCategory.percentage.toFixed(1)}% das despesas registradas. Revise os lançamentos dessa categoria e avalie se algum gasto pode ser planejado de outra forma.`;
  } else {
    insight.textContent = 'Ainda não há despesas suficientes para gerar uma sugestão baseada nos seus dados. Registre movimentações para habilitar essa análise.';
  }

  const groups = new Map();
  FINANCIAL_TIPS.forEach((tip) => {
    if (!groups.has(tip.category)) {
      groups.set(tip.category, []);
    }
    groups.get(tip.category).push(tip);
  });

  groups.forEach((tips, category) => {
    const section = document.createElement('section');
    section.className = 'content-card';
    const heading = document.createElement('div');
    heading.className = 'card-header';
    const title = document.createElement('h2');
    title.textContent = category;
    heading.appendChild(title);
    section.appendChild(heading);

    const list = document.createElement('div');
    list.className = 'tip-list';
    tips.forEach((tip) => {
      const card = document.createElement('article');
      card.className = 'tip-card';
      const tipTitle = document.createElement('h3');
      tipTitle.textContent = tip.title;
      const text = document.createElement('p');
      text.textContent = tip.text;
      card.append(tipTitle, text);
      list.appendChild(card);
    });
    section.appendChild(list);
    container.appendChild(section);
  });
});
