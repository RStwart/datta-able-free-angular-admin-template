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

// Rota GET para obter todos os produtos
app.get('/api/produtos', (req, res) => {
  db.query('SELECT id_produto, nome, descricao, preco, quantidade_estoque FROM produto', (err, results) => {
    if (err) {
      console.error('Erro ao consultar os produtos:', err); // Log detalhado do erro
      res.status(500).json({ error: 'Erro ao obter produtos', details: err });
    } else {
      console.log('Produtos encontrados:', results); // Log do sucesso
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
      console.log('Produto adicionado com sucesso:', result); // Log do sucesso
      res.status(201).json({ message: 'Produto adicionado com sucesso', id: result.insertId });
    }
  });
});

// Rota DELETE para deletar um produto
app.delete('/api/produtos/:id', (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM produto WHERE id_produto = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao deletar produto:', err);
      res.status(500).json({ error: 'Erro ao deletar produto' });
    } else if (results.affectedRows === 0) {
      console.log('Produto não encontrado:', id); // Log do erro
      res.status(404).json({ message: 'Produto não encontrado' });
    } else {
      console.log('Produto deletado com sucesso:', id); // Log do sucesso
      res.status(200).json({ message: 'Produto deletado com sucesso' });
    }
  });
});

// Rota PUT para atualizar um produto
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
      console.error('Erro ao atualizar produto:', err);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    } else if (result.affectedRows === 0) {
      console.log('Produto não encontrado para atualização:', id); // Log do erro
      res.status(404).json({ error: 'Produto não encontrado' });
    } else {
      console.log('Produto atualizado com sucesso:', id); // Log do sucesso
      res.json({ message: 'Produto atualizado com sucesso' });
    }
  });
});

// Rota GET para obter todos os funcionários
app.get('/api/funcionarios', (req, res) => {
  db.query('SELECT id, nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo FROM funcionario', (err, results) => {
    if (err) {
      console.error('Erro ao consultar os funcionários:', err); // Log detalhado do erro
      res.status(500).json({ error: 'Erro ao obter funcionários', details: err });
    } else {
      console.log('Funcionários encontrados:', results); // Log do sucesso
      res.json(results);
    }
  });
});

// Rota POST para adicionar um funcionário
app.post('/api/funcionarios', (req, res) => {
  const { nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo } = req.body;
  const query = `
    INSERT INTO funcionario (nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar funcionário:', err);
      res.status(500).json({ error: 'Erro ao adicionar funcionário' });
    } else {
      console.log('Funcionário adicionado com sucesso:', result); // Log do sucesso
      res.status(201).json({ message: 'Funcionário adicionado com sucesso', id: result.insertId });
    }
  });
});

// Rota DELETE para deletar um funcionário
app.delete('/api/funcionarios/:id', (req, res) => {
  const id = req.params.id;

  const query = 'DELETE FROM funcionario WHERE id = ?';
  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Erro ao deletar funcionário:', err);
      res.status(500).json({ error: 'Erro ao deletar funcionário' });
    } else if (results.affectedRows === 0) {
      console.log('Funcionário não encontrado:', id); // Log do erro
      res.status(404).json({ message: 'Funcionário não encontrado' });
    } else {
      console.log('Funcionário deletado com sucesso:', id); // Log do sucesso
      res.status(200).json({ message: 'Funcionário deletado com sucesso' });
    }
  });
});

// Rota PUT para atualizar um funcionário
app.put('/api/funcionarios/:id', (req, res) => {
  const { id } = req.params;
  const { nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo } = req.body;

  const query = `
    UPDATE funcionario
    SET nome = ?, cargo = ?, departamento = ?, salario = ?, data_contratacao = ?, email = ?, telefone = ?, ativo = ?
    WHERE id = ?
  `;

  db.query(query, [nome, cargo, departamento, salario, data_contratacao, email, telefone, ativo, id], (err, result) => {
    if (err) {
      console.error('Erro ao atualizar funcionário:', err);
      res.status(500).json({ error: 'Erro ao atualizar funcionário' });
    } else if (result.affectedRows === 0) {
      console.log('Funcionário não encontrado para atualização:', id); // Log do erro
      res.status(404).json({ error: 'Funcionário não encontrado' });
    } else {
      console.log('Funcionário atualizado com sucesso:', id); // Log do sucesso
      res.json({ message: 'Funcionário atualizado com sucesso' });
    }
  });
});


// Rota GET para obter todas as vendas
app.get('/api/vendas', (req, res) => {
  db.query('SELECT * FROM vendas', (err, results) => {
    if (err) {
      console.error('Erro ao consultar as vendas:', err);
      res.status(500).json({ error: 'Erro ao obter vendas' });
    } else {
      console.log('Vendas encontradas:', results);
      res.json(results);
    }
  });
});

// Rota POST para criar uma nova venda
app.post('/api/vendas', (req, res) => {
  const { valor, metodo_pagamento, horario, dia, funcionario, status } = req.body;
  const query = `
    INSERT INTO vendas (valor, metodo_pagamento, horario, dia, funcionario, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [valor, metodo_pagamento, horario, dia, funcionario, status || 'pendente'];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Erro ao adicionar venda:', err);
      res.status(500).json({ error: 'Erro ao adicionar venda' });
    } else {
      console.log('Venda adicionada com sucesso:', result);
      res.status(201).json({ message: 'Venda adicionada com sucesso', id: result.insertId });
    }
  });
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
