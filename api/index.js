const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const config = require('config');
const NaoEncontrado = require('./erros/NaoEncontrado');
const CampoInvalido = require('./erros/CampoInvalido');
const DadosNaoFornecidos = require('./erros/DadosNaoFornecidos');
const ValorNaoSuportado = require('./erros/ValorNaoExportado');
const FormatosAceitos = require('./Serializador').formatosAceitos;
const SerializadorErro = require('./Serializador').SerializadorErro;

app.use(bodyParser.json());

app.use((req, res, proximo) => {
    let formatoRequisitado = req.header('Accept');

    if (formatoRequisitado === '*/*') {
        formatoRequisitado = 'application/json';
    }

    if (FormatosAceitos.indexOf(formatoRequisitado) === -1) {
        res.status(406);
        res.end();
        return 
    }

    res.setHeader('Content-Type', formatoRequisitado);
    proximo();
})

app.use((req, res, proximo) => {
    res.set('Access-Controle-Allow-Origin', '*');
    proximo();
})

const roteador = require('./rotas/fornecedores');
app.use('/api/fornecedores', roteador);

const roteadorV2 = require('./rotas/fornecedores/rotas.v2');
app.use('/api/v2/fornecedores', roteadorV2);

app.use((err, req, res, proximo) => {
    let status = 500;
    
    if (err instanceof NaoEncontrado) {
        status = 404;
    } 

    if (err instanceof CampoInvalido || erro instanceof DadosNaoFornecidos) {
        status = 400;
    }

    if (err instanceof ValorNaoSuportado) {
        status = 406;
    }

    const serializador = new SerializadorErro(
        res.getHeader('Content-Type')
    )
    res.status(status);
    res.send(
        serializador.serializar({
            mensagem: err.mensage,
            id: err.idErro
        })
    )
})

app.listen(config.get('api.porta'), () => console.log("A API está rodando"))