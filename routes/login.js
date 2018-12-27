var express = require('express');
// se importa el bcrypt para encriptación de datos .. .se usa para contraseñas.
var bcrypt = require('bcryptjs');

// se importa el jsonwebtoken para creacion y validacion de tokens de usuario

var jwt = require('jsonwebtoken');
// se jala el seed pre configurado por defecto
var SEED = require('../config/config').SEED;


// importacion de herramientas para validar token con google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const SECRET_ID = require('../config/config').SECRET_ID;

const {
    OAuth2Client
} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID, SECRET_ID);

// se inicializa express
var app = express();

// para emplear el esquema de registros se importa el modelo de esquema
var UsuarioSchema = require('../models/usuarioSchema');

/* -------------------------------------
    <- Autenticación con google ->
    Descripción: Sirve para hacer login
    de forma verificada por medio de google
    singing
  --------------------------------------- */
// se recomienda que las confirmaciones de token de google se hagan por medio de un post

// se envia el token por parametro
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    // el payload tiene toda la informacióón del usuario.
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];
    // se busca retornar lo que se interesa del payload.
    return {
        // // se confirma si es un usuario de google.
        // payload,
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}



app.post('/google', async (req, res) => {
    // se obtiene el token
    var token = req.body.token,
        // se hace un await a este tipo de función
        googleUser = await verify(token).catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no valido'
            });
        });
    // información de token valido
    // se valida si el usuario existe o si es nuevo

    UsuarioSchema.findOne({
        email: googleUser.email
    }, (err, usuarioDB) => {
        // se verifica si viene un error
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }
        // si existe quiere decir que ya existe un usuario.
        if (usuarioDB) {
            // si no ha sido autenticado por google
            if( usuarioDB === false ){
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe autenticarse con su cuenta normal'
                });
            }else{
                // se genera un nuevo token y se manda la respuesta// si se llega en este punto se crea un token
                // recibe parametros, el primero es la data que va en el token, el segundo prametro es el seed de complejidad del token, y el tercer parametro es su plazo de vencimiento. 14400 es 4 horas.
                var token = jwt.sign({
                    usuario: usuarioDB
                }, SEED, {
                    expiresIn: 14400
                });

                res.status(200).json({
                    ok: true,
                    mensaje: 'Login google usuario regular',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            }

        }else{
            // si es la primera vez que el usuario se autentica con google. se crea usuario
            var usuario = new UsuarioSchema();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = '=)';

            // return res.status(200).json({
            //     usuario
            // });
            // despues de tomarse los datos, se graba todo
            usuario.save(( err,usuarioDB) => {
                var token = jwt.sign({
                    usuario: usuarioDB
                }, SEED, {
                    expiresIn: 14400
                });

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Login google usuario nuevo',
                    usuario: usuarioDB,
                    token: token,
                    id: usuarioDB._id
                });
            });
        }

    });


});

/* -------------------------------------
    <- Autenticacón generca normal ->
    Descripción: Sirve para hacer login de
    usuarios normales suscritos de forma nativa
    en la plataforma.
  --------------------------------------- */
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
            if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
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
            }, SEED, {
                expiresIn: 14400
            });

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