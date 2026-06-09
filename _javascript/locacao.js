let contadorItens = 1;
let filmesCache = [];
// ==================== INTERFACE ====================

    // Elementos da Interface
    const formLocacao = document.getElementById('formLocacao');
    const selCliente = document.getElementById('selCliente');
    const txtDataLocacao = document.getElementById('txtDataLocacao');
    const containerItensLocacao = document.getElementById('containerItensLocacao');
    
    // Botões de controle
    const btnAdicionarItem = document.getElementById('btnAdicionarItem');
    const btnCancelarLocacao = document.getElementById('btnCancelarLocacao');

   
// ==================== FUNÇÃO PARA CARREGAR CLIENTES ====================

    async function carregarClientes() {
        await preencherSelect('/api/clientes', 'selCliente', 'CLI_ID', 'CLI_NOME');
}

// ==================== FUNÇÃO PARA CARREGAR FILMES  ====================


async function carregarFilmes() {
    try {
        const response = await fetch('/api/filmes');
        if (!response.ok) throw new Error('Erro ao buscar filmes');
        filmesCache = await response.json();
        atualizarSelectsFilmes();
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}

// ==================== ATUALIZAR O SELECT DE FILMES ====================

function atualizarSelectsFilmes() {
    const selects = containerItensLocacao.querySelectorAll('.select-filme-item');
    selects.forEach(select => {
        const valorAtual = select.value;
        select.innerHTML = '<option value="">Selecione um filme...</option>';
        
        filmesCache.forEach(filme => {
            if (filme.QUANTIDADE > 0) {
                const option = document.createElement('option');
                option.value = filme.FIL_ID;
                option.textContent = `${filme.FIL_NOME} (estoque: ${filme.QUANTIDADE}) - R$ ${parseFloat(filme.ITN_VALOR_LOC || 10).toFixed(2)}`;
                option.dataset.valor = filme.ITN_VALOR_LOC || 10;
                select.appendChild(option);
            }
        });
        
        if (valorAtual) select.value = valorAtual;
    });
}

// ==================== ADICIONAR NOVO FILME AO FORMULÁRIO ====================

    function adicionarNovoItemFilme() {
        contadorItens++;
        const divLinha = document.createElement('div');
        divLinha.className = 'item-filme-linha';
        divLinha.dataset.index = contadorItens;

        divLinha.innerHTML = `
            <div class="grupo-campo campo-grande">
                <label>Filme para Locação:</label>
                <select class="select-filme-item" required>
                    <option value="">Selecione um filme...</option>
                </select>
            </div>
            <div class="grupo-campo">
                <label>Valor da Locação (R$):</label>
                <input type="number" step="0.01" class="input-valor-item" required>
            </div>
            <div class="grupo-campo">
                <button type="button" class="btn-remover-item">Remover</button>
            </div>
        `;

    const selectFilme = divLinha.querySelector('.select-filme-item');
    const inputValor = divLinha.querySelector('.input-valor-item');

// ==================== PREENCHER O SELECT COM OS FILMES DISPONÍVEIS ====================

    filmesCache.forEach(filme => {
        if (filme.QUANTIDADE > 0) {
            const option = document.createElement('option');
            option.value = filme.FIL_ID;
            option.textContent = `${filme.FIL_NOME} (estoque: ${filme.QUANTIDADE})`;
            option.dataset.valor = filme.ITN_VALOR_LOC || 10;
            selectFilme.appendChild(option);
        }
    });

// ==================== PREENCHIMENTO DE VALOR AO ADICIONAR FILME ====================

    selectFilme.onchange = function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.valor) {
            inputValor.value = selectedOption.dataset.valor;
        }
    };

 // ==================== BOTÃO DE REMOÇÃO ====================

    divLinha.querySelector('.btn-remover-item').onclick = function() {
        if (containerItensLocacao.querySelectorAll('.item-filme-linha').length > 1) {
            divLinha.remove();
        } else {
            exibirMensagem("A locação precisa conter pelo menos 1 filme!", 'erro');
        }
    };

    containerItensLocacao.appendChild(divLinha);
}

// ==================== COLETAR DADOS DO FORMULÁRIO ====================

