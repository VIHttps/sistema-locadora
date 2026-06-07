-- DROP DATABASE IF EXISTS AULAS
-- remove o banco de dados se ele já existir
-- IF EXISTS impede a exibição de erro caso o banco não exista
DROP DATABASE IF EXISTS AULAS;

-- CREATE DATABASE AULAS
-- cria um novo banco de dados chamado AULAS
CREATE DATABASE AULAS;

-- USE AULAS
-- seleciona o banco AULAS para os comandos seguintes
USE AULAS;

-- CREATE TABLE CATEGORIAS
-- cria a tabela de categorias dos filmes
-- NOT NULL indica que o campo não pode ficar vazio
-- PRIMARY KEY identifica cada registro de forma única
-- AUTO_INCREMENT faz o número aumentar automaticamente
-- VARCHAR(150) armazena texto com até 150 caracteres
-- DATETIME armazena data e hora
CREATE TABLE CATEGORIAS (
    CAT_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    CAT_NOME VARCHAR(150) NOT NULL,
    CAT_DATA_CAD DATETIME
);

-- CREATE TABLE CLIENTES
-- cria a tabela de clientes
-- DECIMAL(10,2) armazena números com 10 dígitos no total e 2 casas decimais
-- CHECK (CLI_SALDO >= 0) impede valores negativos no saldo
CREATE TABLE CLIENTES (
    CLI_NOME VARCHAR(50) NOT NULL,
    CLI_TELEFONE VARCHAR(25),
    CLI_DATA_CAD DATETIME,
    CLI_SALDO DECIMAL(10,2) CHECK (CLI_SALDO >= 0)
);

-- CREATE TABLE FILMES
-- cria a tabela de filmes
-- FOREIGN KEY (FIL_CAT_ID) REFERENCES CATEGORIAS(CAT_ID)
-- define que FIL_CAT_ID é uma chave estrangeira que aponta para CAT_ID na tabela CATEGORIAS
-- o código da categoria deve existir na tabela CATEGORIAS antes de ser usado aqui
CREATE TABLE FILMES (
    FIL_NOME VARCHAR(150) NOT NULL,
    FIL_CAT_ID INT,
    QUANTIDADE INT NOT NULL DEFAULT 1, -- quantidade
    FIL_DATA_CAD DATETIME,
    FOREIGN KEY (FIL_CAT_ID) REFERENCES CATEGORIAS(CAT_ID) ON DELETE SET NULL ON UPDATE CASCADE
); -- define que se uma categoria for deletada (FIL_CAT_ID) deve ser nulo

-- CREATE TABLE LOCACOES
-- cria a tabela de locações
-- FOREIGN KEY (LOC_CLI_ID) REFERENCES CLIENTES(CLI_ID)
-- define que LOC_CLI_ID é uma chave estrangeira que aponta para CLI_ID na tabela CLIENTES
-- o código do cliente deve existir na tabela CLIENTES antes de ser usado aqui
CREATE TABLE LOCACOES (
    LOC_CLI_ID INT,
    LOC_DATA_CAD DATETIME,
    FOREIGN KEY (LOC_CLI_ID) REFERENCES CLIENTES(CLI_ID) ON DELETE CASCADE ON UPDATE CASCADE
); -- define que se um cliente for deletado, as locações também devem ser ( cascade )

-- CREATE TABLE ITENS
-- cria a tabela de itens de locação
-- FOREIGN KEY (ITN_LOC_ID) REFERENCES LOCACOES(LOC_ID)
-- define que ITN_LOC_ID é uma chave estrangeira que aponta para LOC_ID na tabela LOCACOES
-- FOREIGN KEY (ITN_FIL_ID) REFERENCES FILMES(FIL_ID)
-- define que ITN_FIL_ID é uma chave estrangeira que aponta para FIL_ID na tabela FILMES
-- CHECK (ITN_VALOR_LOC >= 0) impede valores negativos no valor da locação
CREATE TABLE ITENS (
    ITN_ID INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    ITN_LOC_ID INT,
    ITN_FIL_ID INT,
    ITN_VALOR_LOC DECIMAL(10,2) CHECK (ITN_VALOR_LOC >= 0),
    FOREIGN KEY (ITN_LOC_ID) REFERENCES LOCACOES(LOC_ID) ON DELETE CASCADE, 
    FOREIGN KEY (ITN_FIL_ID) REFERENCES FILMES(FIL_ID) ON DELETE RESTRICT
); -- define que se a locação pai for deletada, os itens também devem ser ( cascade )
   -- define que se um filme for deletado, a operação deve ser impedida ( restrict ) se houver itens vinculados

