//-------- 
// Requires - son importaciones de librerias que hacen falta para que funcionen cosas.
var express = require('express'),
// libreria moongoose
    mongoose = require('mongoose'),
// importación de bodyparser para el uso de envio de formularios en post
    bodyParser = require('body-parser'),

// ------------
// inicializar las variables necesarias
// se inicializa express
    app = express();

// se usa el bodyparser cualquier form post que llegue 
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// importar rutas
var appRoutes = require('./routes/appRoutes'),
    medicoRoutes = require('./routes/medico'),
    hospitalRoutes = require('./routes/hospital'),
    usuarioRoutes = require('./routes/usuario'),
    loginRoutes = require('./routes/login'),
    uploadRoutes = require('./routes/upload'),
    imagenesRoutes = require('./routes/imagenes.js'),
    busquedaRoutes = require('./routes/busqueda');


// conexion a base de datos con mongoose
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    // si hay un error entonces
    // if(err) throw err;
    console.log('Base de datos Mongo: \x1b[32m', 'En linea', '\x1b[0m');
});


// forma con server index config para desplegar imagenes
// var serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'))
// app.use('/uploads', serveIndex(__dirname + '/uploads'));
 
// rutas
// se ejecuta algo que se ejecuta antes del proceso de rutas
 
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);

// escuchar peticiones de express
app.listen(3000, ()=>{
    console.log(" ");
     console.log('Servidor Node-Express: \x1b[32m', 'En linea localhost:3000', '\x1b[0m');

    
});



