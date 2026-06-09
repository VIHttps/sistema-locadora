// FUNÇÕES UTILITÁRIAS REUTILIZÁVEIS EM TODAS AS PÁGINAS.HTML
// Centraliza funções repetitivas para evitar códigos duplicados

// ==================== FUNÇÃO PARA EXIBIR MENSAGENS DE ERRO/ SUCESSO AO USUÁRIO ====================

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

// ==================== PREENCHER UM ELEMENTO SELECT ====================

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

// ==================== FUNÇÃO AUXILIAR PARA FORMATAR VALORES MONETÁRIOS ====================
function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return '';
    return 'r$ ' + Number(valor).toFixed(2).replace('.', ',');
}

// ==================== FUNÇÃO PARA "ESCAPAR" CARACTERES ESPECIAIS ( PREVENÇÃO DE INJEÇÃO ) ( TESTE )====================
function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}