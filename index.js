const express = require('express');
const hb = require('express-handlebars');
const db = require('./database');

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

app.post(("/signed-petition"),
    (req, res) => {
        let { firstName, lastName, signature } = req.body
        if (!firstName || !lastName || !signature) {
            res.render("home", {
                title: "Awesome life petition",
                description: "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff",
                error: "Please fill out all fields"
            })
        } else {
            db.addSignature(firstName, lastName, signature)
                .then(() => console.log("worked"))
                .catch(error => console.log(error))
        }
    })


app.listen(8080)