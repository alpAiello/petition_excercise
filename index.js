const express = require('express');
const hb = require('express-handlebars');
const db = require('./database');
const cookieSession = require("cookie-session")
const csurf = require("csurf")

const app = express();

app.use(express.urlencoded())
app.use(express.static("public"))

app.engine("handlebars", hb())
app.set("view engine", "handlebars")
app.use(
    cookieSession({
        maxAge: 1000 * 60 * 60 * 24 * 30,
        secret: "sdkfjhjfdkxsrt,eukgio34i87",
    })
);
app.use(csurf());

app.use((request, response, next) => {
    response.locals.csrfToken = request.csrfToken();
    next();
});

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
            res.cookie("signed", true)
            db.addSignature(firstName, lastName, signature)
                .then((user) => {
                    req.session.userID = user.rows[0].id
                    console.log(req.session)
                    res.redirect("/thank-you")
                })
                .catch(error => console.log(error))
        }
    })
app.get("/thank-you",
    (req, res) => {
        console.log(req.session.userID)
        db.getSignatures(req.session.userID)
            .catch(error => console.log(error))
            .then((signature) => {
                console.log(signature)
                res.render("thank-you", {
                    title: "Thank you for signing our Petition!",
                    /*firstname: signature.rows[0].firstname,
                    lastname: signature.rows[0].lastname,*/
                    signature: signature.rows[0].signature
                })
            })
    })

app.get("/signers-list", (req, res) => {
    db.getSigners()
        .then(signers => {
                res.render("signer-list", {
                    title: "Awesome life petition signers",
                    signer: signers.rows
                })
            }

        )
})


app.listen(8080)