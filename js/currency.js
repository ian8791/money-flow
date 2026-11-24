const EXCHANGE_API_URL = 'https://api.frankfurter.dev/v2/rate';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('currencyForm');
  if (!form) {
    return;
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    convertCurrency();
  });

  document.getElementById('reverseCurrencies').addEventListener('click', () => {
    const from = document.getElementById('currencyFrom');
    const to = document.getElementById('currencyTo');
    [from.value, to.value] = [to.value, from.value];
    convertCurrency();
  });

  document.getElementById('retryCurrency').addEventListener('click', convertCurrency);
});

async function convertCurrency() {
  const amount = Number(document.getElementById('currencyAmount').value);
  const from = document.getElementById('currencyFrom').value;
  const to = document.getElementById('currencyTo').value;
  const result = document.getElementById('currencyResult');
  const status = document.getElementById('currencyStatus');
  const rateDetails = document.getElementById('currencyRate');
  const updatedAt = document.getElementById('currencyUpdatedAt');
  const convertButton = document.getElementById('convertCurrency');

  if (!Number.isFinite(amount) || amount <= 0 || !from || !to) {
    status.textContent = 'Informe um valor positivo e selecione as duas moedas.';
    result.textContent = 'Aguardando valores válidos.';
    return;
  }

  convertButton.disabled = true;
  status.textContent = 'Consultando a cotação de referência...';
  result.textContent = 'Carregando';
  rateDetails.textContent = '';
  updatedAt.textContent = '';

  try {
    let rate;
    let quoteDate = '';

    if (from === to) {
      rate = 1;
    } else {
      const response = await fetch(`${EXCHANGE_API_URL}/${encodeURIComponent(from.toLowerCase())}/${encodeURIComponent(to.toLowerCase())}`);
      if (!response.ok) {
        throw new Error(`A fonte de câmbio respondeu com status ${response.status}.`);
      }

      const quote = await response.json();
      if (!Number.isFinite(quote.rate) || quote.rate <= 0 || !quote.date) {
        throw new Error('A resposta da fonte não contém uma cotação válida.');
      }
      rate = quote.rate;
      quoteDate = quote.date;
    }

    const convertedAmount = amount * rate;
    result.textContent = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: to
    }).format(convertedAmount);
    rateDetails.textContent = `Taxa utilizada: 1 ${from} = ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(rate)} ${to}`;
    updatedAt.textContent = from === to
      ? 'As moedas são iguais; não foi necessária uma cotação externa.'
      : `Data da taxa publicada: ${quoteDate}. Consulta realizada em ${new Date().toLocaleString('pt-BR')}.`;
    status.textContent = 'Estimativa baseada na taxa de referência da Frankfurter.';
  } catch (error) {
    result.textContent = 'Cotação indisponível';
    status.textContent = 'Não foi possível atualizar a cotação. Confira sua conexão e tente novamente.';
    rateDetails.textContent = '';
    updatedAt.textContent = '';
    console.error('Falha ao consultar cotação:', error);
  } finally {
    convertButton.disabled = false;
  }
}
