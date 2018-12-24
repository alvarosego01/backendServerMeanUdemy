var express = require('express');

// se inicializa express
var app = express();

var hospitalSchema = require('../models/hospitalSchema'),
    medicoSchema = require('../models/medicoSchema'),
    usuarioSchema = require('../models/usuarioSchema');



/* -------------------------------------
    <- Busqueda por colección(tablas) ->
    Descripción: Esta busqueda traera resultados
    de parametros especificos de busqueda en 
    colecciones especificas.
  --------------------------------------- */
app.get('/coleccion/:tabla/:busqueda', (req, res) => {

    var tabla = req.params.tabla,
        busqueda = req.params.busqueda,
        regex = new RegExp(busqueda, 'i'),
        promesa;
    
    switch( tabla ){

        case 'hospitales':
        promesa = buscarHospitales(busqueda, regex);
        break;

        case 'medicos':
        promesa = buscarMedicos(busqueda, regex);
        break;

        case 'usuarios':
        promesa = buscarUsuarios(busqueda, regex);
        break;

        default:
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipos de busqueda incorrecto',
            error: {
                message: 'Tipo de tabla o coleccion invalido'
            }
        });
    }
    // colocando la variable data entre corchetes se le dice a javascript que tome el resultado de la variable para mostrarlo en el json final
    promesa.then( data => {
        res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
 

});


/* -------------------------------------
    <- Busqueda general ->
    Descripción: Esta función tipo Get retorna
    los resultados de busqueda de todas las tablas
    relacionadas en juego tales como usuarios,
    hospitales  y medicos.
  --------------------------------------- */
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.get('/todo/:busqueda', (req, res, next) => {

    var busqueda = req.params.busqueda;

    // se crea una epresion regular para que la busqueda sea insensible..de esta forma se busca todo lo referente al parametro que incluyas.
    var regex = new RegExp(busqueda, 'i');

    // con esta función arrechisima se pueden manejar todas las promesas que se necesite que se cumplan todas..si todas se cumplen se dispara un then y si una falla se maneja un catch
    Promise.all([
        // posicion 0
        buscarHospitales(busqueda, regex),
        // posicion 1
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        // este tipo de funcion retorna todos los resultados de las promesas que en ella lleva incluido, sus resultados van acorde a la misma posicion en la que se insertan las funciones de busqueda.
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    })



});


// para buscar en varias tablas al mismo tiempo se realiza una promesa
/* -------------------------------------
    <- Busqueda de hospitales ->
    Descripción: Retorna todos los hospitales
    de manera asincrona usando una promesa
  --------------------------------------- */
function buscarHospitales(busqueda, regex) {

    return new Promise((resolve, reject) => {

        hospitalSchema.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                // si hay un error entonces
                if (err) {
                    reject('Error al retornar hospitales', err);
                } else {
                    //si no hay error entonces retorna la data referente a hospitales
                    resolve(hospitales);
                }

            });

    });
}
/* -------------------------------------
    <- Busqueda de medicos ->
    Descripción: Retorna todos los medicos
    de manera asincrona usando una promesa
  --------------------------------------- */
function buscarMedicos(busqueda, regex) {

    return new Promise((resolve, reject) => {
        // populate es para traerse datos de alguna tabla referenciada en la tabla actual
        medicoSchema.find({
                nombre: regex
            })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                // si hay un error entonces
                if (err) {
                    reject('Error al retornar medicos', err);
                } else {
                    //si no hay error entonces retorna la data referente a medicos
                    resolve(medicos);
                }

            });

    });
}
/* -------------------------------------
    <- Busqueda de Usuarios ->
    Descripción: Retorna todos los Usuarios
    de manera asincrona usando una promesa
  --------------------------------------- */
function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve, reject) => {
        // de esta forma usando el parametro or. se pueden buscar en varios registros de una misma tabla.. 
        usuarioSchema.find({}, 'nombre email role').or([{
                'nombre': regex
            },
            {
                'email': regex
            }
        ]).exec((err, Usuarios) => {


            // si hay un error entonces
            if (err) {
                reject('Error al retornar Usuarios', err);
            } else {
                //si no hay error entonces retorna la data referente a Usuarios
                resolve(Usuarios);
            }

        });

    });
}

module.exports = app;