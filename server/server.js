require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// Middleware para habilitar CORS e JSON
app.use(cors());
app.use(express.json());

// Configuração de conexão com o MySQL usando pool
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


app.get('/api/produtos', (req, res) => {
  db.query('SELECT id_produto, nome, descricao, preco, quantidade_estoque FROM produto', (err, results) => {
    if (err) {
      console.error('Erro ao consultar o banco de dados:', err); // Log detalhado do erro
      res.status(500).json({ error: 'Erro ao obter produtos', details: err });
    } else {
      res.json(results);
    }
  });
});


// Rota POST para adicionar produtos
app.post('/api/produtos', (req, res) => {
  const { nome, descricao, preco, quantidade_estoque } = req.body;
  const query = 'INSERT INTO produto (nome, descricao, preco, quantidade_estoque) VALUES (?, ?, ?, ?)';
  const values = [nome, descricao, preco, quantidade_estoque];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar produto:', err);
      res.status(500).json({ error: 'Erro ao adicionar produto' });
    } else {
      res.status(201).json({ message: 'Produto adicionado com sucesso', id: result.insertId });
    }
  });
});

// Rota para deletar um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM produto WHERE id_produto = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao deletar produto:', err);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    } else if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Produto não encontrado' });
    } else {
      res.status(200).json({ message: 'Produto deletado com sucesso' });
    }
  });
});


// Rota para editar um produto
app.put('/api/produtos/:id', (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade_estoque } = req.body;

  const query = `
    UPDATE produto
    SET nome = ?, descricao = ?, preco = ?, quantidade_estoque = ?
    WHERE id_produto = ?
  `;

  db.query(query, [nome, descricao, preco, quantidade_estoque, id], (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Produto não encontrado' });
    } else {
      res.json({ message: 'Produto atualizado com sucesso' });
    }
  });
});


// Adicione outras rotas conforme necessário...

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});