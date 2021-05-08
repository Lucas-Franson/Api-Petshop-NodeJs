const roteador = require('express').Router();
const TabelaFornecedor = require('./TabelaFornecedor');
const Fornecedor = require('./Fornecedor');
const SerializadorFornecedor = require('../../Serializador').SerializadorFornecedor;

roteador.options('/', (req, res) => {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204);
    res.end();
})

roteador.get('/', async (req, res) => {
    const resultados = await TabelaFornecedor.listar();
    res.status(200);
    const serializador = new SerializadorFornecedor(
        res.getHeader('Content-Type'),
        ['empresa']
    )
    res.send(
        serializador.serializar(resultados)
    );
});

roteador.post('/', async (req, res, proximo) => {
    
    try {
        const dadosRecebidos = req.body;
        const fornecedor = new Fornecedor(dadosRecebidos)
        await fornecedor.criar()

        res.status(201);
        const serializador = new SerializadorFornecedor(
            res.getHeader('Content-Type'),
            ['empresa']
        )
        res.send(
            serializador.serializar(fornecedor)
        )
    } catch (err) {
        proximo(erro);
    }
});

roteador.options('/:idFornecedor', (req, res) => {
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE');
    res.status(204);
    res.end();
})

roteador.get('/:idFornecedor', async (req, res) => {
    
    try {
        const id = req.params.idFornecedor;
        const fornecedor = new Fornecedor({ id });
    
        await fornecedor.carregar()
        res.status(200);
        const serializador = new SerializadorFornecedor(
            res.getHeader('Content-Type'),  
            ['email', 'empresa', 'dataCriacao', 'dataAtualizacao', 'versao']
        )
        res.send(
            serializador.serializar(fornecedor)
        );
    } catch(err) {
        res.send(
            JSON.stringify({
                mensagem: err.message
            })
        )
    }
})

roteador.put('/:idFornecedor', async (req, res, proximo) => {
    try{
        const id = req.params.idFornecedor;
        const dadosRecebidos = req.body;
        const dados = Object.assign({}, dadosRecebidos, { id })
        const fornecedor = new Fornecedor(dados);
        await fornecedor.atualizar();
        res.status(204);
        res.end();
    } catch(err) {
        proximo(err);
    }
})

roteador.delete('/:idFornecedor', async (req, res, proximo) => {
    try {
        const id = req.params.idFornecedor;
        const fornecedor = new Fornecedor({ id });
    
        await fornecedor.carregar();
        await fornecedor.remover();
        res.status(204);
        res.end();
    } catch(err) {
        proximo(err);
    }
})

const roteadorProdutos = require('./produtos')

const verificarFornecedor = async (req, res, proximo) => {
    try {
        const id = req.params.idFornecedor;
        const fornecedor = new Fornecedor({ id });
        await fornecedor.carregar();
        req.fornecedor = fornecedor;
        proximo();
    } catch(err) {
        proximo(err);
    }
}

roteador.use('/:idFornecedor/produtos', verificarFornecedor, roteadorProdutos);

module.exports = roteador