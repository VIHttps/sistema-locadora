document.addEventListener('DOMContentLoaded', () => {
    
    // BANCO DE DADOS FICTÍCIO (Mock) para testes locais sem o Back-end
    let listaFilmes = [
        { fil_id: 1, fil_nome: "MATRIX", cat_id: 1, cat_nome: "AÇÃO" },
        { fil_id: 2, fil_nome: "MATRIX RELOADED", cat_id: 1, cat_nome: "AÇÃO" },
        { fil_id: 3, fil_nome: "INTERESTELAR", cat_id: 3, cat_nome: "DRAMA" },
        { fil_id: 4, fil_nome: "OS VINGADORES", cat_id: 1, cat_nome: "AÇÃO" },
        { fil_id: 5, fil_nome: "O EXORCISTA", cat_id: 4, cat_nome: "TERROR" }
    ];

    // Elementos da Interface
    const corpoTabela = document.getElementById('corpoTabelaFilmes');
    const modal = document.getElementById('modalFilme');
    const formFilme = document.getElementById('formFilme');
    
    // Botões de Ação
    const btnNovoFilme = document.getElementById('btnNovoFilme');
    const btnExcluirModal = document.getElementById('btnExcluirModal');
    const btnCancelar = document.getElementById('btnCancelar');
    
    // Inputs do Formulário
    const txtId = document.getElementById('txtId');
    const txtTitulo = document.getElementById('txtTitulo');
    const selCategoria = document.getElementById('selCategoria');

    // ⚠️========================================================⚠️
    // PROCESSOS INSERIDOS (MOCK DE DADOS)
    // ==========================================================

    // --- FUNÇÃO PARA LISTAR ( SELECT ) ---
    function listarFilmes() {
        corpoTabela.innerHTML = '';

        if (listaFilmes.length === 0) {
            corpoTabela.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:20px;">Nenhum filme encontrado no acervo.</td></tr>`;
            return;
        }

        listaFilmes.forEach(filme => {
            const linha = document.createElement('tr');

            // ID
            const tdId = document.createElement('td');
            tdId.textContent = filme.fil_id; 
            linha.appendChild(tdId);

            // Título
            const tdTitulo = document.createElement('td');
            tdTitulo.textContent = filme.fil_nome; 
            linha.appendChild(tdTitulo);

            // Categoria (Simula exibição do nome com base no ID)
            const tdCategoria = document.createElement('td');
            tdCategoria.textContent = filme.cat_nome || 'ID: ' + filme.cat_id; 
            linha.appendChild(tdCategoria);

            // Coluna de Ações
            const tdAcoes = document.createElement('td');
            tdAcoes.className = 'coluna-acoes';

            const btnEditar = document.createElement('button');
            btnEditar.textContent = 'Editar';
            btnEditar.className = 'btn-editar';
            btnEditar.onclick = () => preencherFormularioEdicao(filme.fil_id);
            
            tdAcoes.appendChild(btnEditar);
            linha.appendChild(tdAcoes);
            corpoTabela.appendChild(linha);
        });
    }

    // --- FUNÇÃO PARA SALVAR ( INSERIR, ATUALIZAR ) ---
    formFilme.onsubmit = function(event) {
        event.preventDefault();
        const idAtual = txtId.value;

        // Função interna sutil para simular o nome da categoria no mock visual
        const resolverNomeCategoria = (id) => {
            if (id == 1) return "AÇÃO";
            if (id == 2) return "COMÉDIA";
            if (id == 3) return "DRAMA";
            if (id == 4) return "TERROR";
            return "OUTROS";
        };

        if (idAtual) {
            // Lógica de UPDATE local
            const filme = listaFilmes.find(f => f.fil_id == idAtual);
            if (filme) {
                filme.fil_nome = txtTitulo.value.toUpperCase();
                filme.cat_id = Number(selCategoria.value);
                filme.cat_nome = resolverNomeCategoria(filme.cat_id);
            }
        } else {
            // Lógica de INSERT local (Incrementa o maior ID existente)
            const novoId = listaFilmes.length > 0 ? Math.max(...listaFilmes.map(f => f.fil_id)) + 1 : 1;
            
            const novoFilme = {
                fil_id: novoId,
                fil_nome: txtTitulo.value.toUpperCase(),
                cat_id: Number(selCategoria.value),
                cat_nome: resolverNomeCategoria(Number(selCategoria.value))
            };
            listaFilmes.push(novoFilme);
        }

        listarFilmes();   // Atualiza o grid na tela
        cancelarEdicao(); // Limpa e fecha o modal
    };

    // --- FUNÇÃO PARA EDITAR (PREENCHE O FORMULÁRIO) ---
    function preencherFormularioEdicao(id) {
        const filme = listaFilmes.find(f => f.fil_id === id);
        if (filme) {
            txtId.value = filme.fil_id;
            txtTitulo.value = filme.fil_nome;
            selCategoria.value = filme.cat_id;

            // Mostra o botão de Excluir por se tratar de um registro existente
            btnExcluirModal.style.display = 'block'; 
            modal.classList.add('active');
            txtTitulo.focus();
        }
    }

    // --- FUNÇÃO PARA DELETAR ---
    btnExcluirModal.onclick = function() {
        const idAtual = Number(txtId.value);
        if (idAtual && confirm("Deseja realmente remover este filme do mockup?")) {
            listaFilmes = listaFilmes.filter(f => f.fil_id !== idAtual);
            listarFilmes();
            cancelarEdicao();
        }
    };

    // --- FUNÇÃO PARA CANCELAR EDIÇÃO ---
    function cancelarEdicao() {
        modal.classList.remove('active');
        formFilme.reset();
        txtId.value = '';
    }

    // --- CONFIGURAR EVENTOS QUANDO A PÁGINA CARREGAR ---
    if (btnNovoFilme) {
        btnNovoFilme.onclick = function() {
            cancelarEdicao();
            btnExcluirModal.style.display = 'none'; // Esconde botão excluir no cadastro
            modal.classList.add('active');
            txtTitulo.focus();
        };
    }

    btnCancelar.onclick = cancelarEdicao;

    // Inicializa o grid com o mockup assim que abrir a aba
    listarFilmes();
    
    //⚠️========================================================⚠️
});