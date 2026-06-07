//Mover todo o conteúdo da tag <script> do index.html para essa aba

    // função executada quando o botão é clicado
    document.getElementById('btnBuscar').onclick = function() {
        // faz requisição ao backend e retorna uma Promise
        fetch('http://localhost:3000/api/locacoes')
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
                // cria uma nova linha (<tr>)
                const linha = document.createElement('tr');

                // cria cada célula (<td>), define apenas texto e anexa à linha
                const tdIdCliente = document.createElement('td');
                tdIdCliente.textContent = dados[i].cli_id; // Mudado para minúsculo
                linha.appendChild(tdIdCliente);

                const tdNome = document.createElement('td');
                tdNome.textContent = dados[i].cli_nome; // Mudado para minúsculo
                linha.appendChild(tdNome);

                const tdSaldo = document.createElement('td');
                // formata número com duas casas; se for null/undefined mostra vazio
                tdSaldo.textContent = (dados[i].cli_saldo != null) ? Number(dados[i].cli_saldo).toFixed(2) : ''; // Mudado para minúsculo
                linha.appendChild(tdSaldo);

                const tdIdLoc = document.createElement('td');
                tdIdLoc.textContent = dados[i].loc_id; // Mudado para minúsculo
                linha.appendChild(tdIdLoc);

                const tdData = document.createElement('td');
                // formata data de forma legível; se inválida, mostra vazio
                const dataRaw = dados[i].loc_data_cad; // Mudado para minúsculo
                tdData.textContent = dataRaw ? new Date(dataRaw).toLocaleDateString('pt-BR') : '';
                linha.appendChild(tdData);

                const tdFilme = document.createElement('td');
                tdFilme.textContent = dados[i].fil_nome; // Mudado para minúsculo
                linha.appendChild(tdFilme);

                const tdCategoria = document.createElement('td');
                tdCategoria.textContent = dados[i].cat_nome; // Mudado para minúsculo
                linha.appendChild(tdCategoria);

                const tdValor = document.createElement('td');
                tdValor.textContent = (dados[i].itn_valor_loc != null) ? Number(dados[i].itn_valor_loc).toFixed(2) : ''; // Mudado para minúsculo
                linha.appendChild(tdValor);

                // adiciona a linha completa ao tbody
                corpo.appendChild(linha);
            }
            })
            .catch(erro => {
                // avisa o usuário em caso de erro na requisição
                alert('erro ao buscar dados: ' + erro.message);
            });
    };
