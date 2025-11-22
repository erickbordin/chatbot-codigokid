// Arquivo: script.js (VERSÃO 8.3 CORRIGIDA - Página de Reposição em Tela Cheia)

// --- Elementos do DOM ---
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

// --- Elementos do Menu ---
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// --- Elementos da Reposição (Sidebar v8.2 + Página v8.3) ---
const reposicaoListContainer = document.getElementById('reposicao-list-container');
const reposicaoLoading = document.getElementById('reposicao-loading');
const refreshReposicaoBtn = document.getElementById('refresh-reposicao-btn');
const manageReposicaoBtn = document.getElementById('manage-reposicao-btn');
const reposicaoPage = document.getElementById('reposicao-page');
const reposicaoPageList = document.getElementById('reposicao-page-list');
const reposicaoPageBackBtn = document.getElementById('repo-page-back-btn');


// --- Event Listeners ---
chatForm.addEventListener('submit', handleSubmit);
menuToggleBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);

// --- Event Listeners para Botões Rápidos ---
quickReplyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        // CORREÇÃO: Pega o botão de refresh e impede que ele envie o chat
        if (e.target.id === 'refresh-reposicao-btn') {
            e.stopPropagation(); // Impede o 'submit'
            return; // Sai da função
        }

        const command = e.target.textContent;
        messageInput.value = command;
        chatForm.requestSubmit();
        closeMenu();
    });
});

// --- Funções de Controle do Menu ---
function toggleMenu() {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
}

function closeMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
}

/**
 * Lida com o envio do formulário (mensagem do usuário)
 */
async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = messageInput.value.trim();
    if (!userMessage) return;

    displayMessage(userMessage, 'user');
    messageInput.value = '';

    const loadingMessage = displayMessage('', 'bot loading');

    try {
        const botResponse = await processUserMessage(userMessage);
        loadingMessage.remove();
        displayMessage(botResponse, 'bot');
    } catch (error) {
        loadingMessage.remove();
        displayMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot');
        console.error("Erro completo:", error);
    }
}

/**
 * Adiciona uma mensagem à interface do chat
 */
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;

    if (!sender.includes('loading')) {
        message = message.replace(/\n/g, '<br>');
        messageElement.innerHTML = `<p>${message}</p>`;
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}


