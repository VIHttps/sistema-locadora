document.addEventListener('DOMContentLoaded', () => {
    // Mock de dados mantido para seus testes locais
    let listaClientes = [
        { cli_id: 1, cli_nome: "JOAO BATISTA", cli_fone: "(62) 98888-1111", cli_saldo: "100.00" },
        { cli_id: 2, cli_nome: "JOSE CARLOS", cli_fone: "(62) 99999-2222", cli_saldo: "150.00" },
        { cli_id: 3, cli_nome: "MARIA EDUARDA", cli_fone: "(62) 98765-4321", cli_saldo: "50.50" }
    ];

    const corpoTabela = document.getElementById('corpoTabelaClientes');
    const modal = document.getElementById('modalCliente');
    const formCliente = document.getElementById('formCliente');
    
    // Elementos de controle do modal
    const btnNovoCliente = document.getElementById('btnNovoCliente'); // Botão do topo para Insert
    const btnExcluirModal = document.getElementById('btnExcluirModal');
    const btnCancelar = document.getElementById('btnCancelar');
    
    // Inputs
    const txtId = document.getElementById('txtId');
    const txtNome = document.getElementById('txtNome');
    const txtTelefone = document.getElementById('txtTelefone');
    const txtSaldo = document.getElementById('txtSaldo');

    // --- RENDERIZAR GRID (SELECT) ---
    function atualizarGrid() {
        corpoTabela.innerHTML = '';

        if (listaClientes.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum cliente ativo encontrado.</td></tr>`;
            return;
        }

        listaClientes.forEach(cliente => {
            const linha = document.createElement('tr');

            linha.innerHTML = `
                <td>${cliente.cli_id}</td>
                <td>${cliente.cli_nome}</td>
                <td>${cliente.cli_fone || 'Não informado'}</td>
                <td>${Number(cliente.cli_saldo).toFixed(2)}</td>
            `;

            // Coluna de ação contendo apenas o botão Editar
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => abrirModalEdicao(cliente.cli_id);
            
            tdAcoes.appendChild(btnEditar);
            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });
    }

    // --- GERENCIAMENTO DO MODAL ---
    
    // AÇÃO: Abrir modal para NOVO CADASTRO (INSERT)
    if (btnNovoCliente) {
        btnNovoCliente.onclick = function() {
            fecharModal(); // Garante que o form comece limpo
            
            // Como é um novo cadastro, esconde o botão de excluir
            btnExcluirModal.style.display = 'none'; 
            
            modal.classList.add('active');
            txtNome.focus();
        };
    }

    // AÇÃO: Abrir modal para ALTERAR/REMOVER (UPDATE / DELETE)
    function abrirModalEdicao(id) {
        const cliente = listaClientes.find(c => c.cli_id === id);
        if (cliente) {
            // Preenche os campos do modal com os dados atuais
            txtId.value = cliente.cli_id;
            txtNome.value = cliente.cli_nome;
            txtTelefone.value = cliente.cli_fone;
            txtSaldo.value = cliente.cli_saldo;

            // Como é edição, exibe o botão de excluir
            btnExcluirModal.style.display = 'block'; 
            
            modal.classList.add('active');
            txtNome.focus();
        }
    }

    function fecharModal() {
        modal.classList.remove('active');
        formCliente.reset();
        txtId.value = '';
    }

    // --- AÇÃO: SALVAR (Pode ser INSERT ou UPDATE) ---
    formCliente.onsubmit = function(e) {
        e.preventDefault();
        const idAtual = txtId.value;

        if (idAtual) {
            // Se tem ID, executa a lógica de UPDATE
            const cliente = listaClientes.find(c => c.cli_id == idAtual);
            if (cliente) {
                cliente.cli_nome = txtNome.value.toUpperCase();
                cliente.cli_fone = txtTelefone.value;
                cliente.cli_saldo = txtSaldo.value;
            }
        } else {
            // Se NÃO tem ID, executa a lógica de INSERT (Novo Cliente)
            // Gera um ID incremental fictício pegando o maior ID atual + 1
            const novoId = listaClientes.length > 0 ? Math.max(...listaClientes.map(c => c.cli_id)) + 1 : 1;
            
            const novoCliente = {
                cli_id: novoId,
                cli_nome: txtNome.value.toUpperCase(),
                cli_fone: txtTelefone.value,
                cli_saldo: txtSaldo.value || "0.00"
            };
            listaClientes.push(novoCliente);
        }

        atualizarGrid();
        fecharModal();
    };

    // --- AÇÃO: EXCLUIR DENTRO DO MODAL (DELETE) ---
    btnExcluirModal.onclick = function() {
        const idAtual = Number(txtId.value);
        if (idAtual && confirm("Tem certeza absoluta que deseja remover este cliente permanentemente?")) {
            listaClientes = listaClientes.filter(c => c.cli_id !== idAtual);
            atualizarGrid();
            fecharModal();
        }
    };

    // Botão Voltar/Cancelar apenas fecha a janela
    btnCancelar.onclick = fecharModal;

    // Inicializa a listagem na tela
    atualizarGrid();
});