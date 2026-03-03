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

// Transformamos em async para poder buscar a logo no banco
async function preencherPagina(equipamento) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('conteudo').classList.remove('hidden');

    // === BLOCO ADICIONADO PARA LOGO E NOME DA EMPRESA ===
    if (equipamento.empresa_nome) {
        try {
            const respEmpresa = await fetch(`${BASE_URL}/perfis_empresa?nome_empresa=eq.${encodeURIComponent(equipamento.empresa_nome)}&select=logo_url`, {
                method: 'GET',
                headers: { 'apikey': API_KEY, 'Authorization': `Bearer ${API_KEY}` }
            });
            const dadosEmpresa = await respEmpresa.json();

            if (dadosEmpresa && dadosEmpresa.length > 0) {
                // Atualiza o nome no header
                document.getElementById('nome-empresa-header').innerText = equipamento.empresa_nome;
                
                // Se existir logo_url, exibe a imagem
                if (dadosEmpresa[0].logo_url) {
                    document.getElementById('logo-empresa').src = dadosEmpresa[0].logo_url;
                    document.getElementById('container-logo-empresa').classList.remove('hidden');
                }
            }
        } catch (e) {
            console.error("Erro ao buscar perfil da empresa", e);
        }
    }
    // =================================================

    // Preenche apenas dados fixos no topo (Seu código original)
    document.getElementById('marca-modelo').innerText = `${equipamento.marca} - ${equipamento.modelo}`;
    document.getElementById('cliente').innerText = equipamento.cliente_nome;
    document.getElementById('local').innerText = equipamento.localizacao;
    document.getElementById('relatorio-texto').innerText = equipamento.relatorio_geral || "Sem observações.";

    const bolinha = document.getElementById('status-bolinha');
    bolinha.className = equipamento.status_alerta ? 'status-vermelho' : 'status-verde';

    const listaHistorico = document.getElementById('historico-lista');
    if (listaHistorico && equipamento.manutencoes) {
        listaHistorico.innerHTML = ""; 
        
        const manutencoesOrdenadas = equipamento.manutencoes.sort((a, b) => b.id - a.id);

        manutencoesOrdenadas.forEach(servico => {
            const item = document.createElement('div');
            item.className = 'historico-item';
            
            item.innerHTML = `
                <p><strong>📅 Data do Serviço:</strong> ${servico.data_servico || '---'}</p>
                <p><strong>🛠️ Tipo:</strong> ${servico.tipo_servico || 'Serviço'}</p>
                <p><strong>📝 Descrição:</strong> ${servico.descricao_servico || 'Sem descrição'}</p>
                <p><strong>👤 Técnico:</strong> ${servico.tecnico_responsavel || 'Não informado'}</p>
                <p class="proxima-manutencao-texto"><strong>⏭️ Próxima Manutenção:</strong> ${servico.proxima_data || '---'}</p>
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
