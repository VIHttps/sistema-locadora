// importa os pacotes instalados
// express: cria o servidor web
// mysql2: conecta ao mysql
const express = require('express');
const mysql = require('mysql2');

//require('dotenv').config(); -- > colocar quando preencher o arquivo .env

// cria o aplicativo servidor
const app = express();
// define a porta onde o servidor vai rodar
const port = 3000; //adicionar "process.env.PORT ||" antes de "3000;" quando preencher o .env

//Middlewares para permitir a comunicação correta entre a página, o js e o servidor
app.use(express.json());
app.use(express.static(__dirname));
// configura a conexão com o mysql
// host: endereço do servidor mysql (localhost significa o próprio computador)
// user: nome do usuário do mysql
// password: senha do mysql
// database: nome do banco de dado

// Colocar a conexão em um Pool de conexões, que deve buscar as informações de segurança no .env
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',  // colocar a senha do mysql entre as aspas
    database: 'AULAS'
});

// tenta conectar ao mysql
// err: contém a mensagem de erro se a conexão falhar

// Trocar por um teste que verifica a conexão do banco por meio do Pool 
connection.connect((err) => {
    if (err) {
        console.log('erro ao conectar no mysql:', err.message);
        return;
    }
    console.log('conectado ao banco AULAS');
});
// Após a configuração do Pool adicionar a rota de CRUD de clientes usando pool.query e app.get
// processos a serem inseridos:
//bloco de código aqui para: LISTAR todos os clientes
//bloco de código aqui para: BUSCAR um cliente específico por ID
//bloco de código aqui para: INSERIR novo cliente 

//bloco de código aqui para: validação básica da coerência dos dados, ex: todos os campos estão sendo preenchidos conforme o sistema pede?

// cria uma rota chamada /api/locacoes
// quando o navegador acessar http://localhost:3000/api/locacoes, este código executa
app.get('/api/locacoes', (req, res) => {
    // consulta sql com join entre cinco tabelas conforme aula 11 página 15
    // a consulta retorna os dados das locações com informações do cliente, filme e categoria
    const sql = `
        SELECT
            CLI_ID,
            CLI_NOME,
            CLI_SALDO,
            LOC_ID,
            LOC_DATA_CAD,
            FIL_NOME,
            CAT_NOME,
            ITN_VALOR_LOC
        FROM CLIENTES, LOCACOES, CATEGORIAS, FILMES, ITENS
        WHERE CLI_ID = LOC_CLI_ID
          AND LOC_ID = ITN_LOC_ID
          AND FIL_ID = ITN_FIL_ID
          AND CAT_ID = FIL_CAT_ID
    `;

    // executa a consulta sql no banco de dados
    // err: contém o erro se a consulta falhar
    // resultados: contém os dados retornados pelo banco
    connection.query(sql, (err, resultados) => {
        if (err) {
            // status(500) significa erro interno do servidor
            // json envia os dados no formato json
            res.status(500).json({ erro: err.message });
            return;
        }
        res.json(resultados);
    });
});

// cria uma rota para a página inicial (endereço /)
// quando o navegador acessar http://localhost:3000, envia o arquivo index.html
app.get('/', (req, res) => {
    // sendFile envia um arquivo estático para o navegador
    // __dirname é o caminho da pasta onde este arquivo server.js está localizado
    res.sendFile('index.html', { root: __dirname });
});

// inicia o servidor na porta definida
// o servidor fica escutando aguardando conexões
app.listen(port, () => {
    console.log(`servidor rodando em: http://localhost:${port}`);
    console.log(`abrir o navegador em: http://localhost:${port}`);
});

//inserir: express.json ( middleware ) e express.static (middleware)
//rotas POST (insert)
//rotas PUT (update)
//rotas DELETE 
