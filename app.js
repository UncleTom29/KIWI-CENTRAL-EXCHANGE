require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const hbs = require("hbs");
const logger = require("morgan");
const path = require("path");
const mongoose = require("mongoose");
const app_name = require("./package.json").name;
const dayjs = require("dayjs");
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  })
  .catch((err) => {
    console.error("Error connecting to mongo", err);
  });

const app = express();
require("./configs/session.config")(app);

// Middleware Setup
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true,
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

// default value for title local
app.locals.title = "Kiwi Exchange - The Global Digital Coin Trade & Exchange";

hbs.registerPartials(__dirname + "/views/app/partials", function (err) {});

const public = require("./routes/public.routes");
app.use("/", public);

const auth = require("./routes/auth.routes");
app.use("/auth", auth);
app.all("/app", (req, res, next) => {
  if (req.session.user && req.session.wallet) {
    return next();
  }
  res.redirect("/auth/login");
});
app.all("/app/*", (req, res, next) => {
  if (req.session.user && req.session.wallet) {
    return next();
  }
  res.redirect("/auth/login");
});
const market = require("./routes/market.routes");
app.use("/app/market", market);

const trade = require("./routes/trade.routes");
app.use("/app/trade", trade);

const wallet = require("./routes/wallet.routes");
app.use("/app/wallet", wallet);

const transactions = require("./routes/transaction.routes");
app.use("/app/transactions", transactions);

const private = require("./routes/app.routes");
app.use("/app", private);

const user = require("./routes/user.routes");
app.use("/app/user", user);

const support = require("./routes/support.routes");
app.use("/app/support", support);

const log = require("./routes/log.routes");
app.use("/app/logs", log);

const email =require("./routes/email.routes");
app.use("/email", email);

hbs.registerHelper("dateFormatDay", function (_date) {
  //return _date.toLocaleDateString('es-ES');
  return dayjs(_date).format("DD/MM/YYYY");
});

hbs.registerHelper("dateFormat", function (_date) {
  //return _date.toLocaleDateString('es-ES');
  return dayjs(_date).format("DD/MM/YYYY HH:mm");
});
hbs.registerHelper("roundNumber2", function (_number) {
  return _number.toFixed(2);
});

hbs.registerHelper("supportStatus", function (_status) {
  switch (_status) {
    case "success":
      return "success";
      break;
    default:
      return "danger";
      break;
  }
});



module.exports = app;