/**
* Interpreta a mensagem do usuário e decide qual ação tomar (GET ou POST).
*/
async function processUserMessage(message) {
    const cleanedMessage = message.trim().replace(/[.!?]$/, '');
    const lowerMessage = cleanedMessage.toLowerCase();
    let match;

    console.log(`DEBUG: processUserMessage v8.3 (Corrigido) recebido: "${message}"`);

    // --- (CORREÇÃO v8.3) ---
    // Captura o clique no botão "Atualizar Lista" da *sidebar*
    if (cleanedMessage.includes('🔄 Atualizar Lista')) {
        console.log("DEBUG v8.3: Acionando Atualização da Sidebar via chat command.");

        // 1. Atualiza a lista da *sidebar*
        await fetchReposicoes();

        // 2. Retorna a mensagem "Ok..."
        return "Ok...";
    }
    // --- (FIM DA CORREÇÃO) ---

    // 1. ADICIONAR ALUNO
    match = cleanedMessage.match(/(adicionar|cadastrar|novo)\s+alun(a|o)?\s*\[?(.*?)\]?\s*(?:no )?curso\s*\[?(.*?)\]?\s*(?:com |em |no )?inicio( em)?\s*\[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , , nome_raw, curso_raw, , data_raw] = match;
        const nome = nome_raw ? nome_raw.trim() : '';
        const curso = curso_raw ? curso_raw.trim() : '';
        const dataInicio = data_raw ? data_raw.trim() : '';
        if (!nome || !curso || !dataInicio) {
            return "Comando 'adicionar' incompleto. Use: Adicionar aluno [Nome] no curso [Curso] com inicio [dd/mm/aaaa]";
        }
        const dataToSend = { action: 'adicionar', nome, curso, dataInicio };
        return await sendDataToAPI(dataToSend);
    }

    // 2. ADICIONAR OBSERVAÇÃO
    match = cleanedMessage.match(/(adicionar|nova)\s+(observação|obs|anotação)\s+\[?(.+?)\]?\s+(?:para|d[oa]|n[oa])\s*(?:[oa]\s+)?alun(?:a|o)?\s+\[?(.+?)\]?$/i);
    if (match) {
        const [, , , obs_raw, nome_raw] = match;
        const obs = obs_raw ? obs_raw.trim() : '';
        const nome = nome_raw ? nome_raw.trim() : '';
        if (!obs || !nome) {
            return "Comando 'observação' incompleto. Use: Adicionar observação [Texto] para o aluno [Nome]";
        }
        const dataToSend = { action: 'atualizar_obs', nome, obs };
        return await sendDataToAPI(dataToSend);
    }

    // 3. ATUALIZAR DATA
    match = cleanedMessage.match(/(atualizar|mudar)\s+data\s+d(?:o|a)\s+alun(?:a|o)?\s+\[?(.*?)\]?\s+para\s+\[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , nome_raw, novaData_raw] = match;
        const nome = nome_raw ? nome_raw.trim() : '';
        const novaData = novaData_raw ? novaData_raw.trim() : '';
        if (!nome || !novaData) {
            return "Comando 'atualizar data' incompleto. Use: Atualizar data do aluno [Nome] para [dd/mm/aaaa]";
        }
        const dataToSend = { action: 'atualizar_data', nome, novaData };
        return await sendDataToAPI(dataToSend);
    }

    // 4. REMOVER ALUNO
    match = cleanedMessage.match(/(remover|excluir|deletar)\s+alun[ao]?\s+(.+)/i);
    if (match) {
        let nome = match[2].trim();
        nome = nome.replace(/^\[|\]$/g, '').trim();
        if (!nome) {
            return "Comando 'remover' incompleto. Use: Remover aluno [Nome]";
        }
        const dataToSend = { action: 'remover', nome: nome };
        return await sendDataToAPI(dataToSend);
    }

    // --- CONSULTAR LOGINS DA TURMA ATUAL ---
    match = lowerMessage.match(/(quais|me de|me da|os)\s+(logins?|senhas?)\s+(d[ao]s?\s+)?(alunos?\s+)?(de\s+)?(agora|hoje|atuais?)/i);
    if (match) {
        return await getDataFromAPI('logins_agora', {}, 'logins_agora');
    }

    // --- AÇÕES DE CONSULTA (GET) ---

    // 5. CONSULTA: DATA ESPECÍFICA
    match = lowerMessage.match(/(?:no dia|para a data de)\s+(\d{2}\/\d{2}\/\d{4})/);
    if (match) {
        const dataBusca = match[1];
        return await getDataFromAPI('data_especifica', { data: dataBusca });
    }

    // 6. CONSULTA: PRÓXIMOS [N] DIAS
    match = lowerMessage.match(/próximos\s+(\d+)\s+dias/);
    if (match) {
        const dias = match[1];
        return await getDataFromAPI('proximos_dias', { dias: dias });
    }

    // 7. CONSULTA: ESSA SEMANA
    if (lowerMessage.includes('essa semana') || lowerMessage.includes('esta semana') || lowerMessage.includes('nos próximos 7 dias')) {
        return await getDataFromAPI('semana');
    }

    // 8. CONSULTA: MÊS QUE VEM
    if (lowerMessage.includes('mês que vem') || lowerMessage.includes('proximo mes')) {
        return await getDataFromAPI('mes_que_vem');
    }

    // 9. CONSULTA: ANO QUE VEM
    if (lowerMessage.includes('ano que vem') || lowerMessage.includes('proximo ano')) {
        return await getDataFromAPI('ano_que_vem');
    }

    // 10. CONSULTA: MÊS ESPECÍFICO
    match = lowerMessage.match(/em\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i);
   if (match) {
        const mes = match[1];
        return await getDataFromAPI('mes', { mes: mes });
    }

    // 11. CONSULTA: ATRASADO
    if (lowerMessage.includes('atrasado') || lowerMessage.includes('vencido') || lowerMessage.includes('fora do prazo')) {
        return await getDataFromAPI('atrasado');
    }

    // 12. CONSULTA POR ANO DE CONCLUSÃO
    match = lowerMessage.match(/(?:quem|aluno|conclusão|finaliza|termina|ano)\s.*?\s(\d{4})/i);
    if (match) {
        const anoBusca = match[1];
        if (anoBusca && parseInt(anoBusca) > 2000 && parseInt(anoBusca) < 2100) {
            return await getDataFromAPI('ano_conclusao', { ano: anoBusca });
        }
    }

    // 13. CONSULTA POR NOME
    match = cleanedMessage.match(/(?:aluno|nome|buscar|consultar|existe|quem é|informações d[oa])\s+\[?(.+?)\]?$/i);
    if (!match) {
        match = cleanedMessage.match(/temos algum(?:a)? aluno(?:a)? (?:com o nome|chamado)\s+\[?(.+?)\]?$/i);
    }
    if (!match) {
        match = cleanedMessage.match(/^\[?([a-zA-ZÀ-ú\s]+)\??\]?$/i);
    }
    if (match) {
        let nomeBusca = match[1];
        if (nomeBusca) {
            nomeBusca = nomeBusca.replace(/[?\]\[]/g, '').trim();
            const stopWords = [
                'atrasado', 'semana', 'mes', 'dia', 'remover', 'adicionar', 'atualizar',
                'excluir', 'deletar', 'cadastrar', 'novo', 'mudar', 'observação', 'obs',
                'anotação', 'próximos', 'proximo', 'ano', 'data', 'inicio', 'curso',
                'para', 'com', 'quem', 'qual', 'quais', 'em', 'no', 'do', 'da', 'a', 'o',
                'logins', 'senhas', 'agora', 'hoje', 'atualizar lista'
            ];
            const isStopWord = stopWords.some(word => nomeBusca.toLowerCase().includes(word));
            const hasNumbersOrSlash = /[\d\/]/.test(nomeBusca);
            if (!isStopWord && !hasNumbersOrSlash && nomeBusca.length > 1) {
                return await getDataFromAPI('nome_aluno', { nome: nomeBusca });
            }
        }
    }

    // Se NENHUM comando for reconhecido
    return "Desculpe, não entendi o comando. Tente os exemplos ao lado.";
}


