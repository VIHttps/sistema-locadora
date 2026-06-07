// importa os pacotes instalados
// express: cria o servidor web
// mysql2: conecta ao mysql
const express = require('express');
const mysql = require('mysql2/promise');

// carrega as variáveis do arquivo .env
require('dotenv').config();

// cria o aplicativo servidor
const app = express();

// define a porta onde o servidor vai rodar
const port = process.env.PORT || 3000;

// middlewares para permitir a comunicacao correta entre a pagina, o js e o servidor
app.use(express.json());
app.use(express.static(__dirname));

// pool de conexoes com o banco de dados
// utilizar pool em vez de createConnection e a melhor pratica para aplicacoes web
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

// listar todos os clientes (select)
app.get('/api/clientes', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes ORDER BY cli_id');
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar clientes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// buscar um cliente especifico por id
app.get('/api/clientes/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM clientes WHERE cli_id = ?', [req.params.id]);
        if (rows.length === 0) {
            return res.status(404).json({ erro: 'cliente nao encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('erro ao buscar cliente:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// inserir novo cliente (insert)
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

// atualizar cliente (update)
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

// deletar cliente (delete)
app.delete('/api/clientes/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await pool.execute('DELETE FROM clientes WHERE cli_id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'cliente nao encontrado' });
        }
        res.json({ mensagem: 'cliente deletado com sucesso' });
    } catch (error) {
        console.error('erro ao deletar cliente:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ==================== ROTAS PARA CATEGORIAS ====================

// listar todas as categorias (select)
app.get('/api/categorias', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM categorias ORDER BY cat_id');
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar categorias:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// inserir nova categoria (insert)
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

// atualizar categoria (update)
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

// deletar categoria (delete)
app.delete('/api/categorias/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await pool.execute('DELETE FROM categorias WHERE cat_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'categoria nao encontrada' });
        }
        res.json({ mensagem: 'categoria deletada com sucesso' });
    } catch (error) {
        console.error('erro ao deletar categoria:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ==================== ROTAS PARA FILMES ====================

// listar todos os filmes (select) com nome da categoria via left join
app.get('/api/filmes', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT f.*, c.cat_nome 
            FROM filmes f
            LEFT JOIN categorias c ON f.fil_cat_id = c.cat_id
            ORDER BY f.fil_id
        `);
        res.json(rows);
    } catch (error) {
        console.error('erro ao listar filmes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// buscar um filme especifico por id
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

// inserir novo filme (insert)
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

// atualizar filme (update)
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

// deletar filme (delete)
app.delete('/api/filmes/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const [result] = await pool.execute('DELETE FROM filmes WHERE fil_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'filme nao encontrado' });
        }
        res.json({ mensagem: 'filme deletado com sucesso' });
    } catch (error) {
        console.error('erro ao deletar filme:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ==================== ROTA DE TRANSAÇÃO PARA LOCAÇÃO ====================

// registrar uma nova locacao (insert com transacao e controle de estoque)
app.post('/api/locacoes', async (req, res) => {
    const { cliente_id, itens } = req.body;

    // validacoes iniciais
    if (!cliente_id) {
        return res.status(400).json({ erro: 'cliente nao informado' });
    }
    if (!itens || !Array.isArray(itens) || itens.length === 0) {
        return res.status(400).json({ erro: 'nenhum item informado' });
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

// ==================== ROTA DE CONSULTA DE LOCAÇÕES (JOIN) ====================

// consulta de locacoes com join entre cinco tabelas
// conforme exemplo da aula 11 pagina 15
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
            ORDER BY l.loc_id, i.itn_id
        `;

        const [rows] = await pool.query(sql);
        res.json(rows);
    } catch (error) {
        console.error('erro ao consultar locacoes:', error);
        res.status(500).json({ erro: 'erro interno do servidor' });
    }
});

// ==================== ROTA PARA PÁGINA INICIAL ====================

// cria uma rota para a pagina inicial (endereco /)
// quando o navegador acessar http://localhost:3000, envia o arquivo index.html
app.get('/', (req, res) => {
    // sendFile envia um arquivo estatico para o navegador
    // __dirname e o caminho da pasta onde este arquivo server.js esta localizado
    res.sendFile('index.html', { root: __dirname });
});

// ==================== INICIA O SERVIDOR ====================

// inicia o servidor na porta definida
// o servidor fica escutando aguardando conexoes
app.listen(port, () => {
    console.log(`servidor rodando em: http://localhost:${port}`);
    console.log(`abrir o navegador em: http://localhost:${port}`);
});