// _javascript/scripts.js
// funcao executada quando o botao e clicado
document.getElementById('btnBuscar').onclick = function() {
    // faz requisicao ao backend e retorna uma Promise
    fetch('/api/locacoes')
        .then(res => {
            // verifica se o servidor respondeu sem erro HTTP
            if (!res.ok) throw new Error('Resposta do servidor: ' + res.status);
            // converte o corpo da resposta para JSON
            return res.json();
        })
        .then(dados => {
            // referencia para o corpo da tabela (tbody)
            const corpo = document.getElementById('corpoTabela');
            // limpa linhas antigas
            corpo.innerHTML = '';

            // percorre cada registro do array
            for (let i = 0; i < dados.length; i++) {
                // cria uma nova linha (tr)
                const linha = document.createElement('tr');

                // cria cada celula (td) e anexa a linha
                const tdIdCliente = document.createElement('td');
                tdIdCliente.textContent = dados[i].cli_id;
                linha.appendChild(tdIdCliente);

                const tdNome = document.createElement('td');
                tdNome.textContent = dados[i].cli_nome;
                linha.appendChild(tdNome);

                const tdSaldo = document.createElement('td');
                tdSaldo.textContent = (dados[i].cli_saldo != null) ? Number(dados[i].cli_saldo).toFixed(2) : '';
                linha.appendChild(tdSaldo);

                const tdIdLoc = document.createElement('td');
                tdIdLoc.textContent = dados[i].loc_id;
                linha.appendChild(tdIdLoc);

                const tdData = document.createElement('td');
                const dataRaw = dados[i].loc_data_cad;
                tdData.textContent = dataRaw ? new Date(dataRaw).toLocaleDateString('pt-BR') : '';
                linha.appendChild(tdData);

                const tdFilme = document.createElement('td');
                tdFilme.textContent = dados[i].fil_nome;
                linha.appendChild(tdFilme);

                const tdCategoria = document.createElement('td');
                tdCategoria.textContent = dados[i].cat_nome;
                linha.appendChild(tdCategoria);

                const tdValor = document.createElement('td');
                tdValor.textContent = (dados[i].itn_valor_loc != null) ? Number(dados[i].itn_valor_loc).toFixed(2) : '';
                linha.appendChild(tdValor);

                // adiciona a linha completa ao tbody
                corpo.appendChild(linha);
            }
        })
        .catch(erro => {
            // avisa o usuario em caso de erro na requisicao
            alert('erro ao buscar dados: ' + erro.message);
        });
};