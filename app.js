//-------- 
// Requires - son importaciones de librerias que hacen falta para que funcionen cosas.
var express = require('express');
// libreria moongoose
var mongoose = require('mongoose');
// importación de bodyparser para el uso de envio de formularios en post
var bodyParser = require('body-parser');

// ------------
// inicializar las variables necesarias
// se inicializa express
var app = express();

// se usa el bodyparser cualquier form post que llegue 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas
var appRoutes = require('./routes/appRoutes');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// conexion a base de datos con mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // si hay un error entonces
    // if(err) throw err;
    console.log('Base de datos Mongo: \x1b[32m', 'En linea', '\x1b[0m');
});

 
// rutas
// se ejecuta algo que se ejecuta antes del proceso de rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);

// escuchar peticiones de express
app.listen(3000, ()=>{
    console.log(" ");
     console.log('Servidor Node-Express: \x1b[32m', 'En linea localhost:3000', '\x1b[0m');

    
});



