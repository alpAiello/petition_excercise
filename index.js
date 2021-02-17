const express = require('express');
const hb = require('express-handlebars');

const app = express();

app.use(express.urlencoded())
app.use(express.static("public"))

app.engine("handlebars", hb())
app.set("view engine", "handlebars")


app.get(("/"),
    (req, res) => {
        res.render("home", {
            title: "Awesome life petition",
            description: "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff"
        })
    })


app.listen(8080)