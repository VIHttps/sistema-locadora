
// controla a visualizacao em acordeao das locacoes por cliente
// permite expandir/colapsar cada cliente e visualizar seus filmes locados
// fornece botao para registrar devolucao de cada item
// fornece botao para excluir locacao inteira (apenas se nenhum item foi devolvido)

// carrega as locacoes quando o botao for clicado
document.getElementById('btnCarregar').addEventListener('click', carregarLocacoes);

// funcao principal para buscar e exibir os dados agrupados
async function carregarLocacoes() {
    const container = document.getElementById('accordionContainer');
    container.innerHTML = '<p>Carregando locacoes...</p>';
    
    try {
        const response = await fetch('/api/locacoes/agrupadas');
        if (!response.ok) throw new Error('Erro ao carregar dados');
        const dados = await response.json();
        
        renderizarAccordion(dados);
    } catch (error) {
        console.error('erro:', error);
        container.innerHTML = `<p class="erro">Erro ao carregar: ${error.message}</p>`;
        exibirMensagem(error.message, 'erro');
    }
}

// renderiza a estrutura do acordeao a partir dos dados recebidos
function renderizarAccordion(dados) {
    const container = document.getElementById('accordionContainer');
    container.innerHTML = '';
    
    if (dados.length === 0) {
        container.innerHTML = '<p>Nenhuma locacao encontrada</p>';
        return;
    }
    
    dados.forEach(item => {
        const cliente = item.cliente;
        const locacoes = item.locacoes;
        
        // cria o container de cada cliente
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        // cabecalho com dados do cliente
        const header = document.createElement('div');
        header.className = 'accordion-header';
        header.innerHTML = `
            <span><strong>ID: ${cliente.id}</strong> | ${escapeHtml(cliente.nome)}</span>
            <span>Saldo: R$ ${cliente.saldo.toFixed(2)}</span>
        `;
        
        // conteudo que sera expandido (tabela de filmes)
        const content = document.createElement('div');
        content.className = 'accordion-content';
        
        if (locacoes.length === 0) {
            content.innerHTML = '<p>Nenhuma locacao registrada para este cliente</p>';
        } else {
            // agrupa os itens por locacao (para exibir a data uma unica vez)
            const locacoesMap = new Map();
            locacoes.forEach(loc => {
                if (!locacoesMap.has(loc.loc_id)) {
                    locacoesMap.set(loc.loc_id, {
                        loc_id: loc.loc_id,
                        data: loc.loc_data_cad,
                        itens: []
                    });
                }
                locacoesMap.get(loc.loc_id).itens.push(loc);
            });
            
            let html = '';
            for (const [_, locacao] of locacoesMap) {
                const dataFormatada = new Date(locacao.data).toLocaleDateString('pt-BR');
                
                // verifica se todos os itens da locacao ainda nao foram devolvidos
                // para determinar se o botao de excluir locacao inteira deve ser exibido
                const todosItensNaoDevolvidos = locacao.itens.every(item => item.data_devolucao === null);
                
                html += `<h4 style="display: flex; justify-content: space-between; align-items: center;">
                    <span>Locacao #${locacao.loc_id} - ${dataFormatada}</span>
                    ${todosItensNaoDevolvidos ? `<button class="btn-excluir-locacao" data-id="${locacao.loc_id}">Excluir Locacao</button>` : ''}
                </h4>`;
                html += `<table class="inner-table">`;
                html += `<thead><tr><th>Filme</th><th>Categoria</th><th>Valor</th><th>Status</th><th>Acao</th></tr></thead><tbody>`;
                
                for (const item of locacao.itens) {
                    const devolvido = item.data_devolucao !== null;
                    const statusText = devolvido 
                        ? `Devolvido em ${new Date(item.data_devolucao).toLocaleDateString('pt-BR')}` 
                        : 'Alugado';
                    const statusClass = devolvido ? 'status-devolvido' : 'status-alugado';
                    
                    html += `
                        <tr data-item-id="${item.itn_id}">
                            <td>${escapeHtml(item.fil_nome)}</td>
                            <td>${escapeHtml(item.cat_nome)}</td>
                            <td>R$ ${parseFloat(item.itn_valor_loc).toFixed(2)}</td>
                            <td class="status-cell ${statusClass}">${statusText}</td>
                            <td>
                                ${!devolvido ? `<button class="btn-devolver" data-id="${item.itn_id}">Registrar Devolucao</button>` : '-'}
                            </td>
                        </tr>
                    `;
                }
                html += `</tbody></table><hr>`;
            }
            content.innerHTML = html;
        }
        
        // evento de clique para expandir/colapsar
        header.addEventListener('click', (e) => {
            // impede que o clique no botao de devolucao ou exclusao de locacao dispare a abertura
            if (e.target.classList && (e.target.classList.contains('btn-devolver') || e.target.classList.contains('btn-excluir-locacao'))) {
                return;
            }
            accordionItem.classList.toggle('active');
        });
        
        accordionItem.appendChild(header);
        accordionItem.appendChild(content);
        container.appendChild(accordionItem);
    });
    
    // adiciona os eventos dos botoes de devolucao (criados dinamicamente)
    document.querySelectorAll('.btn-devolver').forEach(btn => {
        btn.removeEventListener('click', handlerDevolucao);
        btn.addEventListener('click', handlerDevolucao);
    });
    
    // adiciona os eventos dos botoes de excluir locacao (criados dinamicamente)
    document.querySelectorAll('.btn-excluir-locacao').forEach(btn => {
        btn.removeEventListener('click', excluirLocacao);
        btn.addEventListener('click', excluirLocacao);
    });
}

