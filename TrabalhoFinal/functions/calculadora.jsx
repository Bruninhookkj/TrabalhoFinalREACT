import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, Button, StyleSheet } from 'react-native';
import { getTaxasBCB } from '../services/APIcdi';

const Calculadora = ({ onResult }) => {
  const [valorInvestido, setValorInvestido] = useState('');
  const [prazoMeses, setPrazoMeses] = useState('');
  const [percentualCDI, setPercentualCDI] = useState('');
  const [taxas, setTaxas] = useState({ cdi: 0.1325, selic: 0.1325 }); // valores padrão

  useEffect(() => {
    async function fetchTaxas() {
      try {
        const taxasAtualizadas = await getTaxasBCB();
        setTaxas(taxasAtualizadas);
      } catch (e) {
        console.error('Erro ao buscar taxas:', e);
      }
    }
    fetchTaxas();
  }, []);

  const handleCalcular = () => {
    const valor = parseFloat(valorInvestido);
    const meses = parseInt(prazoMeses);
    const percCDI = parseFloat(percentualCDI) / 100;
    const anos = meses / 12;

    if (isNaN(valor) || isNaN(meses) || isNaN(percCDI)) {
      alert('Preencha todos os campos corretamente.');
      return;
    }

    const rendimentoBruto = valor * Math.pow(1 + taxas.cdi * percCDI, anos);
    const rendimentoLiquido = rendimentoBruto - valor;

    const resultado = {
      tipo: 'LCI/LCA',
      valorInvestido: valor,
      prazo: meses,
      percentualCDI: percCDI,
      taxaCDI: taxas.cdi,
      rendimento: rendimentoLiquido,
      valorFinal: rendimentoBruto,
    };

    onResult(resultado);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora LCI / LCA</Text>

      <TextInput
        style={styles.input}
        placeholder="Valor investido (R$)"
        keyboardType="numeric"
        value={valorInvestido}
        onChangeText={setValorInvestido}
      />

      <TextInput
        style={styles.input}
        placeholder="Prazo (meses)"
        keyboardType="numeric"
        value={prazoMeses}
        onChangeText={setPrazoMeses}
      />

      <TextInput
        style={styles.input}
        placeholder="% do CDI (ex: 95)"
        keyboardType="numeric"
        value={percentualCDI}
        onChangeText={setPercentualCDI}
      />

      <Button title="Calcular" onPress={handleCalcular} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 5,
  },
});

export default Calculadora;
