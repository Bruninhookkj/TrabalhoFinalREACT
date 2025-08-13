import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Button,
} from "react-native";

// Simula a função que busca as taxas
const getTaxasBCB = async () => {
  return {
    cdi: 0.1325, // 13.25% ao ano
    selic: 0.1325,
  };
};

const App = () => {
  const [valorInvestido, setValorInvestido] = useState("");
  const [prazoMeses, setPrazoMeses] = useState("");
  const [percentualCDI, setPercentualCDI] = useState("");
  const [resultado, setResultado] = useState(null);
  const [taxas, setTaxas] = useState({ cdi: 0.1325, selic: 0.1325 });
  const [infoModal, setInfoModal] = useState({ visible: false, content: "" });
  const [modo, setModo] = useState("CDI"); // Novo estado

  useEffect(() => {
    async function fetchTaxas() {
      try {
        const taxasAtualizadas = await getTaxasBCB();
        setTaxas(taxasAtualizadas);
      } catch (e) {
        console.error("Erro ao buscar taxas:", e);
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
      alert("Preencha todos os campos corretamente.");
      return;
    }

    let taxaBase;
    switch (modo) {
      case "CDI":
        taxaBase = taxas.cdi;
        break;
      case "SELIC":
        taxaBase = taxas.selic;
        break;
      case "IPCA":
        taxaBase = 0.045; // 4.5% ao ano como exemplo
        break;
      default:
        taxaBase = taxas.cdi;
    }

    const rendimentoBruto = valor * Math.pow(1 + taxaBase * percCDI, anos);
    const rendimentoLiquido = rendimentoBruto - valor;

    const resultadoFinal = {
      tipo: "LCI/LCA",
      modo: modo,
      valorInvestido: valor,
      prazo: meses,
      percentual: percCDI,
      taxaBase: taxaBase,
      rendimento: rendimentoLiquido,
      valorFinal: rendimentoBruto,
    };

    setResultado(resultadoFinal);
  };

  const abrirModal = (tipo) => {
    let content = "";
    switch (tipo) {
      case "CDI":
        content =
          "CDI (Certificado de Depósito Interbancário) é a taxa média usada entre bancos para empréstimos de curto prazo. Investimentos como CDBs e LCIs costumam render um percentual do CDI.";
        break;
      case "SELIC":
        content =
          "SELIC é a taxa básica de juros da economia brasileira. Serve de referência para empréstimos, financiamentos e investimentos de renda fixa como o Tesouro Selic.";
        break;
      case "IPCA":
        content =
          "IPCA é o índice oficial da inflação no Brasil, usado para medir a variação de preços. Alguns investimentos são atrelados ao IPCA para proteger o poder de compra.";
        break;
      default:
        content = "";
    }
    setInfoModal({ visible: true, content });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>💰 Simulador de LCI/LCA</Text>

      <View style={styles.infoRow}>
        <Text style={styles.label}>CDI</Text>
        <TouchableOpacity
          onPress={() => abrirModal("CDI")}
          style={styles.helpButton}
        >
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>SELIC</Text>
        <TouchableOpacity
          onPress={() => abrirModal("SELIC")}
          style={styles.helpButton}
        >
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>

        <Text style={styles.label}>IPCA</Text>
        <TouchableOpacity
          onPress={() => abrirModal("IPCA")}
          style={styles.helpButton}
        >
          <Text style={styles.helpText}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Seleção de Modo */}
      <View style={styles.modoSelector}>
        {["CDI", "SELIC", "IPCA"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[
              styles.modoButton,
              modo === item && styles.modoButtonAtivo,
            ]}
            onPress={() => setModo(item)}
          >
            <Text
              style={
                modo === item
                  ? styles.modoButtonTextAtivo
                  : styles.modoButtonText
              }
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Formulário */}
      <View style={styles.formContainer}>
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
          placeholder={`% do ${modo} (ex: 95)`}
          keyboardType="numeric"
          value={percentualCDI}
          onChangeText={setPercentualCDI}
        />

        <Button title="Calcular" onPress={handleCalcular} />
      </View>

      {/* Resultado */}
      {resultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado da Simulação:</Text>
          <Text>Tipo: {resultado.tipo}</Text>
          <Text>Modo de Cálculo: {resultado.modo}</Text>
          <Text>
            Valor Investido: R$ {resultado.valorInvestido.toFixed(2)}
          </Text>
          <Text>Prazo: {resultado.prazo} meses</Text>
          <Text>
            % sobre {resultado.modo}: {(resultado.percentual * 100).toFixed(2)}%
          </Text>
          <Text>
            Taxa {resultado.modo} atual:{" "}
            {(resultado.taxaBase * 100).toFixed(2)}%
          </Text>
          <Text>Rendimento: R$ {resultado.rendimento.toFixed(2)}</Text>
          <Text>Valor Final: R$ {resultado.valorFinal.toFixed(2)}</Text>
        </View>
      )}

      {/* Modal de informações */}
      <Modal
        visible={infoModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setInfoModal({ visible: false, content: "" })}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{infoModal.content}</Text>
            <TouchableOpacity
              onPress={() => setInfoModal({ visible: false, content: "" })}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Estilos
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    backgroundColor: "#f9f9f9",
    flexGrow: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#2c3e50",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3498db",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  helpText: {
    color: "#fff",
    fontWeight: "bold",
  },
  formContainer: {
    gap: 12,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    padding: 10,
    borderRadius: 5,
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#ecf0f1",
    borderRadius: 8,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 20,
    maxWidth: 350,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    backgroundColor: "#3498db",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modoSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 10,
  },
  modoButton: {
    borderWidth: 1,
    borderColor: "#3498db",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  modoButtonAtivo: {
    backgroundColor: "#3498db",
  },
  modoButtonText: {
    color: "#3498db",
    fontWeight: "bold",
  },
  modoButtonTextAtivo: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default App;
