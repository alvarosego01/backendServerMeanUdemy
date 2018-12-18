//-------- 
// Requires - son importaciones de librerias que hacen falta para que funcionen cosas.
var express = require('express');
// libreria moongoose
var mongoose = require('mongoose');

// ------------
// inicializar las variables necesarias
// se inicializa express
var app = express();

// conexion a base de datos con mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // si hay un error entonces
    if(err) throw err;
    console.log('Mongo base de datos: \x1b[42m%s\x1b[0m', 'online');
});

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

// escuchar peticiones de express
app.listen(3000, ()=>{
    console.log('Node/Express: \x1b[42m%s\x1b[0m', 'online');
    
});

