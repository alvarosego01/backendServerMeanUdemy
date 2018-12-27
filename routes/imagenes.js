var express = require('express');

// se inicializa express
var app = express();
// se importa esto para crear paths de imagenes
const path = require('path'),
// se confirma si la imagen existe en ese path
    fs = require('fs');

// rutas
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.get('/:tipo/:img', (req, res, next) => {

    // hay que verificar si la imagen existe.. si no existe entonces se pone una por defecto
    var tipo = req.params.tipo,
        img = req.params.img,
        pathImagen = path.resolve( __dirname, `../uploads/${tipo}/${img}` );
    
    // //Se valida si hay imagen existente en ese path 
    if (fs.existsSync(pathImagen)) {
        // si regresa true entonces todo esta correcto
        res.sendFile( pathImagen );
    }
    else{
        var pathNoImagen = path.resolve( __dirname, '../assets/no-img.jpg' );
        res.sendFile(pathNoImagen);
    }
    

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Petición realizadaaaa',
    //     path: fs.existsSync(pathImagen),
    //     tipo: tipo,
    //     img: pathImagen
    // });
    // // //   res.send('Hello World!');
});


module.exports = app;