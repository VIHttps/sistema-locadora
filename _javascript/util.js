// FUNÇÕES UTILITÁRIAS REUTILIZÁVEIS EM TODAS AS PÁGINAS.HTML
// Centraliza funções repetitivas para evitar códigos duplicados

//⚠️========================⚠️
// PROCESSOS A SEREM INSERIDOS (AVALIAR POSSIBILIDADE DE SIMPLIFICAÇÃO)
//  ========================
//  bloco de código aqui para: função de sucesso ou erro ao usuário
//  bloco de código aqui para: função para preencher um elemento <select> com opções vindas da API
//  bloco de código aqui para: função para limpar um formulário pelos IDS dos campos ex:
//  function limparFormulario(camposIds) {
//  camposIds.forEach(id => { const campo = document.getElementById(id);...
//⚠️========================⚠️
// _javascript/utils.js
// funcoes utilitarias reutilizaveis em todas as paginas

// funcao para exibir mensagens de sucesso ou erro ao usuario
function exibirMensagem(mensagem, tipo) {
    // procura um elemento com id 'mensagem' na pagina
    const divMensagem = document.getElementById('mensagem');
    
    if (divMensagem) {
        // se existir, insere a mensagem formatada
        divMensagem.innerHTML = '<div class="mensagem ' + tipo + '">' + mensagem + '</div>';
        // remove a mensagem apos 3 segundos
        setTimeout(function() {
            divMensagem.innerHTML = '';
        }, 3000);
    } else {
        // se nao existir elemento 'mensagem', usa alert como fallback
        alert(mensagem);
    }
}

// funcao para preencher um elemento select com dados vindos de uma api
// url: endereco da api (ex: '/api/clientes')
// selectId: id do elemento select no html (ex: 'cliente')
// valorId: nome da propriedade que sera usada como value (ex: 'cli_id')
// textoId: nome da propriedade que sera exibida no option (ex: 'cli_nome')
function preencherSelect(url, selectId, valorId, textoId) {
    fetch(url)
        .then(function(resposta) {
            if (!resposta.ok) {
                throw new Error('erro ao carregar dados');
            }
            return resposta.json();
        })
        .then(function(dados) {
            const select = document.getElementById(selectId);
            if (!select) return;
            
            // mantem a primeira opcao padrao
            select.innerHTML = '<option value="">selecione...</option>';
            
            // adiciona cada item como uma option
            for (let i = 0; i < dados.length; i++) {
                const option = document.createElement('option');
                option.value = dados[i][valorId];
                option.textContent = dados[i][textoId];
                select.appendChild(option);
            }
        })
        .catch(function(erro) {
            console.error('erro ao preencher select:', erro);
            exibirMensagem('erro ao carregar opcoes', 'erro');
        });
}

// funcao auxiliar para formatar valores monetarios
function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '';
    return 'r$ ' + Number(valor).toFixed(2).replace('.', ',');
}

// funcao auxiliar para escapar caracteres especiais (previne injecao)
function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}