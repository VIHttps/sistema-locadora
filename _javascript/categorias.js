let modoEdicao = false;
let categoriaIdEditando = null;
// ==================== INTERFACE ====================

    // Elementos da Interface
    const corpoTabela = document.getElementById('corpoTabelaCategorias');
    const modal = document.getElementById('modalCategoria');
    const formCategoria = document.getElementById('formCategoria');
    
    // Inputs do Formulário
    const txtId = document.getElementById('txtId');
    const txtNome = document.getElementById('txtNome');

    // Botões de Ação
    const btnNovaCategoria = document.getElementById('btnNovaCategoria');
    const btnCancelar = document.getElementById('btnCancelar');
    

// ==================== FUNÇÃO PARA LISTAR CATEGORIA ====================

    async function listarCategorias() {
    try {
        const response = await fetch('/api/categorias');
        if (!response.ok) throw new Error('Erro ao buscar categorias');
        const categorias = await response.json();

        corpoTabela.innerHTML = '';

        if (categorias.length === 0) {
            corpoTabela.innerHTML = `<table><td colspan="3" style="text-align:center; padding:20px;">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        categorias.forEach(categoria => {
            const linha = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = categoria.CAT_ID;
            linha.appendChild(tdId);

            // Nome
            const tdNome = document.createElement('td');
            tdNome.textContent = categoria.CAT_NOME;
            linha.appendChild(tdNome);

            // Ações
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => editarCategoria(categoria.CAT_ID);
            tdAcoes.appendChild(btnEditar);

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.className = 'btn-excluir';
            btnExcluir.onclick = () => deletarCategoria(categoria.CAT_ID);
            tdAcoes.appendChild(btnExcluir);

            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}

// ==================== FUNÇÃO PARA SALVAR CATEGORIA ( INSERT/ UPDATE)====================


   async function salvarCategoria(event) {
    event.preventDefault();

    const nome = txtNome.value.trim();

    if (!nome) {
        exibirMensagem('O campo nome é obrigatório', 'erro');
        return;
    }

    const dados = { nome: nome.toUpperCase() };
    let url = '/api/categorias';
    let method = 'POST';

    if (modoEdicao && categoriaIdEditando) {
        url = `/api/categorias/${categoriaIdEditando}`;
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

        exibirMensagem(modoEdicao ? 'Categoria atualizada!' : 'Categoria criada!', 'sucesso');
        cancelarEdicao();
        listarCategorias();
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}
   // ==================== FUNÇÃO PARA EDITAR CATEGORIA ====================

    window.editarCategoria = async function(id) {
        console.log('ID recebido:', id);  
        try {

            const response = await fetch(`/api/categorias/${id}`);
            if (!response.ok) throw new Error('Categoria não encontrada');
            const categoria = await response.json();

            txtId.value = categoria.CAT_ID;
            txtNome.value = categoria.CAT_NOME;

            modoEdicao = true;
            categoriaIdEditando = categoria.CAT_ID;
            modal.classList.add('active');
            txtNome.focus();

        } catch (error) {
            exibirMensagem('Erro ao carregar dados da categoria', 'erro');
        }
};

 // ==================== FUNÇÃO PARA DELETAR CATEGORIA ====================

window.deletarCategoria = async function(id) {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
        const response = await fetch(`/api/categorias/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao excluir');
        }

        exibirMensagem('Categoria excluída com sucesso', 'sucesso');
        listarCategorias();

        if (modoEdicao && categoriaIdEditando === id) {
            cancelarEdicao();
        }
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
};

// ==================== FUNÇÃO PARA CANCELAR EDIÇÃO ====================

   function cancelarEdicao() {
    modal.classList.remove('active');
    formCategoria.reset();
    txtId.value = '';
    modoEdicao = false;
    categoriaIdEditando = null;
}
// ==================== EVENTOS ====================

if (btnNovaCategoria) {
    btnNovaCategoria.onclick = function() {
        cancelarEdicao();
        modal.classList.add('active');
        txtNome.focus();
    };
}

btnCancelar.onclick = cancelarEdicao;
formCategoria.onsubmit = salvarCategoria;

 // ==================== INICIALIZAÇÃO ====================
listarCategorias();