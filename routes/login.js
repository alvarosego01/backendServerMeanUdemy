var express = require('express');
// se importa el bcrypt para encriptación de datos .. .se usa para contraseñas.
var bcrypt = require('bcryptjs');

// se importa el jsonwebtoken para creacion y validacion de tokens de usuario

var jwt = require('jsonwebtoken');
// se jala el seed pre configurado por defecto
var SEED = require('../config/config').SEED;


// se inicializa express
var app = express();

// para emplear el esquema de registros se importa el modelo de esquema
var UsuarioSchema = require('../models/usuario');


app.post('/', (req, res) => {

    // se necesita recibir el email y la contraseña como cuerpo de login
    var body = req.body;

    // new usuario hace referencia al modelo de datos creado.
    // se hace la busqueda con las condiciones findone
    UsuarioSchema.findOne({
            email: body.email
        },
        (err, usuarioDB) => {

            // se verifica si viene un error
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar usuario',
                    errors: err
                });
            }
            if (!usuarioDB) {
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Credenciales incorrectas - email',
                    body: body
                });
            }
            // si llega en este punto entonces todo esta valido
            // se verifica la contraseña
            if( !bcrypt.compareSync( body.password, usuarioDB.password ) ){
                return res.status(400).json({
                    ok: true,
                    mensaje: 'Credenciales incorrectas - password',
                    body: body
                });
            }
            // se quita la contraseña
            usuarioDB.password = ':)';
            // si se llega en este punto se crea un token
            // recibe parametros, el primero es la data que va en el token, el segundo prametro es el seed de complejidad del token, y el tercer parametro es su plazo de vencimiento. 14400 es 4 horas.
            var token = jwt.sign({
                usuario: usuarioDB
            }, SEED ,
            { expiresIn: 14400 });

            res.status(200).json({
                ok: true,
                mensaje: 'Petición de login correcta',
                usuario: usuarioDB,
                token: token,
                id: usuarioDB._id
            });

        });
    // se crea el cuerpo o referencia de nuevo usuario
    // var usuario = new UsuarioSchema({
    //     nombre: body.nombre,
    //     email: body.email,
    //     password: bcrypt.hashSync(body.password, 10),
    //     img: body.img,
    //     role: body.role
    // });
 
});

 

module.exports = app;