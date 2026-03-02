// CONFIGURAÇÕES DO SEU SUPABASE
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhudmdlenpka2pubmRhdnR3aHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzQ0MDAsImV4cCI6MjA4NzQxMDQwMH0.o7BnsxP53byL6lEUEN9MHygM0VnBJKWiswo25lJ_Ga0";
const BASE_URL = "https://xnvgezzdkjnndavtwhtx.supabase.co/rest/v1";

async function buscarEquipamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrId = urlParams.get('id');

    if (!qrId) {
        mostrarErro("QR Code inválido ou ID ausente.");
        return;
    }

    try {
        // O select traz o equipamento e a lista de manutenções vinculadas
        const response = await fetch(`${BASE_URL}/equipamentos?id_qrcode=eq.${qrId}&select=*,manutencoes(*)`, {
            method: 'GET',
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        const dados = await response.json();

        if (dados && dados.length > 0) {
            preencherPagina(dados[0]);
        } else {
            mostrarErro("Equipamento não encontrado no sistema.");
        }

    } catch (error) {
        console.error(error);
        mostrarErro("Erro de conexão com o servidor.");
    }
}

function preencherPagina(equipamento) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('conteudo').classList.remove('hidden');

    // Preenche os dados principais
    document.getElementById('marca-modelo').innerText = `${equipamento.marca} - ${equipamento.modelo}`;
    document.getElementById('cliente').innerText = equipamento.cliente_nome;
    document.getElementById('local').innerText = equipamento.localizacao;
    document.getElementById('data-atual').innerText = equipamento.data_manutencao_atual;
    document.getElementById('data-proxima').innerText = equipamento.data_proxima_manutencao;
    document.getElementById('relatorio-texto').innerText = equipamento.relatorio_geral || "Nenhuma observação técnica.";

    // Lógica da Bolinha de Status
    const bolinha = document.getElementById('status-bolinha');
    bolinha.className = equipamento.status_alerta ? 'status-vermelho' : 'status-verde';

    // --- LÓGICA DO HISTÓRICO (Sincronizado com Kotlin) ---
    const listaHistorico = document.getElementById('historico-lista');
    if (listaHistorico && equipamento.manutencoes) {
        listaHistorico.innerHTML = ""; 

        // Ordenar: o serviço mais recente (pela data_servico) aparece primeiro
        const manutençõesOrdenadas = equipamento.manutencoes.sort((a, b) => {
            return new Date(b.data_servico) - new Date(a.data_servico);
        });

        manutençõesOrdenadas.forEach(servico => {
            const item = document.createElement('div');
            item.className = 'historico-item';
            
            // Usando os nomes exatos das colunas do seu SupabaseClient.kt
            item.innerHTML = `
                <p><strong>Data:</strong> ${servico.data_servico || '---'}</p>
                <p><strong>Serviço:</strong> ${servico.descricao_servico || 'Sem descrição'}</p>
                <p><strong>Técnico:</strong> ${servico.tecnico_responsavel || 'Não informado'}</p>
                <hr style="border: 0.5px solid #eee; margin-top: 10px;">
            `;
            listaHistorico.appendChild(item);
        });

        if (manutençõesOrdenadas.length === 0) {
            listaHistorico.innerHTML = "<p style='color: #888;'>Nenhum histórico registrado para este equipamento.</p>";
        }
    }
}

function mostrarErro(mensagem) {
    document.getElementById('loading').classList.add('hidden');
    const erroDiv = document.getElementById('erro');
    erroDiv.innerText = mensagem;
    erroDiv.classList.remove('hidden');
}

window.onload = buscarEquipamento;
