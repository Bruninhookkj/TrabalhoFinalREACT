import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Resultados({ resultados, onBack }) {
  // resultados: { lci, poupanca, cdb, tesouro }
  // valores numéricos já formatados ou números

  // função para formatar número em real
  const formatarValor = (valor) => {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Resultados da Simulação</Text>

      <View style={styles.item}>
        <Text style={styles.label}>LCI/LCA (Isento IR):</Text>
        <Text style={styles.valor}>{formatarValor(resultados.lci)}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Poupança:</Text>
        <Text style={styles.valor}>{formatarValor(resultados.poupanca)}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>CDB (considerando IR):</Text>
        <Text style={styles.valor}>{formatarValor(resultados.cdb)}</Text>
      </View>

      <View style={styles.item}>
        <Text style={styles.label}>Tesouro Selic:</Text>
        <Text style={styles.valor}>{formatarValor(resultados.tesouro)}</Text>
      </View>

      <TouchableOpacity style={styles.botao} onPress={onBack}>
        <Text style={styles.botaoTexto}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f0ff',
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#003366',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomColor: '#cce0ff',
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    color: '#0059b3',
  },
  valor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00264d',
  },
  botao: {
    marginTop: 30,
    backgroundColor: '#0059b3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
  },
});
