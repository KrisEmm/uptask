const Usuarios = require("../models/Usuarios");
const enviarEmail = require("../handlers/email");

exports.formCrearCuenta = (req, res) => {
  res.render("crearCuenta", {
    nombrePagina: "Crear Cuenta en UpTask"
  });
};

exports.crearCuenta = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (process.env.SMTP) {
      await Usuarios.create({
        email,
        password
      });
      const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;
      const usuario = {
        email
      };
      await enviarEmail.enviar({
        usuario,
        subject: "Confirma tu cuenta UpTask",
        confirmarUrl,
        archivo: "confirmar-cuenta"
      });
      req.flash(
        "correcto",
        "Un correo ha sido enviado a tu dirrecion de E-mail para confirmar tu cuenta, Ve y completa el proceso, Gracias. "
      );
    } else {
      const activo = 1;
      await Usuarios.create({
        email,
        password,
        activo
      });
      req.flash("correcto", "Tu Cuenta ya ha sido activada correctamente");
    }
    res.redirect("/iniciar-sesion");
  } catch (error) {
    req.flash(
      "error",
      error.errors.map(error => error.message)
    );
    res.render("crearCuenta", {
      mensajes: req.flash(),
      nombrePagina: "Crear Cuenta en UpTask",
      email,
      password
    });
  }
};

exports.formIniciarSesion = (req, res) => {
  const { error } = res.locals.mensajes;
  res.render("iniciarSesion", {
    nombrePagina: "Iniciar Sesion en UpTask",
    error
  });
};

exports.formReestablecerPassword = (req, res) => {
  res.render("reestablecer", {
    nombrePagina: "Reestablecer tu Contraseña"
  });
};

exports.confirmarCuenta = async (req, res) => {
  const { email } = req.params;
  const usuario = await Usuarios.findOne({
    where: {
      email
    }
  });
  if (!usuario) {
    req.flash("error", "Cuenta No Valida, Crea una nueva");
    res.redirect("/crear-cuenta");
  } else {
    usuario.activo = 1;
    await usuario.save();
    req.flash("correcto", "Tu Cuenta ya ha sido activada correctamente");
    res.redirect("/iniciar-sesion");
  }
};
