
    // _javascript/clientes.js
    let modoEdicao = false;
    let clienteIdEditando = null
    // ==================== INTERFACE ====================

    //Elementos da interface
    const corpoTabela = document.getElementById('corpoTabelaClientes'); // const = atribuição imutável
    const modal = document.getElementById('modalCliente'); 
    const formCliente = document.getElementById('formCliente');
    
    // Elementos de controle do modal
    const btnNovoCliente = document.getElementById('btnNovoCliente'); // Botão do topo para Insert
    const btnCancelar = document.getElementById('btnCancelar');
    
    // Inputs
    const txtId = document.getElementById('txtId');
    const txtNome = document.getElementById('txtNome');
    const txtTelefone = document.getElementById('txtTelefone');
    const txtSaldo = document.getElementById('txtSaldo');

    // ==================== FUNÇÃO PARA LISTAR CLIENTES ( SELECT ) ====================

    async function listarClientes() { //função assíncrona que retorna uma promise = promessa da disponibilidade de um valor no futuro
        // ESTADOS DE UMA FUNÇÃO ASSÍNCRONA ( verificável pelo console )
        // pending: em andamento
        // fulfilled: terminou e gerou resultado
        // rejected: falhou e há um erro

        try{
            const response = await fetch('/api/clientes');
            if (!response.ok) throw new Error('Erro ao buscar clientes');
            const clientes = await response.json();

            corpoTabela.innerHTML = '';

            if (clientes.length === 0) {
                corpoTabela.innerHTML = `<td><td colspan="5" style="text-align:center; padding:20px;">Nenhum cliente encontrado.</td></tr>`;
            
            return;

        }

        clientes.forEach(cliente => {
            const linha = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = cliente.CLI_ID;
            linha.appendChild(tdId);

            // Nome
            const tdNome = document.createElement('td');
            tdNome.textContent = cliente.CLI_NOME;
            linha.appendChild(tdNome)

            // Telefone
            const tdTelefone = document.createElement('td');
            tdTelefone.textContent = cliente.CLI_TELEFONE || 'Não informado';
            linha.appendChild(tdTelefone);
            
            // Saldo
            const tdSaldo = document.createElement('td');
            tdSaldo.textContent = `R$ ${parseFloat(cliente.CLI_SALDO).toFixed(2)}`;
            linha.appendChild(tdSaldo);

            // Ações
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            //EDITAR
            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => editarCliente(cliente.CLI_ID);
            tdAcoes.appendChild(btnEditar);

            //EXCLUIR
            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.className = 'btn-excluir';
            btnExcluir.onclick = () => deletarCliente(cliente.CLI_ID);
            tdAcoes.appendChild(btnExcluir);

            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });

    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}

// ==================== FUNÇÃO PARA SALVAR CLIENTES ( INSERT/ UPDATE ) ====================

async function salvarCliente(event) {
    event.preventDefault();

    const nome = txtNome.value.trim();
    const telefone = txtTelefone.value;
    const saldo = parseFloat(txtSaldo.value) || 0;

    if (!nome) {
        exibirMensagem('O campo nome é obrigatório', 'erro');
        return;
    }

    const dados = {
        nome: nome.toUpperCase(),
        telefone: telefone,
        saldo: saldo
    };

    let url = '/api/clientes';
    let method = 'POST';

    if (modoEdicao && clienteIdEditando) {
        url = `/api/clientes/${clienteIdEditando}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao salvar');
        }

        exibirMensagem(modoEdicao ? 'Cliente atualizado!' : 'Cliente criado!', 'sucesso');
        cancelarEdicao();
        listarClientes();

    } catch (error) {

        exibirMensagem(error.message, 'erro');
        }
    }

    // ==================== EDITAR CLIENTES ====================

    window.editarCliente = async function(id) {
        try {
            const response = await fetch(`/api/clientes/${id}`);
            if (!response.ok) throw new Error('Cliente não encontrado');
            const cliente = await response.json();

            txtId.value = cliente.CLI_ID;
            txtNome.value = cliente.CLI_NOME;
            txtTelefone.value = cliente.CLI_TELEFONE || '';
            txtSaldo.value = cliente.CLI_SALDO;

            modoEdicao = true;
            clienteIdEditando = cliente.CLI_ID;
            modal.classList.add('active');
            txtNome.focus();
        } catch (error) {
            exibirMensagem('Erro ao carregar dados do cliente', 'erro');
        }
    };
    
    // ==================== FUNÇÃO PARA DELETAR CLIENTES ( DELETE ) ====================

    window.deletarCliente = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

    try {
        const response = await fetch(`/api/clientes/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao excluir');
        }

        exibirMensagem('Cliente excluído com sucesso', 'sucesso');
        listarClientes();

        if (modoEdicao && clienteIdEditando === id) {
            cancelarEdicao();
        }
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
};
  
// ==================== fUNÇÃO PARA CANCELAR EDIÇÃO ====================


    function cancelarEdicao() {
    modal.classList.remove('active');
    formCliente.reset();
    txtId.value = '';
    modoEdicao = false;
    clienteIdEditando = null;
}
   
// ==================== BOTÕES DE EVENTO ====================


   if (btnNovoCliente) {
    btnNovoCliente.onclick = function() {
        cancelarEdicao();
        modal.classList.add('active');
        txtNome.focus();
    };
}

btnCancelar.onclick = cancelarEdicao;
formCliente.onsubmit = salvarCliente;

// ==================== INICIALIZAÇÃO ====================

listarClientes();