// Arquivo: script.js (VERSÃO 8.0 - Adiciona menu lateral + Mantém loading "...")

// --- Elementos do DOM ---
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const quickReplyButtons = document.querySelectorAll('.quick-reply-btn');

// --- (NOVO) Elementos do Menu ---
const menuToggleBtn = document.getElementById('menu-toggle-btn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');
// --- FIM DA NOVA SEÇÃO ---


// --- Event Listeners ---
chatForm.addEventListener('submit', handleSubmit);

// --- (NOVO) Listeners para Abrir/Fechar Menu ---
menuToggleBtn.addEventListener('click', toggleMenu);
overlay.addEventListener('click', closeMenu);
// --- FIM DA NOVA SEÇÃO ---


// --- (ATUALIZADO) Event Listeners para Botões Rápidos ---
quickReplyButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const command = e.target.textContent; 
        messageInput.value = command; 
        chatForm.requestSubmit(); 
        
        // (NOVO) Fecha o menu ao clicar em um botão
        closeMenu(); 
    });
});
// --- FIM DA MUDANÇA ---


// --- (NOVAS) Funções de Controle do Menu ---
/** Abre/Fecha o menu */
function toggleMenu() {
    sidebar.classList.toggle('is-open');
    overlay.classList.toggle('is-open');
}

/** Força o fechamento do menu */
function closeMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
}
// --- FIM DA NOVA SEÇÃO ---


/**
 * Lida com o envio do formulário (mensagem do usuário)
 * (LÓGICA DO LOADING "..." JÁ ESTÁ AQUI)
 */
async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = messageInput.value.trim();

    if (!userMessage) return;

    displayMessage(userMessage, 'user');
    messageInput.value = '';

    // --- (EXISTENTE) Indicador de Carregamento "..." ---
    const loadingMessage = displayMessage('', 'bot loading');
    // --- FIM ---

    try {
        const botResponse = await processUserMessage(userMessage);
        
        // (EXISTENTE) Remove o "..." e mostra a resposta
        loadingMessage.remove(); 
        displayMessage(botResponse, 'bot');

    } catch (error) {
        // (EXISTENTE) Remove o "..." em caso de erro
        loadingMessage.remove(); 
        displayMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot');
        console.error("Erro completo:", error);
    }
}

