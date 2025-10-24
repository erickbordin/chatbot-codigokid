// Arquivo: script.js (VERSÃO FINAL 6.0 - Calcula Previsão Automaticamente)

// --- Elementos do DOM ---
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

// --- Event Listeners ---
chatForm.addEventListener('submit', handleSubmit);

/**
 * Lida com o envio do formulário (mensagem do usuário)
 */
async function handleSubmit(e) {
    e.preventDefault();
    const userMessage = messageInput.value.trim();

    if (!userMessage) return;

    displayMessage(userMessage, 'user');
    messageInput.value = '';
    const loadingMessage = displayMessage('...', 'bot loading');

    try {
        const botResponse = await processUserMessage(userMessage);
        loadingMessage.remove();
        displayMessage(botResponse, 'bot');

    } catch (error) {
        loadingMessage.remove();
        displayMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot');
    }
}

/**
 * Adiciona uma mensagem à interface do chat
 */
function displayMessage(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender}-message`;
    message = message.replace(/\n/g, '<br>');
    messageElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}

/**
 * Interpreta a mensagem do usuário e decide qual ação tomar (GET ou POST).
 */
async function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    let match;

    // --- AÇÕES DE ESCRITA (POST) ---

    // 1. ADICIONAR ALUNO (REGEX ATUALIZADA - SEM PREVISÃO)
    // --- A CORREÇÃO ESTÁ AQUI ---
    // Removemos a parte "e previsão..." da Regex
    match = message.match(/adicionar aluno \[?(.*?)\]? no curso \[?(.*?)\]? com inicio \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        // Captura apenas 3 argumentos
        const [, nome, curso, dataInicio] = match;
        console.log("DEBUG: Enviando para adicionar (v6.0):", { action: 'adicionar', nome: nome.trim(), curso: curso.trim(), dataInicio: dataInicio.trim() });
        return await sendDataToAPI({
            action: 'adicionar',
            nome: nome.trim(),
            curso: curso.trim(),
            dataInicio: dataInicio.trim() // Não envia mais 'dataPrevisao'
        });
    }
    // --- FIM DA CORREÇÃO ---


    // 2. ADICIONAR OBSERVAÇÃO (Regex OK)
    match = message.match(/adicionar observação \[?(.+?)\]? para o aluno \[?(.+?)\]?$/i);
    if (match) {
        const [, obs, nome] = match;
        console.log("DEBUG: Enviando para atualizar_obs:", { action: 'atualizar_obs', nome: nome.trim(), obs: obs.trim() });
        return await sendDataToAPI({
            action: 'atualizar_obs',
            nome: nome.trim(),
            obs: obs.trim()
        });
    }

    // 3. ATUALIZAR DATA (Regex OK)
    match = message.match(/atualizar data do aluno \[?(.*?)\]? para \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, nome, novaData] = match;
        console.log("DEBUG: Enviando para atualizar_data:", { action: 'atualizar_data', nome: nome.trim(), novaData: novaData.trim() });
        return await sendDataToAPI({
            action: 'atualizar_data',
            nome: nome.trim(),
            novaData: novaData.trim()
        });
    }

    // 4. REMOVER ALUNO (Regex OK)
    match = message.match(/remover aluno \[?(.*?)\]?/i);
    if (match) {
        const [, nome] = match;
        console.log("DEBUG: Enviando para remover:", { action: 'remover', nome: nome.trim() });
        return await sendDataToAPI({
            action: 'remover',
            nome: nome.trim()
        });
    }


    // --- AÇÕES DE CONSULTA (GET) ---
    // (Não mudam)
    if (lowerMessage.includes('atrasado')) {
        return await getDataFromAPI('atrasado');
    }
    // ... (resto dos comandos GET continua igual) ...
    if (lowerMessage.includes('essa semana')) {
        return await getDataFromAPI('semana');
    }
    match = lowerMessage.match(/próximos (\d+) dias/);
    if (match) {
        return await getDataFromAPI('proximos_dias', { dias: match[1] });
    }
    match = lowerMessage.match(/no dia (\d{2}\/\d{2}\/\d{4})/);
    if (match) {
        return await getDataFromAPI('data_especifica', { data: match[1] });
    }
    match = lowerMessage.match(/em (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    if (match) {
        return await getDataFromAPI('mes', { mes: match[1] });
    }
    if (lowerMessage.includes('mês que vem')) {
        return await getDataFromAPI('mes_que_vem');
    }
    if (lowerMessage.includes('ano que vem')) {
        return await getDataFromAPI('ano_que_vem');
    }

    // Se nenhum comando for reconhecido
    return "Desculpe, não entendi o comando. Tente 'atrasado', 'próximos 30 dias', 'em novembro', 'adicionar', 'remover' ou 'atualizar'.";
}

/**
 * Função para ENVIAR dados (POST) para o Google Apps Script (COM WORKAROUND CORS)
 */
async function sendDataToAPI(data) {
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
    console.log("DEBUG: Resposta crua da API:", responseText);
    try {
        const result = JSON.parse(responseText); 
        if (result.status === 'success') {
            return result.message;
        } else {
             throw new Error(result.message || "Erro desconhecido retornado pela API.");
        }
    } catch (parseError) {
         console.error("Erro ao parsear JSON da API:", parseError);
         throw new Error(`A API retornou uma resposta inesperada (não JSON): ${responseText.substring(0, 100)}...`);
    }
}


/**
 * Função para BUSCAR dados (GET) do Google Apps Script
 */
async function getDataFromAPI(filtro, params = {}) {
    // ... (código getDataFromAPI continua igual) ...
    const url = new URL(API_URL);
    url.searchParams.append('action', 'consultar');
    url.searchParams.append('filtro', filtro);

    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
    });
    const result = await response.json();
    if (result.status === 'success') {
        return result.data;
    } else {
        throw new Error(result.message);
    }
}