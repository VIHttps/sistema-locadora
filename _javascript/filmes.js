// _javascript/filmes.js
let modoEdicao = false;
let filmeIdEditando = null;

// Elementos da Interface
const corpoTabela = document.getElementById('corpoTabelaFilmes');
const modal = document.getElementById('modalFilme');
const formFilme = document.getElementById('formFilme');

// Inputs do Formulário
const txtId = document.getElementById('txtId');
const txtTitulo = document.getElementById('txtTitulo');
const txtQuantidade = document.getElementById('txtQuantidade');
const selCategoria = document.getElementById('selCategoria');

// Botões de Ação
const btnNovoFilme = document.getElementById('btnNovoFilme');
const btnExcluirModal = document.getElementById('btnExcluirModal');
const btnCancelar = document.getElementById('btnCancelar');

// --- FUNÇÃO PARA LISTAR (SELECT) ---
async function listarFilmes() {
    try {
        const response = await fetch('/api/filmes');
        if (!response.ok) throw new Error('Erro ao buscar filmes');
        const filmes = await response.json();

        corpoTabela.innerHTML = '';

        if (filmes.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:20px;">Nenhum filme encontrado no acervo.</td></tr>`;
            return;
        }

        // CRIAÇÃO DA TABELA 
        filmes.forEach(filme => {
            const linha = document.createElement('tr');

            const tdId = document.createElement('td');
            tdId.textContent = filme.FIL_ID;
            linha.appendChild(tdId);

            const tdTitulo = document.createElement('td');
            tdTitulo.textContent = filme.FIL_NOME;
            linha.appendChild(tdTitulo);

            const tdCategoria = document.createElement('td');
            tdCategoria.textContent = filme.cat_nome || 'Sem categoria';
            linha.appendChild(tdCategoria);

            const tdQuantidade = document.createElement('td');
            tdQuantidade.textContent = filme.QUANTIDADE; 
            linha.appendChild(tdQuantidade);

            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => editarFilme(filme.FIL_ID);  // *
            tdAcoes.appendChild(btnEditar);

            const btnExcluir = document.createElement('button');
            btnExcluir.textContent = 'Excluir';
            btnExcluir.className = 'btn-excluir';
            btnExcluir.onclick = () => deletarFilme(filme.FIL_ID);
            tdAcoes.appendChild(btnExcluir);

            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}

// --- FUNÇÃO PARA SALVAR (INSERT / UPDATE) ---
async function salvarFilme(event) {
    event.preventDefault();

    const nome = txtTitulo.value.trim();
    const categoriaId = selCategoria.value;

    if (!nome) {
        exibirMensagem('O campo título é obrigatório', 'erro');
        return;
    }
    if (!categoriaId) {
        exibirMensagem('Selecione uma categoria', 'erro');
        return;
    }

    const dados = {
        nome: nome.toUpperCase(),
        categoria_id: parseInt(categoriaId),
        quantidade: parseInt(txtQuantidade.value)
    };

    let url = '/api/filmes';
    let method = 'POST';

    if (modoEdicao && filmeIdEditando) {
        url = `/api/filmes/${filmeIdEditando}`;
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

        exibirMensagem(modoEdicao ? 'Filme atualizado!' : 'Filme criado!', 'sucesso');
        cancelarEdicao();
        listarFilmes();
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
}

// --- FUNÇÃO PARA EDITAR ---
window.editarFilme = async function(id) {
    console.log('1 - ID recebido:', id);
    try {
        const response = await fetch(`/api/filmes/${id}`);
        if (!response.ok) throw new Error('Filme não encontrado');
        const filme = await response.json();

        txtId.value = filme.FIL_ID;
        txtTitulo.value = filme.FIL_NOME;
        selCategoria.value = filme.FIL_CAT_ID || '';
        txtQuantidade.value = filme.QUANTIDADE;

        modoEdicao = true;
        filmeIdEditando = filme.FIL_ID;
        modal.classList.add('active');
        txtTitulo.focus();
    } catch (error) {
        exibirMensagem('Erro ao carregar dados do filme', 'erro');
    }
};

// --- FUNÇÃO PARA DELETAR ---
window.deletarFilme = async function(id) {  // *
    if (!confirm('Tem certeza que deseja excluir este filme?')) return;

    try {
        const response = await fetch(`/api/filmes/${id}`, { method: 'DELETE' });
        if (!response.ok) {
            const erro = await response.json();
            throw new Error(erro.erro || 'Erro ao excluir');
        }

        exibirMensagem('Filme excluído com sucesso', 'sucesso');
        listarFilmes();

        if (modoEdicao && filmeIdEditando === id) {
            cancelarEdicao();
        }
    } catch (error) {
        exibirMensagem(error.message, 'erro');
    }
};

// --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
function cancelarEdicao() {
    modal.classList.remove('active');
    formFilme.reset();
    txtId.value = '';
    modoEdicao = false;
    filmeIdEditando = null;
    txtQuantidade.value = 1;
}

// --- EVENTOS ---
if (btnNovoFilme) {
    btnNovoFilme.onclick = function() {
        cancelarEdicao();
        modal.classList.add('active');
        txtTitulo.focus();
    };
}

btnCancelar.onclick = cancelarEdicao;
formFilme.onsubmit = salvarFilme;

// --- INICIALIZAÇÃO ---
preencherSelect('/api/categorias', 'selCategoria', 'CAT_ID', 'CAT_NOME');
listarFilmes();