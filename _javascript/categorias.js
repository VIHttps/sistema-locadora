let modoEdicao = false;
let categoriaIdEditando = null;

document.addEventListener('DOMContentLoaded', () => {
    
    // BANCO DE DADOS FICTÍCIO (Mock) para testes locais no Front-end
    let listaCategorias = [
        { cat_id: 1, cat_nome: "AÇÃO" },
        { cat_id: 2, cat_nome: "COMÉDIA" },
        { cat_id: 3, cat_nome: "DRAMA" },
        { cat_id: 4, cat_nome: "TERROR" },
        { cat_id: 5, cat_nome: "FICÇÃO CIENTÍFICA" }
    ];

    // Elementos da Interface
    const corpoTabela = document.getElementById('corpoTabelaCategorias');
    const modal = document.getElementById('modalCategoria');
    const formCategoria = document.getElementById('formCategoria');
    
    // Botões de Ação
    const btnNovaCategoria = document.getElementById('btnNovaCategoria');
    const btnExcluirModal = document.getElementById('btnExcluirModal');
    const btnCancelar = document.getElementById('btnCancelar');
    
    // Inputs do Formulário
    const txtId = document.getElementById('txtId');
    const txtNome = document.getElementById('txtNome');

    // ⚠️========================================================⚠️
    // PROCESSOS INSERIDOS (MOCK DE DADOS)
    // ==========================================================

    // --- FUNÇÃO PARA LISTAR ( SELECT ) ---
    function listarCategorias() {
        corpoTabela.innerHTML = '';

        if (listaCategorias.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="3" style="text-align:center; padding:20px;">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        listaCategorias.forEach(categoria => {
            const linha = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = categoria.cat_id; 
            linha.appendChild(tdId);

            // Nome
            const tdNome = document.createElement('td');
            tdNome.textContent = categoria.cat_nome; 
            linha.appendChild(tdNome);

            // Coluna de Ações
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => preencherFormularioEdicao(categoria.cat_id);
            
            tdAcoes.appendChild(btnEditar);
            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });
    }

    // --- FUNÇÃO PARA SALVAR ( INSERIR, ATUALIZAR ) ---
    formCategoria.onsubmit = function(event) {
        event.preventDefault();
        const idAtual = txtId.value;

        if (idAtual) {
            // Lógica de UPDATE local
            const categoria = listaCategorias.find(c => c.cat_id == idAtual);
            if (categoria) {
                categoria.cat_nome = txtNome.value.toUpperCase();
            }
        } else {
            // Lógica de INSERT local (Incrementa o ID fictício)
            const novoId = listaCategorias.length > 0 ? Math.max(...listaCategorias.map(c => c.cat_id)) + 1 : 1;
            
            const novaCategoria = {
                cat_id: novoId,
                cat_nome: txtNome.value.toUpperCase()
            };
            listaCategorias.push(novaCategoria);
        }

        listarCategorias(); // Recarrega a tabela na tela
        cancelarEdicao();   // Fecha o modal
    };

    // --- FUNÇÃO PARA EDITAR (PREENCHE O FORMULÁRIO) ---
    function preencherFormularioEdicao(id) {
        const categoria = listaCategorias.find(c => c.cat_id === id);
        if (categoria) {
            txtId.value = categoria.cat_id;
            txtNome.value = categoria.cat_nome;

            btnExcluirModal.style.display = 'block'; 
            modal.classList.add('active');
            txtNome.focus();
        }
    }

    // --- FUNÇÃO PARA DELETAR ---
    btnExcluirModal.onclick = function() {
        const idAtual = Number(txtId.value);
        if (idAtual && confirm("Deseja realmente remover esta categoria fictícia?")) {
            listaCategorias = listaCategorias.filter(c => c.cat_id !== idAtual);
            listarCategorias();
            cancelarEdicao();
        }
    };

    // --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
    function cancelarEdicao() {
        modal.classList.remove('active');
        formCategoria.reset();
        txtId.value = '';
    }

    // --- CONFIGURAR EVENTOS QUANDO A PÁGINA CARREGAR ---
    if (btnNovaCategoria) {
        btnNovaCategoria.onclick = function() {
            cancelarEdicao();
            btnExcluirModal.style.display = 'none'; 
            modal.classList.add('active');
            txtNome.focus();
        };
    }

    btnCancelar.onclick = cancelarEdicao;

    // Inicializa a tabela com o Mock ao carregar a página
    listarCategorias();
    
    //⚠️========================================================⚠️
});