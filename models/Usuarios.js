const Sequelize = require("sequelize");
const db = require("../config/db");
const Proyectos = require("../models/Proyectos");
const bcrypt = require("bcrypt-nodejs");

const Usuarios = db.define(
  "usuarios",
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: Sequelize.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password esta vacio"
        },
        isEmail: {
          msg: "Correo NO válido"
        }
      },
      unique: {
        args: true,
        msg: "Usuario ya registrado"
      }
    },
    password: {
      type: Sequelize.STRING(60),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Password esta vacio"
        }
      }
    },
    activo: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    token: Sequelize.STRING,
    expiracion: Sequelize.DATE
  },
  {
    hooks: {
      beforeCreate(usuario) {
        usuario.password = bcrypt.hashSync(usuario.password, bcrypt.genSaltSync(10));
      }
    }
  }
);
Usuarios.prototype.verificarPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};
Usuarios.hasMany(Proyectos);

module.exports = Usuarios;