// funcao chamada quando o botao registrar devolucao e clicado
async function handlerDevolucao(event) {
    // impede que o clique no botao tambem abra ou feche o acordeao
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const itemId = btn.getAttribute('data-id');
    
    // exibe mensagem de confirmacao para o usuario
    if (!confirm('Confirmar devolucao deste filme?')) return;
    
    // desabilita o botao e altera o texto para evitar cliques duplicados
    const textoOriginal = btn.textContent;
    btn.textContent = 'Processando...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`/api/itens/${itemId}/devolver`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao registrar devolucao');
        }
        
        // exibe mensagem de sucesso para o usuario
        exibirMensagem('Devolucao registrada com sucesso!', 'sucesso');
        
        // recarrega a lista de locacoes para mostrar a mudanca sem refresh manual
        await carregarLocacoes();
        
    } catch (error) {
        console.error('erro ao registrar devolucao:', error);
        exibirMensagem(error.message, 'erro');
        
        // restaura o botao original em caso de erro
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
}

// funcao para excluir uma locacao inteira
// verifica se todos os itens ainda estao alugados antes de permitir a exclusao
async function excluirLocacao(event) {
    // impede que o clique no botao tambem abra ou feche o acordeao
    event.stopPropagation();
    
    const btn = event.currentTarget;
    const locacaoId = btn.getAttribute('data-id');
    
    // exibe mensagem de confirmacao para o usuario
    if (!confirm(`Tem certeza que deseja excluir a locacao #${locacaoId}? Esta acao nao pode ser desfeita.`)) {
        return;
    }
    
    // desabilita o botao e altera o texto para evitar cliques duplicados
    const textoOriginal = btn.textContent;
    btn.textContent = 'Excluindo...';
    btn.disabled = true;
    
    try {
        const response = await fetch(`/api/locacoes/${locacaoId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao excluir locacao');
        }
        
        // exibe mensagem de sucesso para o usuario
        exibirMensagem(`Locacao #${locacaoId} excluida com sucesso!`, 'sucesso');
        
        // recarrega a lista de locacoes para mostrar a mudanca sem refresh manual
        await carregarLocacoes();
        
    } catch (error) {
        console.error('erro ao excluir locacao:', error);
        exibirMensagem(error.message, 'erro');
        
        // restaura o botao original em caso de erro
        btn.textContent = textoOriginal;
        btn.disabled = false;
    }
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