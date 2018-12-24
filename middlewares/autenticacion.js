 // se importa el jasonwebtoken
 var jwt = require('jsonwebtoken');
 // se jala el seed pre configurado por defecto
 var SEED = require('../config/config').SEED;


 // para bloquear peticiones por medio de token se hara esto
 /* -------------------------------------
     <- Verificar token ->
     Descripción: Se lee el token y se recibe
     del url, se procesa y si es valido entonces
     se continua.
   --------------------------------------- */

exports.verificaToken = function(req,res,next){

      // se tiene el token a la mano
      var token = req.query.token;
      // el primer parametro es el token que se recibe de la peticion
      // el segundo es el seed y el tercero es el callback
      jwt.verify(token, SEED, (err, decoded) => {
          if (err) {
              // 401 es unautorized
              return res.status(401).json({
                  ok: false,
                  mensaje: 'Token no valido',
                  errors: err
              });
          }
          // el next verifica y valida que se siga con los procesos 
        // se manda el usuario quien hace la petición de esta forma, se inyecta en el request.
        req.usuario = decoded.usuario;
        // req.prueba = decoded;

          next();

        // res.status(200).json({
        //     ok: true,
        //     decoded: decoded
        // });
      });

    
}


 