const express = require('express');
const hb = require('express-handlebars');

const app = express();

app.engine("handlebars", hb())
app.set("view engine", "handlebars")

app.use(express.urlencode())
app.use(express.static("public"))


app.get(("/"),
    (req, res) => {
        res.render("home")
    })


app.listen(8080)