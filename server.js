// importa os pacotes instalados
// express: cria o servidor web
// mysql2: conecta ao mysql
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// carrega as variáveis do arquivo .env
require('dotenv').config();

// cria o aplicativo servidor
const app = express();

// define a porta onde o servidor vai rodar
const port = process.env.PORT || 3000;

// middlewares para permitir a comunicacao correta entre a pagina, o js e o servidor
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// pool de conexoes com o banco de dados
// waitForConnections: aguarda se todas as conexoes estiverem ocupadas
// connectionLimit: numero maximo de conexoes simultaneas
// queueLimit: tamanho maximo da fila de espera (0 = ilimitado)
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'AULAS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// testa a conexao com o banco de dados
// getConnection: obtem uma conexao do pool
// release: libera a conexao de volta ao pool apos o teste
pool.getConnection()
    .then(conn => {
        console.log('conectado ao banco de dados');
        conn.release();
    })
    .catch(err => console.error('erro na conexao:', err));

// ==================== ROTAS PARA CLIENTES ====================

// LISTAR TODOS OS CLIENTES ( SELECT )

app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY cli_nome ASC');
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar clientes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// BUSCAR CLIENTE POR ID
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE cli_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// INSERIR NOVO CLIENTE ( INSERT )
// validacao: campo nome e obrigatorio
app.post('/api/clientes', async (req, res) => {
    const { nome, telefone, saldo } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'o campo nome e obrigatorio' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO clientes (cli_nome, cli_telefone, cli_saldo) VALUES (?, ?, ?)',
            [nome, telefone, saldo || 0]
        );
        res.status(201).json({
            mensagem: 'cliente criado com sucesso',
            id: result.insertId
        });
    } catch (error) {
        console.error('erro ao inserir cliente:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ATUALIZAR CLIENTE ( UPDATE )
app.put('/api/clientes/:id', async (req, res) => {
    const id = req.params.id;
    const { nome, telefone, saldo } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE clientes SET cli_nome = ?, cli_telefone = ?, cli_saldo = ? WHERE cli_id = ?',
            [nome, telefone, saldo, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'cliente nao encontrado' });
        }
        res.json({ mensagem: 'cliente atualizado com sucesso' });
    } catch (error) {
        console.error('erro ao atualizar cliente:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// DELETAR CLIENTE ( DELETE )
// verifica se o cliente possui locacoes antes de permitir a exclusao
// impede a exclusao de clientes que ja realizaram locacoes
app.delete('/api/clientes/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        // verifica se o cliente possui locacoes registradas
        const [locacoesVinculadas] = await pool.query(
            'SELECT COUNT(*) as total FROM locacoes WHERE loc_cli_id = ?',
            [id]
        );
        
        if (locacoesVinculadas[0].total > 0) {
            return res.status(400).json({ 
                erro: 'Não é possível excluir este cliente pois ele possui histórico de locações'
            });
        }
        
        const [result] = await pool.execute('DELETE FROM clientes WHERE cli_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Cliente não encontrado' });
        }
        
        res.json({ mensagem: 'Cliente deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar cliente:', error);
        
        // tratamento para cliente com locacoes vinculadas (fallback para erro de chave estrangeira)
        if (error.code === 'ER_ROW_IS_REFERENCED' || error.code === 'ER_ROW_IS_REFERENCED_2') {
            res.status(400).json({ erro: 'Não é possível excluir cliente com locações vinculadas' });
        } else {
            res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
});
// ==================== ROTAS PARA CATEGORIAS ====================

// LISTAR TODAS AS CATEGORIAS ( SELECT )

app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias ORDER BY cat_nome ASC');
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar categorias:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// INSERIR NOVA CATEGORIA ( INSERT )
app.post('/api/categorias', async (req, res) => {
    const { nome } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'o campo nome e obrigatorio' });
    }

    try {
        const [result] = await pool.execute('INSERT INTO categorias (cat_nome) VALUES (?)', [nome]);
        res.status(201).json({ mensagem: 'categoria criada com sucesso', id: result.insertId });
    } catch (error) {
        console.error('erro ao inserir categoria:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ATUALIZAR CATEGORIA ( UPDATE )
app.put('/api/categorias/:id', async (req, res) => {
    const id = req.params.id;
    const { nome } = req.body;

    try {
        const [result] = await pool.execute('UPDATE categorias SET cat_nome = ? WHERE cat_id = ?', [nome, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'categoria nao encontrada' });
        }
        res.json({ mensagem: 'categoria atualizada com sucesso' });
    } catch (error) {
        console.error('erro ao atualizar categoria:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// DELETAR CATEGORIA ( DELETE )
// verifica se a categoria possui filmes vinculados antes de permitir a exclusao
// impede a exclusao de categorias que estao sendo utilizadas
app.delete('/api/categorias/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // verifica se a categoria possui filmes vinculados
        const [filmesVinculados] = await pool.query(
            'SELECT COUNT(*) as total FROM filmes WHERE fil_cat_id = ?',
            [id]
        );
        
        if (filmesVinculados[0].total > 0) {
            return res.status(400).json({ 
                erro: 'Não é possível excluir esta categoria pois existem filmes vinculados a ela'
            });
        }
        
        const [result] = await pool.execute('DELETE FROM categorias WHERE cat_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Categoria não encontrada' });
        }
        
        res.json({ mensagem: 'Categoria deletada com sucesso' });
    } catch (error) {
        console.error('erro ao deletar categoria:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});
// BUSCAR ID 
app.get('/api/categorias/:id', async (req, res) => {
    const id = req.params.id;
    
    try {
        const [rows] = await pool.query('SELECT * FROM categorias WHERE cat_id = ?', [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'Categoria não encontrada' });
        }
        
        res.json(rows[0]);
    } catch (error) {
        console.error('Erro ao buscar categoria:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});

// ==================== ROTAS PARA FILMES ====================

// LISTAR TODOS OS FILMES: select com nome da categoria via left join

app.get('/api/filmes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.*, c.cat_nome 
            FROM filmes f
            LEFT JOIN categorias c ON f.fil_cat_id = c.cat_id
            ORDER BY f.fil_nome ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar filmes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// BUSCAR FILME ESPECÍFICO PELO ID
app.get('/api/filmes/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM filmes WHERE fil_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'filme nao encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('erro ao buscar filme:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// INSERIR NOVO FILME ( INSERT )
// validacao: campo nome e obrigatorio, categoria_id e opcional (pode ser null)
app.post('/api/filmes', async (req, res) => {
    const { nome, categoria_id, quantidade } = req.body;

    if (!nome || nome.trim() === '') {
        return res.status(400).json({ erro: 'o campo nome e obrigatorio' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO filmes (fil_nome, fil_cat_id, quantidade) VALUES (?, ?, ?)',
            [nome, categoria_id || null, quantidade || 1]
        );
        res.status(201).json({ mensagem: 'filme criado com sucesso', id: result.insertId });
    } catch (error) {
        console.error('erro ao inserir filme:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ATUALIZAR FILME ( UPDATE )
app.put('/api/filmes/:id', async (req, res) => {
    const id = req.params.id;
    const { nome, categoria_id, quantidade } = req.body;

    try {
        const [result] = await pool.execute(
            'UPDATE filmes SET fil_nome = ?, fil_cat_id = ?, quantidade = ? WHERE fil_id = ?',
            [nome, categoria_id, quantidade, id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'filme nao encontrado' });
        }
        res.json({ mensagem: 'filme atualizado com sucesso' });
    } catch (error) {
        console.error('erro ao atualizar filme:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});
// DELETAR FILME ( DELETE )
// verifica se o filme possui itens de locacao antes de permitir a exclusao
// impede a exclusao de filmes que ja foram alugados (preserva historico)
app.delete('/api/filmes/:id', async (req, res) => {
    const id = req.params.id;

    try {
        // verifica se o filme possui itens de locacao (foi alugado alguma vez)
        const [itensVinculados] = await pool.query(
            'SELECT COUNT(*) as total FROM itens WHERE itn_fil_id = ?',
            [id]
        );
        
        if (itensVinculados[0].total > 0) {
            return res.status(400).json({ 
                erro: 'Não é possível excluir este filme pois ele possui histórico de locações'
            });
        }
        
        const [result] = await pool.execute('DELETE FROM filmes WHERE fil_id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Filme não encontrado' });
        }
        
        res.json({ mensagem: 'Filme deletado com sucesso' });
    } catch (error) {
        console.error('erro ao deletar filme:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});
// ==================== ROTA DE TRANSAÇÃO PARA LOCAÇÃO ====================

//  REGISTRAR UMA NOVA LOCAÇÃO : insert com transacao e controle de estoque
app.post('/api/locacoes', async (req, res) => {
    const { cliente_id, itens } = req.body;

    // validacoes iniciais
    if (!cliente_id) {
        return res.status(400).json({ erro: 'cliente nao informado' });
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'nenhum item informado' });
    }
  // Busca o saldo atual do cliente no banco
const [clienteRows] = await pool.query(
    'SELECT cli_saldo FROM clientes WHERE cli_id = ?',
    [cliente_id]
);

if (clienteRows.length === 0) {
    return res.status(404).json({ erro: 'cliente nao encontrado' });
}

const saldoAtual = parseFloat(clienteRows[0].cli_saldo);

// Calcula o valor total da locacao
let valorTotal = 0;  // 
for (const item of itens) {
    valorTotal += parseFloat(item.valor);
}

// Verifica se o saldo é suficiente
if (saldoAtual < valorTotal) {
    return res.status(400).json({ 
        erro: `Saldo insuficiente. Saldo atual: R$ ${saldoAtual.toFixed(2)}. Total da locacao: R$ ${valorTotal.toFixed(2)}` 
    });
}
    // obtem uma conexao dedicada para a transacao
    const conn = await pool.getConnection();

    try {
        // inicia a transacao
        await conn.beginTransaction();

        // verifica o estoque de todos os filmes antes de prosseguir
        for (const item of itens) {
            const [rows] = await conn.execute(
                'SELECT quantidade FROM filmes WHERE fil_id = ? FOR UPDATE',
                [item.filme_id]
            );

            if (rows.length === 0) {
                throw new Error(`filme id ${item.filme_id} nao encontrado`);
            }
            if (rows[0].quantidade <= 0) {
                throw new Error(`filme id ${item.filme_id} esta sem estoque`);
            }
        }

        // insere a locacao
        const [locacao] = await conn.execute(
            'INSERT INTO locacoes (loc_cli_id, loc_data_cad) VALUES (?, NOW())',
            [cliente_id]
        );
        const locacaoId = locacao.insertId;

        // insere os itens e atualiza o estoque
        let valorTotal = 0;
        for (const item of itens) {
            // insere o item
            await conn.execute(
                'INSERT INTO itens (itn_loc_id, itn_fil_id, itn_valor_loc) VALUES (?, ?, ?)',
                [locacaoId, item.filme_id, item.valor]
            );

            // atualiza o estoque (diminui 1)
            await conn.execute(
                'UPDATE filmes SET quantidade = quantidade - 1 WHERE fil_id = ?',
                [item.filme_id]
            );

            valorTotal += parseFloat(item.valor);
        }

// desconta o valor total do saldo do cliente
        await conn.execute(
            'UPDATE clientes SET cli_saldo = cli_saldo - ? WHERE cli_id = ?',
            [valorTotal, cliente_id]
        );

        // confirma todas as alteracoes
        await conn.commit();

        res.status(201).json({
            mensagem: 'locacao registrada com sucesso',
            locacao_id: locacaoId,
            valor_total: valorTotal.toFixed(2)
        });

    } catch (error) {
        // em caso de erro, desfaz todas as alteracoes
        await conn.rollback();
        console.error('erro ao registrar locacao:', error);

        if (error.message.includes('estoque')) {
            res.status(400).json({ erro: error.message });
        } else {
            res.status(500).json({ erro: 'erro interno ao processar locacao' });
        }
    } finally {

    // libera a conexao de volta ao pool
        conn.release();
    }
});

// ==================== ROTA PARA REGISTRAR DEVOLUCAO ====================
// atualiza a data_devolucao de um item especifico
// tambem restaura o estoque do filme (quantidade + 1)
// a condicao data_devolucao IS NULL impede devolucoes duplicadas
// utiliza transacao para garantir consistencia dos dados
app.put('/api/itens/:id/devolver', async (req, res) => {
    const itemId = req.params.id;
    
    try {
        // verifica se o item existe e se ja foi devolvido
        const [itemRows] = await pool.query(
            'SELECT itn_fil_id, data_devolucao FROM itens WHERE itn_id = ?',
            [itemId]
        );
        
        if (itemRows.length === 0) {
            return res.status(404).json({ erro: 'Item não encontrado' });
        }
        
        // impede devolucao duplicada
        if (itemRows[0].data_devolucao !== null) {
            return res.status(400).json({ erro: 'Este item já foi devolvido anteriormente' });
        }
        
        const filmeId = itemRows[0].itn_fil_id;
        
        // inicia uma transacao para garantir consistencia
        const conn = await pool.getConnection();
        
        try {
            await conn.beginTransaction();
            
            // registra a data de devolucao
            await conn.execute(
                'UPDATE itens SET data_devolucao = NOW() WHERE itn_id = ?',
                [itemId]
            );
            
            // restaura o estoque do filme
            await conn.execute(
                'UPDATE filmes SET quantidade = quantidade + 1 WHERE fil_id = ?',
                [filmeId]
            );
            
            await conn.commit();
            
            res.json({ mensagem: 'Devolução registrada com sucesso' });
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('erro ao registrar devolucao:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
});
// ==================== ROTA DE CONSULTA DE LOCAÇÕES (JOIN) ====================

// CONSULTA DE LOCAÇÕES: join entre cinco tabelas
// conforme exemplo da aula 11 pagina 15
// consulta de locacoes com join - ordenado por nome do cliente
app.get('/api/locacoes', async (req, res) => {
    try {
        const sql = `
            SELECT 
                c.cli_id, c.cli_nome, c.cli_saldo,
                l.loc_id, l.loc_data_cad,
                f.fil_nome, cat.cat_nome,
                i.itn_valor_loc
            FROM clientes c
            JOIN locacoes l ON c.cli_id = l.loc_cli_id
            JOIN itens i ON l.loc_id = i.itn_loc_id
            JOIN filmes f ON i.itn_fil_id = f.fil_id
            JOIN categorias cat ON f.fil_cat_id = cat.cat_id
            ORDER BY c.cli_nome ASC, l.loc_data_cad DESC
        `;

        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('erro ao consultar locacoes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ==================== ROTA DE CONSULTA DE LOCAÇÕES AGRUPADAS ====================
// retorna os dados organizados por cliente para visualizacao em acordeao
// cada cliente possui um array de suas locacoes com os respectivos itens
// inclui informacao se cada item ja foi devolvido (DATA_DEVOLUCAO)
app.get('/api/locacoes/agrupadas', async (req, res) => {
    try {
        // busca todos os clientes ordenados por nome
        const [clientes] = await pool.query(
            'SELECT cli_id, cli_nome, cli_saldo FROM clientes ORDER BY cli_nome ASC'
        );
        
        const resultado = [];
        
        // para cada cliente, busca suas locacoes e itens
        for (const cliente of clientes) {
            const [locacoes] = await pool.query(`
                SELECT 
                    l.loc_id, 
                    l.loc_data_cad,
                    i.itn_id,
                    i.itn_valor_loc,
                    i.data_devolucao,
                    f.fil_nome,
                    c.cat_nome
                FROM locacoes l
                JOIN itens i ON l.loc_id = i.itn_loc_id
                JOIN filmes f ON i.itn_fil_id = f.fil_id
                JOIN categorias c ON f.fil_cat_id = c.cat_id
                WHERE l.loc_cli_id = ?
                ORDER BY l.loc_data_cad DESC, i.itn_id ASC
            `, [cliente.cli_id]);
            
            resultado.push({
                cliente: {
                    id: cliente.cli_id,
                    nome: cliente.cli_nome,
                    saldo: parseFloat(cliente.cli_saldo)
                },
                locacoes: locacoes
            });
        }
        
        res.json(resultado);
    } catch (error) {
        console.error('erro ao consultar locacoes agrupadas:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});
// ==================== ROTA PARA PÁGINA INICIAL ====================

// cria uma rota para a pagina inicial (endereco /)
// quando o navegador acessar http://localhost:3306, envia o arquivo index.html
app.get('/', (req, res) => {
    // sendFile envia um arquivo estatico para o navegador
    // __dirname e o caminho da pasta onde este arquivo server.js esta localizado
    res.sendFile('index.html', { root: __dirname });
});

// ==================== INICIA O SERVIDOR ====================

// ==================== ROTA PARA EXCLUIR LOCACAO INTEIRA ====================
// exclui uma locacao apenas se nenhum dos seus itens tiver sido devolvido
// verifica se todos os itens possuem data_devolucao = null
// antes de excluir, restaura o estoque dos filmes
// utiliza transacao para garantir consistencia dos dados
app.delete('/api/locacoes/:id', async (req, res) => {
    const locacaoId = req.params.id;
    
    // obtem uma conexao dedicada para a transacao
    const conn = await pool.getConnection();
    
    try {
        await conn.beginTransaction();
        
        // verifica se a locacao possui itens ja devolvidos
        const [itensDevolvidos] = await conn.query(
            'SELECT COUNT(*) as total FROM itens WHERE itn_loc_id = ? AND data_devolucao IS NOT NULL',
            [locacaoId]
        );
        
        if (itensDevolvidos[0].total > 0) {
            await conn.rollback();
            return res.status(400).json({ 
                erro: 'Não é possível excluir esta locação pois ela possui itens já devolvidos'
            });
        }
        
        // verifica se a locacao existe
        const [locacaoRows] = await conn.query(
            'SELECT loc_id FROM locacoes WHERE loc_id = ?',
            [locacaoId]
        );
        
        if (locacaoRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ erro: 'Locação não encontrada' });
        }
        
        // busca todos os itens da locacao para restaurar o estoque
        const [itens] = await conn.query(
            'SELECT itn_fil_id FROM itens WHERE itn_loc_id = ?',
            [locacaoId]
        );
        
        // restaura o estoque de cada filme (aumenta a quantidade em 1)
        for (const item of itens) {
            await conn.execute(
                'UPDATE filmes SET quantidade = quantidade + 1 WHERE fil_id = ?',
                [item.itn_fil_id]
            );
        }
        
        // exclui a locacao (os itens serao excluidos automaticamente pelo ON DELETE CASCADE)
        const [result] = await conn.execute(
            'DELETE FROM locacoes WHERE loc_id = ?',
            [locacaoId]
        );
        
        if (result.affectedRows === 0) {
            await conn.rollback();
            return res.status(404).json({ erro: 'Locação não encontrada' });
        }
        
        await conn.commit();
        
        res.json({ mensagem: `Locação #${locacaoId} excluída.` });
        
    } catch (error) {
        await conn.rollback();
        console.error('erro ao excluir locacao:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
        
    } finally {
        conn.release();
    }
});

// inicia o servidor na porta definida
// o servidor fica escutando aguardando conexoes
app.listen(port, () => {
    console.log(`servidor rodando em: http://localhost:${port}`);
    console.log(`abrir o navegador em: http://localhost:${port}`);
});