/**
 * Adiciona uma mensagem à interface do chat
 * (LÓGICA DO LOADING "..." JÁ ESTÁ AQUI)
 */
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;

    // (EXISTENTE) Se não for loading, processa o texto
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
* (SEU CÓDIGO ORIGINAL - SEM MUDANÇAS)
*/
async function processUserMessage(message) {
    const cleanedMessage = message.trim().replace(/[.!?]$/, '');
    const lowerMessage = cleanedMessage.toLowerCase();
    let match;

    console.log(`DEBUG: processUserMessage v8.0 recebido: "${message}" -> "${cleanedMessage}"`);

    // --- AÇÕES DE ESCRITA (POST) ---

    // 1. ADICIONAR ALUNO
    match = cleanedMessage.match(/(adicionar|cadastrar|novo)\s+alun(a|o)?\s*\[?(.*?)\]?\s*(?:no )?curso\s*\[?(.*?)\]?\s*(?:com |em |no )?inicio( em)?\s*\[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        // Grupos: 1(verbo), 2(a/o), 3(NOME), 4(CURSO), 5(em), 6(DATA)
        const [, , , nome_raw, curso_raw, , data_raw] = match; // CORRETO: Índices 3, 4, 6

        const nome = nome_raw ? nome_raw.trim() : '';
        const curso = curso_raw ? curso_raw.trim() : '';
        const dataInicio = data_raw ? data_raw.trim() : '';

        if (!nome || !curso || !dataInicio) {
            console.error("DEBUG v8.0: Match 'adicionar' falhou em capturar dados.", { nome, curso, dataInicio });
            return "Comando 'adicionar' incompleto. Use: Adicionar aluno [Nome] no curso [Curso] com inicio [dd/mm/aaaa]";
        }
        const dataToSend = { action: 'adicionar', nome, curso, dataInicio };
        console.log("DEBUG v8.0: Acionando Ação 1 (Adicionar). Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // 2. ADICIONAR OBSERVAÇÃO
    match = cleanedMessage.match(/(adicionar|nova)\s+(observação|obs|anotação)\s+\[?(.+?)\]?\s+(?:para|d[oa]|n[oa])\s*(?:[oa]\s+)?alun(?:a|o)?\s+\[?(.+?)\]?$/i);
    if (match) {
        console.log("DEBUG v8.0: Regex de Observação BATEU!");
        const [, , , obs_raw, nome_raw] = match; // Índices: 3, 4
        const obs = obs_raw ? obs_raw.trim() : '';
        const nome = nome_raw ? nome_raw.trim() : '';

        if (!obs || !nome) {
            console.error("DEBUG v8.0: Match 'atualizar_obs' falhou em capturar dados.", { obs, nome });
            return "Comando 'observação' incompleto. Use: Adicionar observação [Texto] para o aluno [Nome]";
        }
        const dataToSend = { action: 'atualizar_obs', nome, obs };
        console.log("DEBUG v8.0: Acionando Ação 2 (Observação). Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // 3. ATUALIZAR DATA
    match = cleanedMessage.match(/(atualizar|mudar)\s+data\s+d(?:o|a)\s+alun(?:a|o)?\s+\[?(.*?)\]?\s+para\s+\[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        console.log("DEBUG v8.0: Regex de Atualizar Data BATEU!");
        // Grupos: 1(verbo), 2(NOME), 3(DATA)
        const [, , nome_raw, novaData_raw] = match; // CORRETO: Índices 2, 3
        const nome = nome_raw ? nome_raw.trim() : '';
        const novaData = novaData_raw ? novaData_raw.trim() : '';

        if (!nome || !novaData) {
            console.error("DEBUG v8.0: Match 'atualizar_data' falhou em capturar dados.", { nome, novaData });
            return "Comando 'atualizar data' incompleto. Use: Atualizar data do aluno [Nome] para [dd/mm/aaaa]";
        }
        const dataToSend = { action: 'atualizar_data', nome, novaData };
        console.log("DEBUG v8.0: Acionando Ação 3 (Atualizar Data). Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // 4. REMOVER ALUNO
    match = cleanedMessage.match(/(remover|excluir|deletar)\s+alun[ao]?\s+(.+)/i);
    if (match) {
        let nome = match[2].trim();
        nome = nome.replace(/^\[|\]$/g, '').trim();
        if (!nome) {
            console.error("DEBUG v8.0: Match 'remover' falhou em capturar nome.");

            return "Comando 'remover' incompleto. Use: Remover aluno [Nome]";
        }
        const dataToSend = { action: 'remover', nome: nome };
        console.log("DEBUG v8.0: Acionando Ação 4 (Remover). Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // --- CONSULTAR LOGINS DA TURMA ATUAL ---
    match = lowerMessage.match(/(quais|me de|me da|os)\s+(logins?|senhas?)\s+(d[ao]s?\s+)?(alunos?\s+)?(de\s+)?(agora|hoje|atuais?)/i);
    if (match) {
        console.log("DEBUG v8.0: Acionando Consulta de Logins da Turma Atual.");
        return await getDataFromAPI('logins_agora', {}, 'logins_agora');
    }

    console.log("DEBUG v8.0: Nenhuma Ação (POST) bateu. Verificando Consultas (GET)...");

    // --- AÇÕES DE CONSULTA (GET) ---

    // 5. CONSULTA: DATA ESPECÍFICA
    match = lowerMessage.match(/(?:no dia|para a data de)\s+(\d{2}\/\d{2}\/\d{4})/);
    if (match) {
        const dataBusca = match[1];
        console.log("DEBUG v8.0: Acionando Consulta 5 (Data Específica). Data:", dataBusca);
        return await getDataFromAPI('data_especifica', { data: dataBusca });
    }

    // 6. CONSULTA: PRÓXIMOS [N] DIAS
    match = lowerMessage.match(/próximos\s+(\d+)\s+dias/);
    if (match) {
        const dias = match[1];
        console.log("DEBUG v8.0: Acionando Consulta 6 (Próximos Dias). Dias:", dias);
        return await getDataFromAPI('proximos_dias', { dias: dias });
    }

    // 7. CONSULTA: ESSA SEMANA
    if (lowerMessage.includes('essa semana') || lowerMessage.includes('esta semana') || lowerMessage.includes('nos próximos 7 dias')) {
        console.log("DEBUG v8.0: Acionando Consulta 7 (Semana).");
        return await getDataFromAPI('semana');
    }

    // 8. CONSULTA: MÊS QUE VEM
    if (lowerMessage.includes('mês que vem') || lowerMessage.includes('proximo mes')) {
        console.log("DEBUG v8.0: Acionando Consulta 8 (Mês Que Vem).");
        return await getDataFromAPI('mes_que_vem');
    }

    // 9. CONSULTA: ANO QUE VEM
    if (lowerMessage.includes('ano que vem') || lowerMessage.includes('proximo ano')) {
        console.log("DEBUG v8.0: Acionando Consulta 9 (Ano Que Vem).");
        return await getDataFromAPI('ano_que_vem');
    }

    // 10. CONSULTA: MÊS ESPECÍFICO
    match = lowerMessage.match(/em\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/i);
    if (match) {
        const mes = match[1];
        console.log("DEBUG v8.0: Acionando Consulta 10 (Mês Específico). Mês:", mes);
        return await getDataFromAPI('mes', { mes: mes });
    }

    // 11. CONSULTA: ATRASADO
    if (lowerMessage.includes('atrasado') || lowerMessage.includes('vencido') || lowerMessage.includes('fora do prazo')) {
        console.log("DEBUG v8.0: Acionando Consulta 11 (Atrasado).");
        return await getDataFromAPI('atrasado');
    }

    // 12. CONSULTA POR ANO DE CONCLUSÃO
    match = lowerMessage.match(/(?:quem|aluno|conclusão|finaliza|termina|ano)\s.*?\s(\d{4})/i);
    if (match) {
        const anoBusca = match[1];
        if (anoBusca && parseInt(anoBusca) > 2000 && parseInt(anoBusca) < 2100) {
            console.log("DEBUG v8.0: Acionando Consulta 12 (Ano Conclusão). Ano:", anoBusca);
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
                'logins', 'senhas', 'agora', 'hoje'
            ];
            const isStopWord = stopWords.includes(nomeBusca.toLowerCase());
            const hasNumbersOrSlash = /[\d\/]/.test(nomeBusca);
            if (!isStopWord && !hasNumbersOrSlash && nomeBusca.length > 1) {
                console.log("DEBUG v8.0: Acionando Consulta 13 (Nome Aluno). Nome:", nomeBusca);
                return await getDataFromAPI('nome_aluno', { nome: nomeBusca });
            } else {
                console.log("DEBUG v8.0: Possível match de nome (", nomeBusca, ") ignorado.");
            }
        }
    }

    // Se NENHUM comando for reconhecido
    console.log("DEBUG v8.0: Nenhum comando reconhecido.");
    return "Desculpe, não entendi o comando. Tente os exemplos ao lado.";
}


/**
 * Função para ENVIAR dados (POST) para o Google Apps Script
 * (SEU CÓDIGO ORIGINAL - SEM MUDANÇAS)
 */
async function sendDataToAPI(data) {
    console.log("DEBUG: sendDataToAPI chamado com:", data); 

    if (typeof API_URL === 'undefined') {
        throw new Error("API_URL não está definida. Verifique seu arquivo HTML.");
    }

    const response = await fetch(API_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'text/plain',
        },
        body: JSON.stringify(data),
        redirect: 'follow'
    });

    const responseText = await response.text();
    console.log("DEBUG: Resposta crua da API (POST):", responseText);

    if (!response.ok) {
        console.error(`Erro HTTP ${response.status} da API (POST). Resposta: ${responseText}`);
        if (responseText.includes("SyntaxError") || responseText.includes("Error:")) {
            throw new Error(`Erro no script da API (verificar logs do Google): ${responseText.substring(0, 150)}...`);
        }
        throw new Error(`Erro de rede ou servidor (${response.status}) ao contactar a API.`);
    }

    try {
        const result = JSON.parse(responseText);
        console.log("DEBUG: Resposta parseada da API (POST):", result);
        if (result.status === 'success') {
            return result.message;
        } else {
            throw new Error(result.message || "A API retornou um erro sem mensagem específica.");
        }
    } catch (parseError) {
        console.error("Erro ao parsear JSON da API (POST):", parseError);
        throw new Error(`A API (POST) retornou uma resposta inesperada (não JSON): ${responseText.substring(0, 100)}... Verifique os logs do Google Apps Script.`);
    }
}


/**
 * Função para BUSCAR dados (GET) do Google Apps Script
 * (SEU CÓDIGO ORIGINAL - SEM MUDANÇAS)
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
    console.log(`DEBUG: getDataFromAPI chamando URL: ${url.toString()}`);

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
    });

    const responseText = await response.text();
    console.log("DEBUG: Resposta crua da API (GET):", responseText);

    if (!response.ok) {
        console.error(`Erro HTTP ${response.status} da API (GET). Resposta: ${responseText}`);
        if (responseText.includes("SyntaxError") || responseText.includes("Error:")) {
            throw new Error(`Erro no script da API (GET) (verificar logs do Google): ${responseText.substring(0, 150)}...`);
        }
        throw new Error(`Erro de rede ou servidor (${response.status}) ao contactar a API (GET).`);
    }

    try {
        const result = JSON.parse(responseText);
        console.log("DEBUG: Resposta parseada da API (GET):", result);
        if (result.status === 'success') {
            return result.data;
        } else {
            throw new Error(result.message || "A API (GET) retornou um erro sem mensagem.");
        }
    } catch (parseError) {
        console.error("Erro ao parsear JSON da API (GET):", parseError);
        throw new Error(`A API (GET) retornou uma resposta inesperada (não JSON): ${responseText.substring(0, 100)}... Verifique os logs do Google Apps Script.`);
    }
}
