var express = require('express');

// se inicializa express
var app = express();


// rutas
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Petición realizadaaaa'
    });
    //   res.send('Hello World!');
});


module.exports = app;