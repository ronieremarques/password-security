const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const port = 3000;

// Middleware para parse de JSON no corpo das requisições
app.use(bodyParser.json());

// Verifica se o auth tem o formato "123"
function checkAuth(auth) {
    return auth === '3AD3D265DBC38CB33FA22EB69F4A3';
}

// Caminho inicial simples
app.get('/', (req, res) => {
    res.redirect('https://github.com/ronieremarques');
});

// Caminho para obter senhas de uma plataforma específica
app.get('/getpasswords/:auth/:plataforma', (req, res) => {
    const auth = req.params.auth;
    const plataforma = req.params.plataforma;

    if (!checkAuth(auth)) {
        return res.status(403).send('Acesso negado.');
    }

    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro interno.');
        }

        try {
            const db = JSON.parse(data);

            if (!db[plataforma]) {
                return res.status(404).send('Plataforma não encontrada.');
            }

            const senhas = db[plataforma];
            res.json(senhas);

        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno.');
        }
    });
});

// Caminho para criar senha para uma plataforma específica
app.get('/createpasswords/:auth/:plataforma/:usuario/:senha', (req, res) => {
    const auth = req.params.auth;
    const plataforma = req.params.plataforma;
    const usuario = req.params.usuario;
    const senha = req.params.senha;

    if (!checkAuth(auth)) {
        return res.status(403).send('Acesso negado.');
    }

    fs.readFile('db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro interno.');
        }

        try {
            const db = JSON.parse(data);

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

            // Escreve de volta no arquivo db.json
            fs.writeFile('db.json', JSON.stringify(db), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Erro interno.');
                }

                res.send('Senha criada com sucesso.');
            });

        } catch (error) {
            console.error(error);
            res.status(500).send('Erro interno.');
        }
    });
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
