import axios from 'axios';

export async function fetchRates() {
  try {
    const [selicResponse, cdiResponse] = await Promise.all([
      axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'),
      axios.get('https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json'),
    ]);

    const selicPercent = parseFloat(selicResponse.data[0].valor.replace(',', '.'));
    const cdiPercent = parseFloat(cdiResponse.data[0].valor.replace(',', '.'));

    return {
      selic: selicPercent / 100, 
      cdi: cdiPercent / 100,
    };
  } catch (error) {
    console.error('Erro ao buscar taxas do Banco Central:', error);
    return {
      selic: 0.1325,
      cdi: 0.1325,
    };
  }
}