/**
 * Função para ENVIAR dados (POST)
 */
async function sendDataToAPI(data) {
    if (typeof API_URL === 'undefined') {
        throw new Error("API_URL não está definida. Verifique seu arquivo HTML.");
    }
    const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain', },
        body: JSON.stringify(data),
        redirect: 'follow'
    });
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`Erro da API (POST): ${responseText}`);
    }
    try {
        const result = JSON.parse(responseText);
        if (result.status === 'success') {
            return result.message;
        } else {
            throw new Error(result.message || "A API retornou um erro.");
        }
    } catch (parseError) {
        throw new Error(`Resposta inesperada da API (POST): ${responseText}`);
    }
}


/**
 * Função para BUSCAR dados (GET)
 */
async function getDataFromAPI(filtro, params = {}, action = 'consultar') {
    if (typeof API_URL === 'undefined') {
        throw new Error("API_URL não está definida. Verifique seu arquivo HTML.");
    }
    const url = new URL(API_URL);
    url.searchParams.append('action', action);
    url.searchParams.append('filtro', filtro);
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }
    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
    });
    const responseText = await response.text();
    if (!response.ok) {
        throw new Error(`Erro da API (GET): ${responseText}`);
    }
    try {
        const result = JSON.parse(responseText);
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || "A API (GET) retornou um erro.");
        }
    } catch (parseError) {
        throw new Error(`Resposta inesperada da API (GET): ${responseText}`);
    }
}

// ==========================================================
// --- (INÍCIO) LÓGICA DE REPOSIÇÃO (v8.3 - Tela Cheia) ---
// ==========================================================

