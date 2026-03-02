const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhudmdlenpka2pubmRhdnR3aHR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4MzQ0MDAsImV4cCI6MjA4NzQxMDQwMH0.o7BnsxP53byL6lEUEN9MHygM0VnBJKWiswo25lJ_Ga0";
const BASE_URL = "https://xnvgezzdkjnndavtwhtx.supabase.co/rest/v1";

async function buscarEquipamento() {
    const urlParams = new URLSearchParams(window.location.search);
    const qrId = urlParams.get('id');

    if (!qrId) {
        mostrarErro("ID do QR Code ausente.");
        return;
    }

    try {
        const response = await fetch(`${BASE_URL}/equipamentos?id_qrcode=eq.${qrId}&select=*,manutencoes(*)`, {
            method: 'GET',
            headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
        });

        const dados = await response.json();

        if (dados && dados.length > 0) {
            preencherPagina(dados[0]);
        } else {
            mostrarErro("Equipamento não encontrado.");
        }
    } catch (error) {
        mostrarErro("Erro ao carregar dados.");
    }
}

function preencherPagina(equipamento) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('conteudo').classList.remove('hidden');

    // Dados Principais do Equipamento
    document.getElementById('marca-modelo').innerText = `${equipamento.marca} - ${equipamento.modelo}`;
    document.getElementById('cliente').innerText = equipamento.cliente_nome;
    document.getElementById('local').innerText = equipamento.localizacao;
    
    // Preenchendo as datas de resumo do topo (essenciais para o cliente)
    document.getElementById('data-atual').innerText = equipamento.data_manutencao_atual || "---";
    document.getElementById('data-proxima').innerText = equipamento.data_proxima_manutencao || "---";
    
    document.getElementById('relatorio-texto').innerText = equipamento.relatorio_geral || "Sem observações.";

    const bolinha = document.getElementById('status-bolinha');
    bolinha.className = equipamento.status_alerta ? 'status-vermelho' : 'status-verde';

    const listaHistorico = document.getElementById('historico-lista');
    if (listaHistorico && equipamento.manutencoes) {
        listaHistorico.innerHTML = ""; 
        
        // Ordena para o mais recente (ID maior) ficar em cima, igual ao seu App
        const manutençõesOrdenadas = equipamento.manutencoes.sort((a, b) => b.id - a.id);

        manutençõesOrdenadas.forEach(servico => {
            const item = document.createElement('div');
            item.className = 'historico-item';
            
            // AGORA COM AS 5 INFORMAÇÕES TÉCNICAS (Fiel à sua tabela Supabase)
            item.innerHTML = `
                <p><strong>📅 Data:</strong> ${servico.data_servico || '---'}</p>
                <p><strong>🛠️ Tipo:</strong> ${servico.tipo_servico || 'Serviço'}</p>
                <p><strong>📝 Descrição:</strong> ${servico.descricao_servico || 'Sem descrição'}</p>
                <p><strong>👤 Técnico:</strong> ${servico.tecnico_responsavel || 'Não informado'}</p>
                <p class="proxima-manutencao-texto"><strong>⏭️ Próxima:</strong> ${servico.proxima_data || '---'}</p>
                <hr style="border: 0.5px solid #eee; margin: 10px 0;">
            `;
            listaHistorico.appendChild(item);
        });
    }
}

function mostrarErro(msg) {
    document.getElementById('loading').classList.add('hidden');
    const erroDiv = document.getElementById('erro');
    erroDiv.innerText = msg;
    erroDiv.classList.remove('hidden');
}

window.onload = buscarEquipamento;
