'use strict';

const express = require('express');
const cors = require("cors");
const { DatabaseSync } = require('node:sqlite');

const app = express();
const db = new DatabaseSync('./employees.db');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    salary INTEGER NOT NULL,
    email TEXT UNIQUE NOT NULL
  ) STRICT
`);

app.post('/employees', (req, res) => {
  const { name, department, salary, email } = req.body;
  const stmt = db.prepare(
    'INSERT INTO employees (name, department, salary, email) VALUES (?, ?, ?, ?)'
  );
  stmt.run(name, department, salary, email);
  res.status(201).json({ message: 'Employee added' });
});

app.get('/employees', (req, res) => {
  const stmt = db.prepare('SELECT * FROM employees');
  res.json(stmt.all());
});

app.get('/employees/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM employees WHERE id = ?');
  const employee = stmt.get(req.params.id);
  if (!employee) return res.status(404).json({ message: 'Not found' });
  res.json(employee);
});

app.put('/employees/:id', (req, res) => {
  const { name, department, salary, email } = req.body;
  const stmt = db.prepare(
    'UPDATE employees SET name=?, department=?, salary=?, email=? WHERE id=?'
  );
  stmt.run(name, department, salary, email, req.params.id);
  res.json({ message: 'Employee updated' });
});

app.delete('/employees/:id', (req, res) => {
  const stmt = db.prepare('DELETE FROM employees WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ message: 'Employee deleted' });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