function coletarDadosFormulario() {
    const clienteId = selCliente.value;
    const dataLocacao = txtDataLocacao.value;
    const itensLinhas = containerItensLocacao.querySelectorAll('.item-filme-linha');
    
    if (!clienteId) {
        exibirMensagem('Selecione um cliente', 'erro');
        return null;
    }
    
    if (!dataLocacao) {
        exibirMensagem('Informe a data da locação', 'erro');
        return null;
    }
    
    const itens = [];
    let itensValidos = true;
    
    itensLinhas.forEach(linha => {
        const selectFilme = linha.querySelector('.select-filme-item');
        const inputValor = linha.querySelector('.input-valor-item');
        const filmeId = selectFilme.value;
        const valor = inputValor.value;
        
        if (!filmeId) {
            itensValidos = false;
            return;
        }
        
        itens.push({
            filme_id: parseInt(filmeId),
            valor: parseFloat(valor) || 0
        });
    });
    
    if (!itensValidos || itens.length === 0) {
        exibirMensagem('Selecione um filme válido em cada linha', 'erro');
        return null;
    }
    
    return {
        cliente_id: parseInt(clienteId),
        itens: itens
    };
}
    
// ==================== REGISTRO E LOCAÇÃO PARA O BACKEND ====================

async function registrarLocacao(event) {
    event.preventDefault();
    
    const payload = coletarDadosFormulario();
    if (!payload) return;
    
    try {
        const response = await fetch('/api/locacoes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const resultado = await response.json();
        
        if (!response.ok) {
            throw new Error(resultado.erro || 'Erro ao registrar locação');
        }
        
        exibirMensagem(`Locação registrada! Total: R$ ${resultado.valor_total}`, 'sucesso');
        limparFormulario();
        
        // Recarrega filmes para atualizar estoque
        await carregarFilmes();
        
    } catch (error) {
        console.error('Erro:', error);
        exibirMensagem(error.message, 'erro');
    }
}

// ==================== FUNÇÃO PARA LIMPAR O FORMULÁRIO ====================

function limparFormulario() {
    // Limpa selects de filmes, mantendo apenas um item vazio

    containerItensLocacao.innerHTML = '';
    contadorItens = 1;
    
    // Adiciona um item inicial
    const divLinha = document.createElement('div');
    divLinha.className = 'item-filme-linha';
    divLinha.dataset.index = 1;
    divLinha.innerHTML = `
        <div class="grupo-campo campo-grande">
            <label>Filme para Locação:</label>
            <select class="select-filme-item" required>
                <option value="">Selecione um filme...</option>
            </select>
        </div>
        <div class="grupo-campo">
            <label>Valor da Locação (R$):</label>
            <input type="number" step="0.01" class="input-valor-item" required>
        </div>
        <div class="grupo-campo">
            <button type="button" class="btn-remover-item">Remover</button>
        </div>
    `;
    containerItensLocacao.appendChild(divLinha);
    
    // Atualiza os selects com os filmes disponiveis
    const selectFilme = divLinha.querySelector('.select-filme-item');
    const inputValor = divLinha.querySelector('.input-valor-item');
    
    filmesCache.forEach(filme => {
        if (filme.QUANTIDADE > 0) {
            const option = document.createElement('option');
            option.value = filme.FIL_ID;
            option.textContent = `${filme.FIL_NOME} (estoque: ${filme.QUANTIDADE})`;
            option.dataset.valor = filme.ITN_VALOR_LOC || 10;
            selectFilme.appendChild(option);
        }
    });
    
    selectFilme.onchange = function() {
        const selectedOption = this.options[this.selectedIndex];
        if (selectedOption && selectedOption.dataset.valor) {
            inputValor.value = selectedOption.dataset.valor;
        }
    };
    
    divLinha.querySelector('.btn-remover-item').onclick = function() {
        exibirMensagem("A locação precisa conter pelo menos 1 filme!", 'erro');
    };
    
    // Reseta select de cliente e data
    if (selCliente) selCliente.value = '';
    if (txtDataLocacao) {
        const hoje = new Date().toISOString().split('T')[0];
        txtDataLocacao.value = hoje;
    }
}

// ==================== INICIALIZAÇÃO ====================

    async function inicializarPagina() {
    await carregarClientes();
    await carregarFilmes();
    
    // Data atual
    if (txtDataLocacao) {
        const hoje = new Date().toISOString().split('T')[0];
        txtDataLocacao.value = hoje;
    }

    limparFormulario();   
    
// ==================== CONFIGURAÇÃO DOS EVENTOS ====================

    if (btnAdicionarItem) {
        btnAdicionarItem.onclick = function() {
            adicionarNovoItemFilme();
        };
    }
    
    if (btnCancelarLocacao) {
        btnCancelarLocacao.onclick = function() {
            if (confirm("Tem certeza que deseja limpar todos os campos?")) {
                limparFormulario();
            }
        };
    }
    
    if (formLocacao) {
        formLocacao.onsubmit = registrarLocacao;
    }
}
    
// ==================== INICIALIZAÇÃO DA PÁGINA APÓS CARREGAMENTO DO DOM ====================

    document.addEventListener('DOMContentLoaded', inicializarPagina);
    