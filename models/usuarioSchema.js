var mongoose = require('mongoose');

// se importa un plugin de mongoose para validar un error que aparece cuando una consulta falla ( ya se vera mas )
var uniqueValidator = require('mongoose-unique-validator');

// dentro de mongose hay algo para definir esquemas y hay que importarlo
var Schema = mongoose.Schema;

// para permitir los tipos de roles que se van a permitir se hace
var rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es nun rol valido'
}


// se define el esquema de la siguiente forma.. el nombre de la conexion con el schema
var usuarioSchema = new Schema({
    // se coloca en corchetes un mensaje para verificar cuando un registro requerido falle
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El correo es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }



});
// para indicarle a mongose que este esquema tendra este plugin de validator entonces
// para el caso en que se tengan varios items de tipo unique entonces se coloca con llaves {PATH}
usuarioSchema.plugin( uniqueValidator, {
    message: '{PATH} debe ser unico'
} )

// se pauta el ombre del modelo mongose y se exporta
module.exports = mongoose.model( 'Usuario', usuarioSchema );
