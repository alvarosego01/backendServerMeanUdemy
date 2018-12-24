var express = require('express');
// se importa el bcrypt para encriptación de datos .. .se usa para contraseñas.


var mdwAutenticacion = require('../middlewares/autenticacion');


// se inicializa express
var app = express();

// para emplear el esquema de registros se importa el modelo de esquema
var hospitalSchema = require('../models/hospitalSchema');



/* -------------------------------------
    <- Get de todos los hospitales ->
    Descripción: Retorna todos los hospitales
    registrados en el sistema, no tiene 
    requisito de token.
  --------------------------------------- */
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    // para usar el modelo
    // busca y segundo parametro recibe error y recibe resultado
    // si hay error entonces retorna un estatus de http
    // para pedir solamente algunos campos del resultado, se coloca una coma y se escriben sus nombres de registro

    // se usa populate para traer datos o tablas de otra referencia y como segundo parametro se mandan los campos que se necesitan..
    hospitalSchema.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, resultado) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error obteniendo hospitales',
                        errors: err
                    });
                }

                hospitalSchema.count({}, (err,conteo) => {

                    // si todo sale bien entonces retorna los resultados con    estatus 200
                    res.status(200).json({
                        ok: true,
                        hospitales: resultado,
                        total: conteo
                    });
                });
            });

});

/* -----------------------------
    <- Crear nuevo hospital ->
    Descripción: Codigo para crear un nuevo hospital
  ------------------------------- */
app.post('/', mdwAutenticacion.verificaToken , (req, res) => {
    // se reciben los datos form 
    var body = req.body;
    // se usa mongoose para grabar
    // new usuario hace referencia al modelo de datos creado.

    // se crea el cuerpo o referencia de nuevo usuario
    var hospital = new hospitalSchema({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

 
    // se guarda la referencia.
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        // se pasa estatus 201 que significa recurso creado
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        });
    });


});

/* -------------------------------------
    <- Actualización de hospital ->
    Descripción:  Codigo para la edición de 
    un hospital por medio de una petición http
    para el servicio rest
  --------------------------------------- */
app.put('/:id', mdwAutenticacion.verificaToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    // se obtiene el id y ahora se verifica si el usuario existe
    // se llama al modelo de datos y se usa
    hospitalSchema.findById(id, (err, respuesta) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital',
                errors: err
            });
        }
        if (!respuesta) {
            return res.status(500).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un hospital con ese id'
                }
            });
        }
        // ya se sabe que existe un usuario
        respuesta.nombre = body.nombre;
        respuesta.usuario = req.usuario._id;
        // respuesta.usuario = req.hospitalSchema;
        // ahora se hace la grabación
        respuesta.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar el hospital',
                    errors: err
                });
            }

            // exclusion de datos al retornar.
            // hospitalGuardado.password = ':)';
            return res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });


    });



});

 

/* -------------------------------------
    <- Borrar usuario ->
    Descripción: Metodo que borra usuario 
    por medio del ID
  --------------------------------------- */
app.delete('/:id', mdwAutenticacion.verificaToken, (req, res) => {
    // se obtiene el id
    var id = req.params.id;
    // se hace referencia al modelo
    hospitalSchema.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar hospital',
                errors: err
            });
        }
        // comprobar  que el hospital existe
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id ' + id + ' no existe',
                errors: {
                    message: 'No existe un hospital con ese id'
                }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;