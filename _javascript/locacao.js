document.addEventListener('DOMContentLoaded', () => {

    // BANCOS DE DADOS FICTÍCIOS (Mocks) para Clientes e Filmes
    const dadosClientesMock = [
        { cli_id: 1, cli_nome: "JOAO BATISTA" },
        { cli_id: 2, cli_nome: "JOSE CARLOS" },
        { cli_id: 3, cli_nome: "MARIA EDUARDA" }
    ];

    let dadosFilmesMock = [
        { fil_id: 101, fil_nome: "MATRIX", estoque: 2, valor: 5.00 },
        { fil_id: 102, fil_nome: "MATRIX RELOADED", estoque: 1, valor: 5.00 },
        { fil_id: 103, fil_nome: "INTERESTELAR", estoque: 3, valor: 7.50 },
        { fil_id: 104, fil_nome: "VINGADORES", estoque: 0, valor: 6.00 }
    ];

    // Array global para armazenar o histórico de locações
    let historicoLocacoes = [];

    // Elementos da Interface
    const formLocacao = document.getElementById('formLocacao');
    const selCliente = document.getElementById('selCliente');
    const txtDataLocacao = document.getElementById('txtDataLocacao');
    const containerItensLocacao = document.getElementById('containerItensLocacao');
    
    // Botões de controle
    const btnAdicionarItem = document.getElementById('btnAdicionarItem');
    const btnCancelarLocacao = document.getElementById('btnCancelarLocacao');

    // ⚠️========================================================⚠️
    // PROCESSOS INSERIDOS REORGANIZADOS E CORRIGIDOS
    // ==========================================================

    // --- BLOCO: preencher o select do novo item ---
    function preencherSelectNovoItem(selectElement) {
        selectElement.innerHTML = '<option value="">Escolha um filme...</option>';
        
        dadosFilmesMock.forEach(filme => {
            if (filme.estoque > 0) {
                const opt = document.createElement('option');
                opt.value = filme.fil_id;
                opt.textContent = `${filme.fil_nome} (Qtd: ${filme.estoque}) - R$ ${filme.valor.toFixed(2)}`;
                selectElement.appendChild(opt);
            }
        });
    }

    // --- BLOCO: adicionar novo item (filme) ao formulário ---
    function adicionarNovoItemFilme() {
        const divLinha = document.createElement('div');
        divLinha.className = 'item-filme-linha';

        divLinha.innerHTML = `
            <div class="grupo-campo campo-grande">
                <label>Filme para Locação:</label>
                <select class="select-filme-item" required>
                    </select>
            </div>
            <div class="grupo-campo">
                <button type="button" class="btn-remover-item">Remover</button>
            </div>
        `;

        const novoSelect = divLinha.querySelector('.select-filme-item');
        preencherSelectNovoItem(novoSelect);

        divLinha.querySelector('.btn-remover-item').onclick = function() {
            if (containerItensLocacao.querySelectorAll('.item-filme-linha').length > 1) {
                divLinha.remove();
            } else {
                alert("A locação precisa conter pelo menos 1 filme!");
            }
        };

        containerItensLocacao.appendChild(divLinha);
    }

    // --- BLOCO: carregar clientes e filmes ao iniciar página ---
    function inicializarPagina() {
        const hoje = new Date().toISOString().split('T')[0];
        txtDataLocacao.value = hoje;

        selCliente.innerHTML = '<option value="">Selecione um cliente...</option>';
        dadosClientesMock.forEach(cliente => {
            const opt = document.createElement('option');
            opt.value = cliente.cli_id;
            opt.textContent = cliente.cli_nome;
            selCliente.appendChild(opt);
        });

        containerItensLocacao.innerHTML = '';
        adicionarNovoItemFilme();
    }

    // --- BLOCO: função para atualizar lista de filmes disponíveis (com estoque) ---
    function atualizarTodosDropdownsFilmes() {
        const todosSelects = containerItensLocacao.querySelectorAll('.select-filme-item');
        
        todosSelects.forEach(selectAtual => {
            const valorSelecionado = selectAtual.value;
            selectAtual.innerHTML = '<option value="">Escolha um filme...</option>';
            
            dadosFilmesMock.forEach(filme => {
                if (filme.estoque > 0 || filme.fil_id == valorSelecionado) {
                    const opt = document.createElement('option');
                    opt.value = filme.fil_id;
                    opt.textContent = `${filme.fil_nome} (Qtd: ${filme.estoque}) - R$ ${filme.valor.toFixed(2)}`;
                    selectAtual.appendChild(opt);
                }
            });

            selectAtual.value = valorSelecionado;
        });
    }

    // --- BLOCO: coletar todos os itens do formulário com validação simples ---
    function coletarDadosFormulario() {
        const idCliente = selCliente.value;
        const dataLocacao = txtDataLocacao.value;
        const todosSelectsFilmes = containerItensLocacao.querySelectorAll('.select-filme-item');
        
        if (!idCliente || !dataLocacao) {
            alert("Por favor, preencha o cliente e a data da locação!");
            return null;
        }

        let filmesIdsSelecionados = [];
        let validacaoItensOk = true;

        todosSelectsFilmes.forEach(select => {
            if (!select.value) {
                validacaoItensOk = false;
            } else {
                filmesIdsSelecionados.push(Number(select.value));
            }
        });

        if (!validacaoItensOk || filmesIdsSelecionados.length === 0) { // ➔ Corrigido aqui (filmesIdsSelecionados)
            alert("Por favor, selecione um filme válido em cada linha adicionada!");
            return null;
        }

        return {
            loc_id: historicoLocacoes.length + 1,
            cli_id: Number(idCliente),
            loc_data: dataLocacao,
            itens: filmesIdsSelecionados
        };
    }

    // --- BLOCO: limpar o formulário e recarregar o estoque ---
    function limparFormularioERecarregar() {
        formLocacao.reset();
        inicializarPagina();
        atualizarTodosDropdownsFilmes();
    }

    // --- BLOCO: função para registrar a locação ---
    formLocacao.onsubmit = function(event) {
        event.preventDefault();

        const payloadLocacao = coletarDadosFormulario();
        if (!payloadLocacao) return; 

        payloadLocacao.itens.forEach(idFilmeLocado => {
            const filmeNoBanco = dadosFilmesMock.find(f => f.fil_id === idFilmeLocado);
            if (filmeNoBanco && filmeNoBanco.estoque > 0) {
                filmeNoBanco.estoque -= 1; 
            }
        });

        historicoLocacoes.push(payloadLocacao);
        alert("Locação registrada com sucesso com baixa realizada no estoque!");
        limparFormularioERecarregar();
    };

    // --- CONFIGURAÇÃO DE EVENTOS COMPLEMENTARES ---
    btnAdicionarItem.onclick = function() {
        adicionarNovoItemFilme();
        atualizarTodosDropdownsFilmes();
    };

    btnCancelarLocacao.onclick = function() {
        if (confirm("Tem certeza que deseja limpar todos os campos preenchidos?")) {
            limparFormularioERecarregar();
        }
    };

    // Execução Automática Inicial
    inicializarPagina();

    //⚠️========================================================⚠️
});