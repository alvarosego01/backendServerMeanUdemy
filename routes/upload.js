
var express = require('express'),
    // libreria para subir archivos
    fileUpload = require('express-fileupload'),
    // se inicializa express
    app = express(),
    // se importa el fs para poder manipular archivos como por ejemplo eliminar
    fs = require('fs'),
    // para poder hacer insesiones en colecciones de tipos pues hara falta importar los schemas de modelos de datos.
    hospitalSchema = require('../models/hospitalSchema'),
    medicoSchema = require('../models/medicoSchema'),
    usuarioSchema = require('../models/usuarioSchema');


// se importa el middleware de la libreria
app.use(fileUpload());

/* -------------------------------------
    <- Actualizar o añadir imagen ->
    Descripción: Añade o actualiza una imagen
    de un tipo de dato valido entre tres.
    Posee su validaciones basicas correspondientes
  --------------------------------------- */
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.put('/:tipo/:id', (req, res, next) => {

    var tipo = req.params.tipo,
        id = req.params.id,
        // tipos de colecciones
        tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: {
                message: 'Debe seleccionar una coleccion valida'
            }
        });
    }

    if (!req.files) {

        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: {
                message: 'Debe seleccionar una imagen'
            }
        });

    }
    // obtener nombre del archivo que se recibe. el nombre de imagen es el mismo variable que se manda al momento
    var archivo = req.files.imagen,
        nombreCortado = archivo.name.split('.'),
        extensionArchivo = nombreCortado[nombreCortado.length - 1],
        // solo se aceptan estas extensiones
        extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            extension: extensionArchivo,
            errors: {
                message: 'Las extensiones validas son: ' + extensionesValidas.join(', ')
            }
        });
    }
    // se crea nombre de archivo personalizado.
    var nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`,
        // mover archivo del temporal a una dirección
        path = `./uploads/${ tipo }/${ nombreArchivo }`;
    archivo.mv(path, err => {

        if( err ){
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });
        }

        // 

        // si no sucede nada malo entonces quiere decir que subio y movio el archivo de forma correcta.
        subirPorTipo(tipo, id, nombreArchivo, res);
      


    })
});


/* -------------------------------------
    <- Subir por tipo respectivo ->
    Descripción: Funcion que ayuda a subir
    cada imagen a su usuario y a su tipo de coleccion
    correspondiente.
  --------------------------------------- */
function subirPorTipo( tipo, id, nombreArchivo, res ){

    // se valida la imagen para cada tipo
    if( tipo === 'usuarios' ){

        usuarioSchema.findById( id, (err, respuesta) =>{
            // si existe una imagen vieja entonces se borra
            
            if( !respuesta ){
                return res.status(200).json({
                    ok: true,
                    mensaje: `${tipo} no existe, id invalido`,
                    errors: {
                        message: `${tipo} no existe, id invalido`
                    }
                });
            }
            
            var pathViejo = './uploads/usuarios/' + respuesta.img;
            if( fs.existsSync(pathViejo) ){
                fs.unlink(pathViejo);
            }
            // se añade imagen nueva
            respuesta.img = nombreArchivo;
            respuesta.save( (err, respuestaAct) =>{

                respuestaAct.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: respuestaAct
                });
            });
        });

    }

    if( tipo === 'medicos' ){
        medicoSchema.findById(id, (err, respuesta) => {
            if (!respuesta) {
                return res.status(200).json({
                    ok: true,
                    mensaje: `${tipo} no existe, id invalido`,
                    errors: {
                        message: `${tipo} no existe, id invalido`
                    }
                });
            }
            var pathViejo = './uploads/medicos/' + respuesta.img;
            // si existe una imagen vieja entonces se borra
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            // se añade imagen nueva
            respuesta.img = nombreArchivo;
            respuesta.save((err, respuestaAct) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medicos actualizada',
                    medico: respuestaAct
                });
            });
        });
    }

    if( tipo === 'hospitales' ){
        hospitalSchema.findById(id, (err, respuesta) => {
            if (!respuesta) {
                return res.status(200).json({
                    ok: true,
                    mensaje: `${tipo} no existe, id invalido`,
                    errors: {
                        message: `${tipo} no existe, id invalido`
                    }
                });
            }
            var pathViejo = './uploads/hospitales/' + respuesta.img;
            // si existe una imagen vieja entonces se borra
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            // se añade imagen nueva
            respuesta.img = nombreArchivo;
            respuesta.save((err, respuestaAct) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospitales actualizada',
                    usuario: respuestaAct
                });
            });
        });
    }

}

module.exports = app;



 