-- INSERT INTO CATEGORIAS
-- insere dados na tabela CATEGORIAS
-- NOW() retorna a data e hora atuais do sistema
INSERT INTO CATEGORIAS (CAT_NOME, CAT_DATA_CAD) VALUES ('ACAO', NOW());
INSERT INTO CATEGORIAS (CAT_NOME, CAT_DATA_CAD) VALUES ('FANTASIA', NOW());
INSERT INTO CATEGORIAS (CAT_NOME, CAT_DATA_CAD) VALUES ('DRAMA', NOW());

-- INSERT INTO CLIENTES
-- insere dados na tabela CLIENTES
INSERT INTO CLIENTES (CLI_NOME, CLI_TELEFONE, CLI_DATA_CAD, CLI_SALDO) VALUES ('JOAO BATISTA', '(62) 99999-9999', NOW(), 100.00);
INSERT INTO CLIENTES (CLI_NOME, CLI_TELEFONE, CLI_DATA_CAD, CLI_SALDO) VALUES ('JOSE CARLOS', '(62) 88888-8888', NOW(), 150.00);
INSERT INTO CLIENTES (CLI_NOME, CLI_TELEFONE, CLI_DATA_CAD, CLI_SALDO) VALUES ('MARIA SILVA', '(11) 99999-9999', NOW(), 250.00);

-- INSERT INTO FILMES
-- insere dados na tabela FILMES
-- FIL_CAT_ID deve corresponder a um CAT_ID existente na tabela CATEGORIAS
INSERT INTO FILMES (FIL_NOME, FIL_CAT_ID, FIL_DATA_CAD) VALUES ('MATRIX', 1, NOW());
INSERT INTO FILMES (FIL_NOME, FIL_CAT_ID, FIL_DATA_CAD) VALUES ('MATRIX RELOADED', 1, NOW());
INSERT INTO FILMES (FIL_NOME, FIL_CAT_ID, FIL_DATA_CAD) VALUES ('O SENHOR DOS ANEIS', 2, NOW());
INSERT INTO FILMES (FIL_NOME, FIL_CAT_ID, FIL_DATA_CAD) VALUES ('INTERESTELAR', 3, NOW());

-- INSERT INTO LOCACOES
-- insere dados na tabela LOCACOES
-- LOC_CLI_ID deve corresponder a um CLI_ID existente na tabela CLIENTES
INSERT INTO LOCACOES (LOC_CLI_ID, LOC_DATA_CAD) VALUES (1, '2025-01-15 14:30:00');
INSERT INTO LOCACOES (LOC_CLI_ID, LOC_DATA_CAD) VALUES (2, '2025-02-20 09:15:00');
INSERT INTO LOCACOES (LOC_CLI_ID, LOC_DATA_CAD) VALUES (1, '2025-03-10 16:45:00');

-- INSERT INTO ITENS
-- insere dados na tabela ITENS
-- ITN_LOC_ID deve corresponder a um LOC_ID existente na tabela LOCACOES
-- ITN_FIL_ID deve corresponder a um FIL_ID existente na tabela FILMES
INSERT INTO ITENS (ITN_LOC_ID, ITN_FIL_ID, ITN_VALOR_LOC) VALUES (1, 1, 10.50);
INSERT INTO ITENS (ITN_LOC_ID, ITN_FIL_ID, ITN_VALOR_LOC) VALUES (1, 2, 10.50);
INSERT INTO ITENS (ITN_LOC_ID, ITN_FIL_ID, ITN_VALOR_LOC) VALUES (2, 3, 12.50);
INSERT INTO ITENS (ITN_LOC_ID, ITN_FIL_ID, ITN_VALOR_LOC) VALUES (3, 1, 10.50);
INSERT INTO ITENS (ITN_LOC_ID, ITN_FIL_ID, ITN_VALOR_LOC) VALUES (3, 4, 15.00);

-- SELECT COM JOIN ENTRE CINCO TABELAS
-- conforme exemplo da aula 11 página 15
-- SELECT especifica quais colunas serão retornadas
-- CLI_ID, CLI_NOME, CLI_SALDO vem da tabela CLIENTES
-- LOC_ID, LOC_DATA_CAD vem da tabela LOCACOES
-- FIL_NOME vem da tabela FILMES
-- CAT_NOME vem da tabela CATEGORIAS
-- ITN_VALOR_LOC vem da tabela ITENS
-- FROM lista as tabelas envolvidas na consulta
-- WHERE define as condições que juntam as tabelas
-- CLI_ID = LOC_CLI_ID relaciona cliente com sua locação
-- LOC_ID = ITN_LOC_ID relaciona locação com seus itens
-- FIL_ID = ITN_FIL_ID relaciona item com o filme
-- CAT_ID = FIL_CAT_ID relaciona filme com sua categoria
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
  AND CAT_ID = FIL_CAT_ID;