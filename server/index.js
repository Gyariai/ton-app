const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const db = require("./lib/db")
const botInit = require("./bot/init")

const config = require("./config.json")

const app = express();
app.use(express.json({ extended: false, limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));
app.use(morgan("dev"));
app.use(cors());
app.use(express.static('public'));

db.initDB()
botInit.init()

const multer = require('multer')
const upload = multer()

const api = require("./api/ton")
const update = require("./api/update")

app.post('/dataitem', upload.none(), api.dataitem);
app.get('/update', upload.none(), update.call);

const bot = require("./bot/data")
app.post('/data', upload.none(), bot.data);

app.listen(config.port, () => {
    console.log(`Server listening on port http://localhost:${config.port}/`);
});