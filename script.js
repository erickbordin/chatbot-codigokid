// Arquivo: script.js (VERSÃO FINAL 6.6 - Limpeza de caracteres)

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
    // Converte quebras de linha \n em tags <br> para exibição no HTML
    message = message.replace(/\n/g, '<br>');
    messageElement.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}

/**
 * Interpreta a mensagem do usuário e decide qual ação tomar (GET ou POST).
 * (VERSÃO 6.6 - Baseada na 6.5, mas limpa)
 */
async function processUserMessage(message) {
    const lowerMessage = message.toLowerCase();
    let match;

    // --- AÇÕES DE ESCRITA (POST) ---

    // 1. ADICIONAR ALUNO (FLEXÍVEL)
    match = lowerMessage.match(/(adicionar|cadastrar|novo) alun(a|o)? \[?(.*?)\]? (no )?curso \[?(.*?)\]? (com |em )?inicio( em)? \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , , nome, , curso, , , dataInicio] = match;
        console.log("DEBUG: Enviando para adicionar (v6.6):", { action: 'adicionar', nome: nome.trim(), curso: curso.trim(), dataInicio: dataInicio.trim() });
        return await sendDataToAPI({ action: 'adicionar', nome: nome.trim(), curso: curso.trim(), dataInicio: dataInicio.trim() });
    }

    // 2. ADICIONAR OBSERVAÇÃO (FLEXÍVEL)
    match = lowerMessage.match(/(adicionar|nova) (observação|obs|anotação) \[?(.+?)\]? (para|do|no) alun(a|o)? \[?(.+?)\]?$/i);
    if (match) {
        const [, , , obs, , , nome] = match;
        console.log("DEBUG: Enviando para atualizar_obs (v6.6):", { action: 'atualizar_obs', nome: nome.trim(), obs: obs.trim() });
        return await sendDataToAPI({ action: 'atualizar_obs', nome: nome.trim(), obs: obs.trim() });
    }

    // 3. ATUALIZAR DATA (FLEXÍVEL)
    match = lowerMessage.match(/(atualizar|mudar) (a )?data d(o|a) alun(a|o)? \[?(.*?)\]? para \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , , , , nome, novaData] = match;
        console.log("DEBUG: Enviando para atualizar_data (v6.6):", { action: 'atualizar_data', nome: nome.trim(), novaData: novaData.trim() });
        return await sendDataToAPI({ action: 'atualizar_data', nome: nome.trim(), novaData: novaData.trim() });
    }

    // 4. REMOVER ALUNO (FLEXÍVEL)
    match = lowerMessage.match(/(remover|excluir|deletar) alun(a|o)? \[?(.*?)\]?/i);
    if (match) {
        const [, , , nome] = match;
        console.log("DEBUG: Enviando para remover (v6.6):", { action: 'remover', nome: nome.trim() });
        return await sendDataToAPI({ action: 'remover', nome: nome.trim() });
    }


    // --- AÇÕES DE CONSULTA (GET) ---

    // 5. CONSULTA: DATA ESPECÍFICA 
    match = lowerMessage.match(/no dia (\d{2}\/\d{2}\/\d{4})|para a data de (\d{2}\/\d{2}\/\d{4})/);
    if (match) {
        const dataBusca = match[1] || match[2];
        return await getDataFromAPI('data_especifica', { data: dataBusca });
    }

    // 6. CONSULTA: PRÓXIMOS [N] DIAS 
    match = lowerMessage.match(/próximos (\d+) dias/);
    if (match) {
        return await getDataFromAPI('proximos_dias', { dias: match[1] });
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
    match = lowerMessage.match(/em (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    if (match) {
        return await getDataFromAPI('mes', { mes: match[1] });
    }

    // 11. CONSULTA: ATRASADO
    if (lowerMessage.includes('atrasado') || lowerMessage.includes('vencido') || lowerMessage.includes('fora do prazo')) {
        return await getDataFromAPI('atrasado');
    }

    // 12. CONSULTA POR ANO DE CONCLUSÃO 
    match = lowerMessage.match(/(quem|aluno|conclusão|finaliza|termina|ano).*?(\d{4})/);
    if (match) {
        const anoBusca = match[2];
        return await getDataFromAPI('ano_conclusao', { ano: anoBusca });
    }

    // 13. CONSULTA POR NOME (MAIS VARIAÇÕES)
    match = message.match(/(aluno|nome|buscar|consultar|existe) (\S+)|temos algum aluno (com o nome|chamado) (\S+)|(\S+)\??/i);
    if (match) {
        let nomeBusca = match[2] || match[4] || match[5];
        if (nomeBusca) {
            nomeBusca = nomeBusca.replace('?', ''); // Limpa o '?' se houver

            // Adiciona palavras de comando para evitar que elas virem buscas de nome
            const stopWords = [
                'atrasado', 'semana', 'mes', 'dia', 'ajuda', 'oi', 'ola', 'bom', 'boa', 'tarde', 'noite',
                'quem', 'qual', 'quais', 'remover', 'adicionar', 'atualizar', 'excluir', 'deletar',
                'cadastrar', 'novo', 'mudar'
            ];

            if (!stopWords.includes(nomeBusca.toLowerCase())) {
                return await getDataFromAPI('nome_aluno', { nome: nomeBusca.trim() });
            }
        }
    }

    // Se NENHUM comando for reconhecido
    return "Desculpe, não entendi o comando. Tente comandos sobre datas ('próximos 30 dias', 'em novembro'), status ('atrasado') ou alunos ('aluno João', 'quem finaliza em 2027').";
}

/**
 * Função para ENVIAR dados (POST) para o Google Apps Script (COM WORKAROUND CORS)
 */
async function sendDataToAPI(data) {
    // Esta função depende da variável 'API_URL' definida no seu arquivo HTML
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
            // O 'S' ALEATÓRIO FOI REMOVIDO DAQUI
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
    // Esta função depende da variável 'API_URL' definida no seu arquivo HTML
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
    // O 'JSON' ALEATÓRIO FOI REMOVIDO DAQUI
    if (result.status === 'success') {
        return result.data;
    } else {
        throw new Error(result.message);
    }
}
