// Arquivo: script.js (VERSÃO FINAL 6.9 - Regex Remover Simplificada)

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
    const loadingMessage = displayMessage('Processando...', 'bot loading'); // Mensagem melhorada

    try {
        const botResponse = await processUserMessage(userMessage);
        loadingMessage.remove();
        displayMessage(botResponse, 'bot');

    } catch (error) {
        loadingMessage.remove();
        // Exibe a mensagem de erro que veio da API ou do fetch
        displayMessage(`Desculpe, ocorreu um erro: ${error.message}`, 'bot');
        console.error("Erro completo:", error); // Loga o erro completo no console
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
    // Tenta remover pontuações comuns do final da mensagem para flexibilizar
    const cleanedMessage = message.trim().replace(/[.!?]$/, '');
    const lowerMessage = cleanedMessage.toLowerCase();
    let match;

    console.log(`DEBUG: processUserMessage recebido: "${message}" -> "${cleanedMessage}"`); // Log inicial

    // --- AÇÕES DE ESCRITA (POST) ---

    // 1. ADICIONAR ALUNO (FLEXÍVEL)
    match = cleanedMessage.match(/(adicionar|cadastrar|novo) alun(a|o)? \[?(.*?)\]? (no )?curso \[?(.*?)\]? (com |em )?inicio( em)? \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , , nome, , curso, , , dataInicio] = match;
        const dataToSend = { action: 'adicionar', nome: nome.trim(), curso: curso.trim(), dataInicio: dataInicio.trim() };
        console.log("DEBUG: Match 'adicionar'. Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // 2. ADICIONAR OBSERVAÇÃO (FLEXÍVEL)
    match = cleanedMessage.match(/(adicionar|nova) (observação|obs|anotação) \[?(.+?)\]? (para|do|no) alun(a|o)? \[?(.+?)\]?$/i);
    if (match) {
        const [, , , obs, , , nome] = match;
         // Verifica se o nome capturado não é uma palavra de comando óbvia
        if (nome && nome.length > 1 && !/^(curso|inicio|data|para)$/i.test(nome.trim())) {
             const dataToSend = { action: 'atualizar_obs', nome: nome.trim(), obs: obs.trim() };
             console.log("DEBUG: Match 'atualizar_obs'. Enviando:", dataToSend);
             return await sendDataToAPI(dataToSend);
        } else {
             console.log("DEBUG: Match 'atualizar_obs' FALSO POSITIVO. Nome capturado inválido:", nome);
        }
    }

    // 3. ATUALIZAR DATA (FLEXÍVEL)
    match = cleanedMessage.match(/(atualizar|mudar) (a )?data d(o|a) alun(a|o)? \[?(.*?)\]? para \[?(\d{2}\/\d{2}\/\d{4})\]?/i);
    if (match) {
        const [, , , , , nome, novaData] = match;
        const dataToSend = { action: 'atualizar_data', nome: nome.trim(), novaData: novaData.trim() };
        console.log("DEBUG: Match 'atualizar_data'. Enviando:", dataToSend);
        return await sendDataToAPI(dataToSend);
    }

    // 4. REMOVER ALUNO (REGEX SIMPLIFICADA E TESTADA)
    // --- CORREÇÃO AQUI ---
    // Exige 'remover/excluir/deletar', espaço, 'aluno/aluna', espaço, e captura o resto.
    match = cleanedMessage.match(/(remover|excluir|deletar)\s+alun[ao]?\s+(.+)/i);
    if (match) {
        // O nome é o segundo grupo capturado (.+)
        let nome = match[2].trim();
        // Remove colchetes se existirem
        nome = nome.replace(/^\[|\]$/g, '').trim();
        const dataToSend = { action: 'remover', nome: nome };
        console.log("DEBUG: Match 'remover'. Enviando:", dataToSend); // DEBUG ADICIONADO AQUI
        return await sendDataToAPI(dataToSend);
    }
    // --- FIM DA CORREÇÃO ---


    // --- AÇÕES DE CONSULTA (GET) ---
    console.log("DEBUG: Verificando ações GET..."); // Log para ver se chega aqui

    // 5. CONSULTA: DATA ESPECÍFICA
    match = lowerMessage.match(/no dia (\d{2}\/\d{2}\/\d{4})|para a data de (\d{2}\/\d{2}\/\d{4})/);
    if (match) {
        const dataBusca = match[1] || match[2];
        console.log("DEBUG: Match 'data_especifica'. Data:", dataBusca);
        return await getDataFromAPI('data_especifica', { data: dataBusca });
    }

    // 6. CONSULTA: PRÓXIMOS [N] DIAS
    match = lowerMessage.match(/próximos (\d+) dias/);
    if (match) {
        const dias = match[1];
        console.log("DEBUG: Match 'proximos_dias'. Dias:", dias);
        return await getDataFromAPI('proximos_dias', { dias: dias });
    }

    // 7. CONSULTA: ESSA SEMANA
    if (lowerMessage.includes('essa semana') || lowerMessage.includes('esta semana') || lowerMessage.includes('nos próximos 7 dias')) {
        console.log("DEBUG: Match 'semana'.");
        return await getDataFromAPI('semana');
    }

    // 8. CONSULTA: MÊS QUE VEM
    if (lowerMessage.includes('mês que vem') || lowerMessage.includes('proximo mes')) {
        console.log("DEBUG: Match 'mes_que_vem'.");
        return await getDataFromAPI('mes_que_vem');
    }

    // 9. CONSULTA: ANO QUE VEM
    if (lowerMessage.includes('ano que vem') || lowerMessage.includes('proximo ano')) {
        console.log("DEBUG: Match 'ano_que_vem'.");
        return await getDataFromAPI('ano_que_vem');
    }

    // 10. CONSULTA: MÊS ESPECÍFICO
    match = lowerMessage.match(/em (janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)/);
    if (match) {
        const mes = match[1];
        console.log("DEBUG: Match 'mes'. Mês:", mes);
        return await getDataFromAPI('mes', { mes: mes });
    }

    // 11. CONSULTA: ATRASADO
    if (lowerMessage.includes('atrasado') || lowerMessage.includes('vencido') || lowerMessage.includes('fora do prazo')) {
        console.log("DEBUG: Match 'atrasado'.");
        return await getDataFromAPI('atrasado');
    }

    // 12. CONSULTA POR ANO DE CONCLUSÃO
    match = lowerMessage.match(/(?:quem|aluno|conclusão|finaliza|termina|ano).*?(\d{4})/);
    if (match) {
        const anoBusca = match[1]; // Correção: Era match[2] antes
        if (anoBusca && parseInt(anoBusca) > 2000 && parseInt(anoBusca) < 2100) {
             console.log("DEBUG: Match 'ano_conclusao'. Ano:", anoBusca);
           return await getDataFromAPI('ano_conclusao', { ano: anoBusca });
        }
    }

    // 13. CONSULTA POR NOME (MAIS VARIAÇÕES) - Última tentativa
    // Tenta capturar nomes após palavras-chave ou como a última palavra (possivelmente com colchetes)
    match = cleanedMessage.match(/(?:aluno|nome|buscar|consultar|existe|quem é|informações d[oa])\s+\[?(.+?)\??\]?$|temos algum(?:a)? aluno(?:a)? (?:com o nome|chamado)\s+\[?(.+?)\??\]?$|(?:^|\s)\[?([a-zA-ZÀ-ú\s]+)\??\]?$/i);
     if (match) {
        let nomeBusca = match[1] || match[2] || match[3];
        if (nomeBusca) {
            nomeBusca = nomeBusca.trim(); // Limpa espaços extras

            // Palavras-chave que indicam OUTROS comandos (para evitar busca de nome)
            const commandKeywords = [
                'atrasado', 'semana', 'mes', 'dia', 'remover', 'adicionar', 'atualizar',
                'excluir', 'deletar', 'cadastrar', 'novo', 'mudar', 'observação', 'obs',
                'anotação', 'próximos', 'proximo', 'ano'
            ];
             const isJustDigits = /^\d+$/.test(nomeBusca);
             // Verifica se a busca INTEIRA é só uma palavra de comando
             const isCommandWord = commandKeywords.includes(nomeBusca.toLowerCase());

            if (!isJustDigits && !isCommandWord && nomeBusca.length > 1) {
                console.log("DEBUG: Match 'nome_aluno'. Nome:", nomeBusca);
                return await getDataFromAPI('nome_aluno', { nome: nomeBusca });
            }
        }
    }


    // Se NENHUM comando for reconhecido
    console.log("DEBUG: Nenhum comando reconhecido.");
    return "Desculpe, não entendi o comando. Tente comandos sobre datas ('próximos 30 dias', 'em novembro'), status ('atrasado') ou alunos ('aluno João', 'quem finaliza em 2027').";
}

/**
 * Função para ENVIAR dados (POST) para o Google Apps Script (COM WORKAROUND CORS)
 */
async function sendDataToAPI(data) {
    console.log("DEBUG: sendDataToAPI chamado com:", data); // Log antes do fetch
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
    console.log("DEBUG: Resposta crua da API:", responseText); // Log da resposta crua

    // Verifica se a resposta foi OK (status 200-299)
    if (!response.ok) {
         console.error(`Erro HTTP ${response.status} da API. Resposta: ${responseText}`);
         // Tenta dar uma mensagem de erro mais útil se for erro de script
         if (responseText.includes("SyntaxError") || responseText.includes("Error:")) {
              throw new Error(`Erro no script da API (verificar logs do Google): ${responseText.substring(0,150)}...`);
         }
         throw new Error(`Erro de rede ou servidor (${response.status}) ao contactar a API.`);
    }

    try {
        const result = JSON.parse(responseText);
        console.log("DEBUG: Resposta parseada da API:", result); // Log da resposta parseada
        if (result.status === 'success') {
            return result.message;
        } else {
             // Usa a mensagem de erro específica do backend
             throw new Error(result.message || "A API retornou um erro sem mensagem específica.");
        }
    } catch (parseError) {
        console.error("Erro ao parsear JSON da API:", parseError);
        // A resposta não foi JSON, o que indica um erro sério no backend ou na comunicação
        throw new Error(`A API retornou uma resposta inesperada (não JSON): ${responseText.substring(0, 100)}... Verifique os logs do Google Apps Script.`);
    }
}


/**
 * Função para BUSCAR dados (GET) do Google Apps Script
 */
async function getDataFromAPI(filtro, params = {}) {
    const url = new URL(API_URL);
    url.searchParams.append('action', 'consultar');
    url.searchParams.append('filtro', filtro);
    for (const key in params) {
        url.searchParams.append(key, params[key]);
    }
    console.log(`DEBUG: getDataFromAPI chamando URL: ${url.toString()}`); // Log da URL GET

    const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
    });

    const responseText = await response.text(); // Pega como texto primeiro
    console.log("DEBUG: Resposta crua da API (GET):", responseText);

    if (!response.ok) {
         console.error(`Erro HTTP ${response.status} da API (GET). Resposta: ${responseText}`);
          if (responseText.includes("SyntaxError") || responseText.includes("Error:")) {
              throw new Error(`Erro no script da API (GET) (verificar logs do Google): ${responseText.substring(0,150)}...`);
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
