const express = require("express");
require("dotenv").config()
const routes = require("./routes");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");

const helpers = require("./helpers");

const db = require("./config/db");

require("./models/Proyectos");
require("./models/Tareas");
require("./models/Usuarios");

db.sync()
  .then(() => console.log("Base de Datos Conectada"))
  .catch(error => console.log("Error en la db::", error));

const app = express();

app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "pug");

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: "supersecreto",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  res.locals.vardump = helpers.vardump;
  res.locals.mensajes = req.flash();
  res.locals.usuario = { ...req.user } || null;
  next();
});

app.use("/", routes());

app.listen(process.env.SERVER_PORT);
