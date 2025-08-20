import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from "react-native";
import axios from "axios";
import Papa from 'papaparse';

const getTaxasBCB = async () => {
    try {
        const cdiResponse = await axios.get(
            "https://api.bcb.gov.br/dados/serie/bcdata.sgs.433/dados?formato=csv"
        );
        const selicResponse = await axios.get(
            "https://api.bcb.gov.br/dados/serie/bcdata.sgs.4186/dados?formato=csv"
        );
        
        const cdiParsed = Papa.parse(cdiResponse.data, { header: true, skipEmptyLines: true });
        const selicParsed = Papa.parse(selicResponse.data, { header: true, skipEmptyLines: true });

        const cdiLatest = cdiParsed.data[cdiParsed.data.length - 1];
        const selicLatest = selicParsed.data[selicParsed.data.length - 1];

        const cdiValue = parseFloat(cdiLatest.valor.replace(',', '.'));
        const selicValue = parseFloat(selicLatest.valor.replace(',', '.'));

        return {
            cdi: cdiValue / 100,
            selic: selicValue / 100,
        };
    } catch (error) {
        console.error("Erro ao obter taxas do BCB:", error);
        return {
            cdi: 0.1325,
            selic: 0.1325,
        };
    }
};

const App = () => {
    const [valorInvestido, setValorInvestido] = useState("");
    const [prazoMeses, setPrazoMeses] = useState("");
    const [percentual, setPercentual] = useState("");
    const [resultado, setResultado] = useState(null);
    const [taxas, setTaxas] = useState({ cdi: 0.1325, selic: 0.1325 });
    const [infoModal, setInfoModal] = useState({ visible: false, content: "" });
    const [modo, setModo] = useState("CDI");

    useEffect(() => {
        async function fetchTaxas() {
            const taxasAtualizadas = await getTaxasBCB();
            setTaxas(taxasAtualizadas);
        }
        fetchTaxas();
    }, []);

    const calcularComparacao = (valor, meses, perc, taxaBase) => {
        const anos = meses / 12;

        const rendimentoPoupanca = valor * Math.pow(1 + 0.05, anos) - valor;
        const rendimentoCDB = valor * Math.pow(1 + (taxaBase * perc), anos) - valor;
        const rendimentoTesouroSelic = valor * Math.pow(1 + taxas.selic, anos) - valor;

        return {
            rendimentoPoupanca: rendimentoPoupanca,
            rendimentoCDB: rendimentoCDB,
            rendimentoTesouroSelic: rendimentoTesouroSelic,
        };
    };

    const handleCalcular = () => {
        const valor = parseFloat(valorInvestido);
        const meses = parseInt(prazoMeses);
        const perc = parseFloat(percentual) / 100;
        const anos = meses / 12;

        if (isNaN(valor) || isNaN(meses) || isNaN(perc) || valor <= 0 || meses <= 0 || perc <= 0) {
            Alert.alert("Erro", "Por favor, preencha todos os campos com valores válidos.");
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

        const valorFinal = valor * Math.pow(1 + taxaBase * perc, anos);
        const rendimento = valorFinal - valor;
        const comparacao = calcularComparacao(valor, meses, perc, taxaBase);

        const resultadoFinal = {
            tipo: "LCI/LCA",
            modo: modo,
            valorInvestido: valor,
            prazo: meses,
            percentual: perc,
            taxaBase: taxaBase,
            rendimento: rendimento,
            valorFinal: valorFinal,
            comparacao: comparacao,
        };

        setResultado(resultadoFinal);
    };

    const abrirModal = (tipo) => {
        let content = "";
        switch (tipo) {
            case "CDI":
                content = "CDI (Certificado de Depósito Interbancário) é a taxa média usada entre bancos para empréstimos de curto prazo. Investimentos como CDBs e LCIs costumam render um percentual do CDI.";
                break;
            case "SELIC":
                content = "SELIC é a taxa básica de juros da economia brasileira. Serve de referência para empréstimos, financiamentos e investimentos de renda fixa como o Tesouro Selic.";
                break;
            case "IPCA":
                content = "IPCA é o índice oficial da inflação no Brasil, usado para medir a variação de preços. Alguns investimentos são atrelados ao IPCA para proteger o poder de compra.";
                break;
            default:
                content = "";
        }
        setInfoModal({ visible: true, content });
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Simulador de Investimentos</Text>

            <View style={styles.card}>
                <View style={styles.cardTitleContainer}>
                    <Text style={styles.cardTitle}>Indexador</Text>
                    <TouchableOpacity onPress={() => abrirModal(modo)}>
                        <Text style={styles.helpButton}>?</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.modoSelector}>
                    {["CDI", "SELIC", "IPCA"].map((item) => (
                        <TouchableOpacity
                            key={item}
                            style={[styles.modoButton, modo === item && styles.modoButtonActive]}
                            onPress={() => setModo(item)}
                        >
                            <Text style={[styles.modoButtonText, modo === item && styles.modoButtonTextActive]}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Detalhes do Investimento</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Valor investido (R$)"
                    keyboardType="numeric"
                    value={valorInvestido}
                    onChangeText={setValorInvestido}
                    placeholderTextColor="#999"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Prazo (meses)"
                    keyboardType="numeric"
                    value={prazoMeses}
                    onChangeText={setPrazoMeses}
                    placeholderTextColor="#999"
                />
                <TextInput
                    style={styles.input}
                    placeholder={`% do ${modo} (ex: 95)`}
                    keyboardType="numeric"
                    value={percentual}
                    onChangeText={setPercentual}
                    placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.calcButton} onPress={handleCalcular}>
                    <Text style={styles.calcButtonText}>Simular</Text>
                </TouchableOpacity>
            </View>

            {resultado && (
                <View style={styles.resultCard}>
                    <Text style={styles.resultTitle}>Resultado da Simulação</Text>
                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Rendimento Bruto:</Text>
                        <Text style={styles.resultValue}>R$ {resultado.rendimento.toFixed(2)}</Text>
                    </View>
                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Valor Final:</Text>
                        <Text style={styles.resultValue}>R$ {resultado.valorFinal.toFixed(2)}</Text>
                    </View>
                    <View style={styles.resultItem}>
                        <Text style={styles.resultLabel}>Taxa {resultado.modo} atual:</Text>
                        <Text style={styles.resultValue}>{(resultado.taxaBase * 100).toFixed(2)}%</Text>
                    </View>
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
        flexGrow: 1,
        backgroundColor: "#E8F0F2",
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 40,
        color: "#2C3E50",
    },
    welcomeText: {
        fontSize: 20,
        fontWeight: "600",
        textAlign: "center",
        marginBottom: 20,
        color: "#16A085",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#2C3E50",
    },
    helpButton: {
        fontSize: 24,
        fontWeight: 'bold',
        color: "#3498DB",
        backgroundColor: "#E8F0F2",
        borderRadius: 15,
        width: 30,
        height: 30,
        textAlign: 'center',
        lineHeight: 30,
    },
    modoSelector: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    modoButton: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 8,
        marginHorizontal: 4,
        backgroundColor: "#D3D3D3",
    },
    modoButtonActive: {
        backgroundColor: "#3498DB",
    },
    modoButtonText: {
        color: "#2C3E50",
        fontWeight: "bold",
        fontSize: 16,
    },
    modoButtonTextActive: {
        color: "#FFFFFF",
    },
    input: {
        height: 55,
        backgroundColor: "#F4F6F7",
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
        color: "#2C3E50",
    },
    calcButton: {
        backgroundColor: "#16A085",
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 10,
    },
    calcButtonText: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    resultCard: {
        backgroundColor: "#ECF0F1",
        borderRadius: 12,
        padding: 20,
        marginTop: 20,
        borderLeftWidth: 5,
        borderLeftColor: "#3498DB",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 5,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 15,
        color: "#34495E",
        borderBottomWidth: 1,
        borderBottomColor: "#BDC3C7",
        paddingBottom: 10,
    },
    resultItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    resultLabel: {
        fontSize: 16,
        color: "#555",
    },
    resultValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#2C3E50",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
    },
    modalContent: {
        backgroundColor: "#FFFFFF",
        padding: 30,
        borderRadius: 10,
        width: "85%",
        alignItems: "center",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: "center",
        color: "#2C3E50",
    },
    closeButton: {
        backgroundColor: "#3498DB",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
    },
    closeButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default App;
