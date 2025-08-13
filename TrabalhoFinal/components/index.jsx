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

const getTaxasBCB = async () => {
  return {
    cdi: 0.1325,
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
  const [modo, setModo] = useState("CDI");

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
        taxaBase = 0.045;
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
      <Text style={styles.title}> Simulador de LCI/LCA</Text>

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

      <View style={styles.modoSelector}>
        {["CDI", "SELIC", "IPCA"].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.modoButton, modo === item && styles.modoButtonAtivo]}
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

        <TouchableOpacity style={styles.calcButton} onPress={handleCalcular}>
          <Text style={styles.calcButtonText}>Calcular</Text>
        </TouchableOpacity>
      </View>

      {resultado && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Resultado da Simulação:</Text>
          <Text>Tipo: {resultado.tipo}</Text>
          <Text>Modo de Cálculo: {resultado.modo}</Text>
          <Text>Valor Investido: R$ {resultado.valorInvestido.toFixed(2)}</Text>
          <Text>Prazo: {resultado.prazo} meses</Text>
          <Text>
            % sobre {resultado.modo}: {(resultado.percentual * 100).toFixed(2)}%
          </Text>
          <Text>
            Taxa {resultado.modo} atual: {(resultado.taxaBase * 100).toFixed(2)}
            %
          </Text>
          <Text>Rendimento: R$ {resultado.rendimento.toFixed(2)}</Text>
          <Text>Valor Final: R$ {resultado.valorFinal.toFixed(2)}</Text>
        </View>
      )}

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

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 60,
    backgroundColor: "#f5f7fa",
    flexGrow: 1,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 28,
    textAlign: "center",
    color: "#1f2d3d",
  },

  
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    alignItems: "center",
    flexWrap: "wrap",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 6,
  },
  helpButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2980b9",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  helpText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  // Input + Botão
  formContainer: {
    marginBottom: 30,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dfe6e9",
    padding: 14,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fdfdfd",
    color: "#2d3436",
  },
  calcButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  calcButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 1,
  },

  // Resultado
  resultContainer: {
    marginTop: 20,
    padding: 22,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    gap: 6,
  },
  resultTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 12,
    color: "#2c3e50",
    textAlign: "center",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    maxWidth: 360,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 18,
    color: "#2c3e50",
    lineHeight: 22,
  },
  closeButton: {
    alignSelf: "flex-end",
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#3498db",
    borderRadius: 6,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },


  modoSelector: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 22,
    gap: 12,
  },
  modoButton: {
    borderWidth: 1,
    borderColor: "#2980b9",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#f0f8ff",
  },
  modoButtonAtivo: {
    backgroundColor: "#2980b9",
  },
  modoButtonText: {
    color: "#2980b9",
    fontWeight: "600",
    fontSize: 14,
  },
  modoButtonTextAtivo: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
});


export default App;
