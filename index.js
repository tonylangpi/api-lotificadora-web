const express = require('express');
const morgan = require('morgan');
const rutas = require("./Routes/index");
const cors = require('cors'); 
const { config } = require("dotenv");
const app = express();
app.use(express.json());


app.use(express.json());
app.use(morgan("dev"));
app.use(cors());
config();

app.use((req, res, next) => {
  const apiKey = req.header("apiKey");
  if (apiKey !== process.env.API_KEY) {
    res.status(401).send("NO TIENES ACCESO A MI API PERRO...");
  } else {
    next();
  }
});

app.use("/", rutas);

app.listen(process.env.PORT, () => {
        console.log(' 🚀 El servidor ha despegado en el puerto ', process.env.PORT);
      });