/**
* (v8.2) Busca a lista de alunos para a *SIDEBAR*
*/
async function fetchReposicoes() {
    console.log("DEBUG v8.2: Buscando lista de reposição (Sidebar)...");
    reposicaoLoading.style.display = 'block';

    const oldItems = reposicaoListContainer.querySelectorAll('.reposicao-item');
    oldItems.forEach(item => item.remove());
    const noStudentsMessage = reposicaoListContainer.querySelector('.reposicao-vazio');
    if (noStudentsMessage) noStudentsMessage.remove();

    try {
        // Esta chamada DEVE retornar {nome, curso, faltas}
        const alunos = await getDataFromAPI('consultar_reposicoes', {}, 'consultar_reposicoes');
        reposicaoLoading.style.display = 'none';

        if (!alunos || alunos.length === 0) {
            const li = document.createElement('li');
            li.className = 'reposicao-vazio';
            li.style.color = "#888";
            li.style.fontSize = "0.85rem";
            li.style.padding = "0 24px 10px";
            li.textContent = "Nenhum aluno com 1+ falta.";
            reposicaoListContainer.appendChild(li);
            return;
        }

        console.log(`DEBUG v8.2: Recebidos ${alunos.length} registros para sidebar.`);

        alunos.forEach(aluno => {
            const li = document.createElement('li');
            li.className = 'reposicao-item';
            const nomeSpan = document.createElement('span');
            nomeSpan.className = 'reposicao-nome';

            // Verifica se 'aluno.curso' existe (corrige 'undefined')
            const displayText = (aluno.curso)
                ? `${aluno.nome} - ${aluno.curso} (${aluno.faltas} faltas)`
                : `${aluno.nome} (${aluno.faltas} faltas)`; // Fallback

            nomeSpan.textContent = displayText;
            nomeSpan.title = displayText;

            const botoesDiv = document.createElement('div');
            botoesDiv.className = 'reposicao-botoes';

            const btnMarcar = document.createElement('button');
            btnMarcar.className = 'repo-btn repo-marcar';
            btnMarcar.textContent = 'Marcar';
            btnMarcar.dataset.nome = aluno.nome;
            btnMarcar.dataset.curso = aluno.curso || ''; // Envia curso ou string vazia

            const btnRemover = document.createElement('button');
            btnRemover.className = 'repo-btn repo-remover';
            btnRemover.textContent = 'Remover';
            btnRemover.dataset.nome = aluno.nome;
            btnRemover.dataset.curso = aluno.curso || '';

            botoesDiv.appendChild(btnMarcar);
            botoesDiv.appendChild(btnRemover);
            li.appendChild(nomeSpan);
            li.appendChild(botoesDiv);
            reposicaoListContainer.appendChild(li);
        });
    } catch (error) {
        console.error("Erro ao buscar reposições (Sidebar):", error);
        reposicaoLoading.style.display = 'none';
        displayMessage(`Erro ao carregar lista de reposição: ${error.message}`, 'bot');
    }
}

/**
* (v8.3) Lida com cliques nos botões 'Marcar'/'Remover'
* (Funciona para AMBAS as listas, sidebar e página)
*/
async function handleReposicaoClick(e) {
    const targetButton = e.target.closest('.repo-btn');
    if (!targetButton) return;

    const nomeAluno = targetButton.dataset.nome;
    const cursoAluno = targetButton.dataset.curso;

    // Validação crucial para o backend v8.0+
    if (!nomeAluno || !cursoAluno) {
        console.error("Botão de reposição clicado, mas 'data-nome' ou 'data-curso' está faltando/undefined.", targetButton.dataset);
        displayMessage("Erro: Não foi possível identificar o curso do aluno. Verifique o backend (Codigo.gs) e reimplante.", 'bot');
        return;
    }

    console.log(`DEBUG v8.3: Botão clicado para: ${nomeAluno} (Curso: ${cursoAluno})`);

    const confirmou = confirm(`Tem certeza que deseja marcar a reposição para ${nomeAluno} (Curso: ${cursoAluno})?\n\nIsso irá ZERAR as faltas registradas para este aluno NESTE CURSO.`);
    if (!confirmou) return;

    const loadingMessage = displayMessage('', 'bot loading');

    try {
        const dataToSend = { action: 'marcar_reposicao', nome: nomeAluno, curso: cursoAluno };
        const responseMessage = await sendDataToAPI(dataToSend);

        loadingMessage.remove();
        displayMessage(responseMessage, 'bot');

        // ATUALIZA AMBAS AS LISTAS
        await fetchReposicoes(); // Atualiza a sidebar
        await refreshReposicaoPageList(); // Atualiza a página cheia

    } catch (error) {
        loadingMessage.remove();
        displayMessage(`Erro ao marcar reposição: ${error.message}`, 'bot');
    }
}

