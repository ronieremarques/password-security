const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Middleware para parse de JSON no corpo das requisições
app.use(bodyParser.json());

// Base de dados em memória (simulando os dados do arquivo db.json)
let db = {};

// Verifica se o auth tem o formato "123"
function checkAuth(auth) {
    return auth === 'your_auth';
}

// Caminho inicial simples
app.get('/', (req, res) => {
    res.send('Bem-vindo!');
});

// Caminho para obter senhas de uma plataforma específica
app.get('/getpasswords/:auth/:plataforma', (req, res) => {
    const auth = req.params.auth;
    const plataforma = req.params.plataforma;

    if (!checkAuth(auth)) {
        return res.status(403).send('Acesso negado.');
    }

    if (!db[plataforma]) {
        return res.status(404).send('Plataforma não encontrada.');
    }

    const senhas = db[plataforma];
    res.json(senhas);
});

// Caminho para criar senha para uma plataforma específica
app.post('/createpasswords/:auth/:plataforma/:usuario/:senha', (req, res) => {
    const auth = req.params.auth;
    const plataforma = req.params.plataforma;
    const usuario = req.params.usuario;
    const senha = req.params.senha;

    if (!checkAuth(auth)) {
        return res.status(403).send('Acesso negado.');
    }

    // Verifica se a plataforma já existe no banco
    if (!db[plataforma]) {
        db[plataforma] = [];
    }

    // Verifica se o usuário já existe para essa plataforma
    const usuarioExistente = db[plataforma].find(item => Object.keys(item)[0] === usuario);

    if (usuarioExistente) {
        return res.status(400).send('Usuário já existe para esta plataforma.');
    }

    // Adiciona a nova senha para a plataforma especificada
    db[plataforma].push({ [usuario]: senha });

    res.send('Senha criada com sucesso.');
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
