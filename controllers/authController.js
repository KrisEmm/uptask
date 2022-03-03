const passport = require("passport");
const Usuarios = require("../models/Usuarios");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt-nodejs");
const enviarEmail = require("../handlers/email");

exports.autenticarUsuarios = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos Campos son Obligatorios"
});

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.redirect("/iniciar-sesion");
};

exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};

exports.enviarToken = async (req, res) => {
  const { email } = req.body;

  const usuario = await Usuarios.findOne({ where: { email } });

  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.render("reestablecer", {
      nombrePagina: "Reestablecer tu Contraseña",
      mensajes: req.flash()
    });
    // puede ser con render o con redirect no hay problema
    // res.redirect("/reestablecer");
  }
  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expiracion = Date.now() + 3600000;

  await usuario.save();

  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

  await enviarEmail.enviar({
    usuario,
    subject: "Reestablecer Contraseña",
    resetUrl,
    archivo: "reestablecer-password"
  });
  req.flash(
    "correcto",
    "Un correo de recuperacion de contraseña ha sido enviado a tu dirrecion de E-mail, Ve y completa el proceso para lograr recuperarla "
  );
  res.redirect("/iniciar-sesion");
};

exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token
    }
  });
  if (!usuario) {
    req.flash("error", "Token NO valido");
    res.render("reestablecer", {
      nombrePagina: "Reestablecer tu Contraseña",
      mensajes: req.flash()
    });
    // puede ser con render o con redirect no hay problema
    // res.redirect("/reestablecer");
  }
  res.render("resetPassword", {
    nombrePagina: "Reestablecer Contraseña"
  });
};

exports.actualizarPassword = async (req, res) => {
  const { token } = req.params;
  const usuario = await Usuarios.findOne({
    where: {
      token,
      expiracion: { [Op.gte]: Date.now() }
    }
  });

  if (!usuario) {
    req.flash("error", "Token talvez No es valido o ha expirado");
    res.redirect("/reestablecer");
  }

  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;

  await usuario.save();
  req.flash("correcto", "Tu password se ha modificado correctamente, ahora ya puedes Iniciar Sesion");
  res.redirect("/iniciar-sesion");
};
