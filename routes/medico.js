var express = require('express');
// se importa el bcrypt para encriptación de datos .. .se usa para contraseñas.


var mdwAutenticacion = require('../middlewares/autenticacion');


// se inicializa express
var app = express();

// para emplear el esquema de registros se importa el modelo de esquema
var medicoSchema = require('../models/medicoSchema');



/* -------------------------------------
    <- Get de todos los Medicos ->
    Descripción: Retorna todos los Medicos
    registrados en el sistema, no tiene 
    requisito de token.
  --------------------------------------- */
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
// se usa populate para traer los registros deseados de una tabla referenciada
app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    // para usar el modelo
    // busca y segundo parametro recibe error y recibe resultado
    // si hay error entonces retorna un estatus de http
    // para pedir solamente algunos campos del resultado, se coloca una coma y se escriben sus nombres de registro

    medicoSchema.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, resultado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error obteniendo Medicos',
                        errors: err
                    });
                }
                medicoSchema.count({}, (err,conteo) =>{

                    // si todo sale bien entonces retorna los resultados con    estatus 200
                    res.status(200).json({
                        ok: true,
                        Medicos: resultado,
                        total: conteo
                    });
                })

            });

});

/* -----------------------------
    <- Crear nuevo medico ->
    Descripción: Codigo para crear un nuevo medico
  ------------------------------- */
app.post('/', mdwAutenticacion.verificaToken, (req, res) => {
    // se reciben los datos form 
    var body = req.body;
    // se usa mongoose para grabar
    // new usuario hace referencia al modelo de datos creado.

    // se crea el cuerpo o referencia de nuevo usuario
    var medico = new medicoSchema({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });


    // se guarda la referencia.
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        // se pasa estatus 201 que significa recurso creado
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        });
    });


});

/* -------------------------------------
    <- Actualización de medico ->
    Descripción:  Codigo para la edición de 
    un medico por medio de una petición http
    para el servicio rest
  --------------------------------------- */
app.put('/:id', mdwAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // se obtiene el id y ahora se verifica si el usuario existe
    // se llama al modelo de datos y se usa
    medicoSchema.findById(id, (err, respuesta) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!respuesta) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un medico con ese id'
                }
            });
        }
        // ya se sabe que existe un usuario
        respuesta.nombre = body.nombre;
        respuesta.usuario = req.usuario._id;
        respuesta.hospital = body.hospital;
        // respuesta.usuario = req.medicoSchema;
        // ahora se hace la grabación
        respuesta.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar el medico',
                    errors: err
                });
            }

            // exclusion de datos al retornar.
            // medicoGuardado.password = ':)';
            return res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });


    });



});



/* -------------------------------------
    <- Borrar medico ->
    Descripción: Metodo que borra medico 
    por medio del ID
  --------------------------------------- */
app.delete('/:id', mdwAutenticacion.verificaToken, (req, res) => {
    // se obtiene el id
    var id = req.params.id;
    // se hace referencia al modelo
    medicoSchema.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar medico',
                errors: err
            });
        }
        // comprobar  que el medico existe
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un medico con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;