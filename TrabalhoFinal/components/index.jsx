import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Calculadora from '../functions/calculadora';
import Resultados from './resultados';

const Index = () => {
  const [resultado, setResultado] = useState(null);
  const [infoModal, setInfoModal] = useState({ visible: false, content: '' });

  const abrirModal = (tipo) => {
    let content = '';
    switch (tipo) {
      case 'CDI':
        content = 'CDI (Certificado de Depósito Interbancário) é a taxa média usada entre bancos para empréstimos de curto prazo. Investimentos como CDBs e LCIs costumam render um percentual do CDI.';
        break;
      case 'SELIC':
        content = 'SELIC é a taxa básica de juros da economia brasileira. Serve de referência para empréstimos, financiamentos e investimentos de renda fixa como o Tesouro Selic.';
        break;
      case 'IPCA':
        content = 'IPCA é o índice oficial da inflação no Brasil, usado para medir a variação de preços. Alguns investimentos são atrelados ao IPCA para proteger o poder de compra.';
        break;
      default:
        content = '';
    }

    setInfoModal({ visible: true, content });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💰 Simulador de LCI/LCA</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>CDI</Text>
        <TouchableOpacity onPress={() => abrirModal('CDI')} style={styles.helpButton}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>SELIC</Text>
        <TouchableOpacity onPress={() => abrirModal('SELIC')} style={styles.helpButton}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>IPCA</Text>
        <TouchableOpacity onPress={() => abrirModal('IPCA')} style={styles.helpButton}>
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>
      </View>

      <Calculadora onResult={setResultado} />

      {resultado && <Resultados dados={resultado} />}

      <Modal
        visible={infoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal({ visible: false, content: '' })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{infoModal.content}</Text>
            <TouchableOpacity onPress={() => setInfoModal({ visible: false, content: '' })} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: '#f9f9f9',
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 6,
  },
  helpText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    maxWidth: 350,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: '#3498db',
    borderRadius: 6,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Index;