/**
* (v8.3) Abre a página de reposição em tela cheia
*/
async function openReposicaoPage() {
    console.log("DEBUG v8.3: Abrindo página de reposição...");
    reposicaoPage.classList.add('is-open');
    closeMenu(); // Fecha o menu lateral
    await refreshReposicaoPageList(); // Atualiza a lista ao abrir
}

/**
* (v8.3) Fecha a página de reposição
*/
function closeReposicaoPage() {
    console.log("DEBUG v8.3: Fechando página de reposição...");
    reposicaoPage.classList.remove('is-open');
}

/**
* (v8.3) Busca dados e constrói a LISTA DA PÁGINA de reposição
*/
async function refreshReposicaoPageList() {
    console.log("DEBUG v8.3: Atualizando lista da PÁGINA de reposição...");
    reposicaoPageList.innerHTML = '<li class="reposicao-page-loading">Carregando alunos...</li>';

    try {
        // Esta chamada DEVE retornar {nome, curso, faltas}
        const alunos = await getDataFromAPI('consultar_reposicoes', {}, 'consultar_reposicoes');

        if (!alunos || alunos.length === 0) {
            reposicaoPageList.innerHTML = '<li class="reposicao-page-vazio">Nenhum aluno com 1+ falta.</li>';
            return;
        }

        reposicaoPageList.innerHTML = ''; // Limpa o loading

        alunos.forEach(aluno => {
            const li = document.createElement('li');
            li.className = 'reposicao-item';
            const nomeSpan = document.createElement('span');
            nomeSpan.className = 'reposicao-nome';

            // Verifica se 'aluno.curso' existe (corrige 'undefined')
            const displayText = (aluno.curso)
                ? `${aluno.nome} - ${aluno.curso} (${aluno.faltas} faltas)`
                : `${aluno.nome} (${aluno.faltas} faltas)`; // Fallback

            nomeSpan.textContent = displayText;
            nomeSpan.title = displayText;

            const botoesDiv = document.createElement('div');
            botoesDiv.className = 'reposicao-botoes';

            const btnMarcar = document.createElement('button');
            btnMarcar.className = 'repo-btn repo-marcar';
            btnMarcar.textContent = 'Marcar';
            btnMarcar.dataset.nome = aluno.nome;
            btnMarcar.dataset.curso = aluno.curso || '';

            const btnRemover = document.createElement('button');
            btnRemover.className = 'repo-btn repo-remover';
            btnRemover.textContent = 'Remover';
             btnRemover.dataset.nome = aluno.nome;
            btnRemover.dataset.curso = aluno.curso || '';

            botoesDiv.appendChild(btnMarcar);
            botoesDiv.appendChild(btnRemover);
            li.appendChild(nomeSpan);
            li.appendChild(botoesDiv);
            reposicaoPageList.appendChild(li);
        });

    } catch (error) {
        console.error("Erro ao buscar reposições (Página):", error);
        reposicaoPageList.innerHTML = `<li class="reposicao-page-vazio" style="color: #F44336;">Erro ao carregar lista: ${error.message}</li>`;
    }
}

// ==========================================================
// --- (FIM) LÓGICA DE REPOSIÇÃO (v8.3) ---
// ==========================================================


/**
* (v8.3) Inicia os listeners da aplicação
*/
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM carregado. Iniciando app v8.3 (Tela Cheia)...");

    // Listener do botão de refresh (Sidebar)
    // (Corrigido para não usar stopPropagation desnecessariamente)
    refreshReposicaoBtn.addEventListener('click', fetchReposicoes);

    // Listener para os botões "Marcar" / "Remover" (Sidebar)
    reposicaoListContainer.addEventListener('click', handleReposicaoClick);

    // --- Listeners v8.3 ---
    // Listener para ABRIR a página de reposição
    manageReposicaoBtn.addEventListener('click', openReposicaoPage);

    // Listener para FECHAR a página de reposição
    reposicaoPageBackBtn.addEventListener('click', closeReposicaoPage);

    // Listener para os botões "Marcar" / "Remover" (PÁGINA CHEIA)
    reposicaoPageList.addEventListener('click', handleReposicaoClick);
    // --- FIM v8.3 ---

    // Busca a lista de reposição da sidebar assim que a página carrega
    fetchReposicoes();
});
