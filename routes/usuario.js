var express = require('express');
// se importa el bcrypt para encriptación de datos .. .se usa para contraseñas.
var bcrypt = require('bcryptjs');

// se importa el jasonwebtoken
var jwt = require('jsonwebtoken');

var mdwAutenticacion = require('../middlewares/autenticacion');


// se inicializa express
var app = express();

// para emplear el esquema de registros se importa el modelo de esquema
var UsuarioSchema = require('../models/usuarioSchema');


// rutas
// el get recibe 3 parametros, request. eñ response y el next
// el next cuando se ejecuta hara que se continue con otra funcion
app.get('/', (req, res, next) => {

    // para usar el modelo
    // busca y segundo parametro recibe error y recibe resultado
    // si hay error entonces retorna un estatus de http
    // para pedir solamente algunos campos del resultado, se coloca una coma y se escriben sus nombres de registro
    // para poder paginar se usa el tipo limit
    // usa un numero que viene desde o si no pues usa 0
    var desde = req.query.desde || 0;
    desde = Number(desde);

    UsuarioSchema.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec(
        (err, resultado) =>{
            if(err){
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error obteniendo usuarios',
                    errors: err
                });
            }
            var total;
            // para tener el total de registros se usa esto
            UsuarioSchema.count({}, (err, conteo) => {
                // si todo sale bien entonces retorna los resultados con    estatus 200
                 res.status(200).json({
                     ok: true,
                     usuarios: resultado,
                     total: conteo
                 });
            });
           

        });
 
});
 
/* -------------------------------------
    <- Actualización de usuarios ->
    Descripción:  Codigo para la edición de 
    un usuario por medio de una petición http
    para el servicio rest
  --------------------------------------- */
app.put('/:id', mdwAutenticacion.verificaToken,(req, res) => {

    var id = req.params.id;
    var body = req.body;

    // se obtiene el id y ahora se verifica si el usuario existe
    // se llama al modelo de datos y se usa
    UsuarioSchema.findById( id, (err, respuesta)=>{

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        if( !respuesta ){
            return res.status(500).json({
                ok: false,
                mensaje: 'El usuario con el id '+id+' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }
        // ya se sabe que existe un usuario
        respuesta.nombre = body.nombre;
        respuesta.email = body.email;
        respuesta.role = body.role;
        // ahora se hace la grabación
        respuesta.save( (err,usuarioGuardado) =>{
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al Actualizar el usuario',
                    errors: err
                });
            }

            // exclusion de datos al retornar.
            usuarioGuardado.password = ':)';

            return res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    

    });

 

});
 
/* -----------------------------
    <- Crear nuevo usuario ->
    Descripción: Codigo para crear un nuevo usuario
  ------------------------------- */
app.post('/', mdwAutenticacion.verificaToken ,(req,res)=>{
    // se reciben los datos form 
    var body = req.body;
    // se usa mongoose para grabar
    // new usuario hace referencia al modelo de datos creado.

    // se crea el cuerpo o referencia de nuevo usuario
    var usuario = new UsuarioSchema({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync( body.password, 10 ),
        img: body.img,
        role: body.role
    });
    // se guarda la referencia.
    usuario.save( (err, usuarioGuardado) =>{
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        // se pasa estatus 201 que significa recurso creado
        res.status(201).json({
            ok: true,
            body: usuarioGuardado,
            usuarioToken: req.usuario
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
    UsuarioSchema.findByIdAndRemove(id, (err, usuarioBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al Borrar usuario',
                errors: err
            });
        }
        // comprobar  que el usuario existe
         if( !usuarioBorrado ){
            return res.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id '+id+' no existe',
                errors: { message: 'No existe un usuario con ese id' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado
        });
    });
});

module.exports = app;