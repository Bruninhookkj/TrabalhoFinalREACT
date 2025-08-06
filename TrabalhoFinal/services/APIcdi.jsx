import axios from 'axios';

export async function getTaxasBCB() {
  try {
    
    const selicRes = await axios.get(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json'
    );

    
    const cdiRes = await axios.get(
      'https://api.bcb.gov.br/dados/serie/bcdata.sgs.12/dados/ultimos/1?formato=json'
    );

    const selic = parseFloat(selicRes.data[0].valor.replace(',', '.')) / 100;
    const cdi = parseFloat(cdiRes.data[0].valor.replace(',', '.')) / 100;

    return { selic, cdi };
  } catch (error) {
    console.error('Erro ao buscar taxas do BCB:', error);
    
    return {
      selic: 0.1325,
      cdi: 0.1325,
    };
  }
}
