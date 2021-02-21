const express = require("express");
const hb = require("express-handlebars");
const db = require("./database");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("./bcrypt");
const app = express();

app.use(express.urlencoded());

app.use(express.static("public"));
app.engine("handlebars", hb());

app.set("view engine", "handlebars");
app.use(
  cookieSession({
    maxAge: 1000 * 60 * 60 * 24 * 30,
    secret: "hjgjkgbjkhgjgjhbjhkbh",
  })
);
app.use(csurf(undefined));
app.use((request, response, next) => {
  response.locals.csrfToken = request.csrfToken();
  next();
});
app.get("/", (req, res) => {
  res.render("home", {
    title: "Awesome life petition",
    description:
      "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff",
  });
});

app.get("/thank-you", (req, res) => {
  console.log(req.session.userID);
  db.getSignatures(req.session.userID)
    .catch((error) => console.log(error))
    .then((signature) => {
      console.log(signature);
      res.render("thank-you", {
        title: "Thank you for signing our Petition!",
        ListOfSigners: "/signers-list",
        /*firstname: signature.rows[0].firstname,
          lastname: signature.rows[0].lastname,*/
        signature: signature.rows[0].signature,
      });
    });
});

app.get("/signers-list", (req, res) => {
  db.getSigners().then((signers) => {
    res.render("signer-list", {
      title: "Awesome life petition signers",
      signer: signers.rows,
    });
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    linkToLogin: "/login",
  });
});
app.get("/login", (req, res) => {
  res.render("login", {
    linkToRegister: "/register",
  });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("login", {
      error: "Please fill out both fields",
    });
  } else {
    db.getUser(email).then((user) => {
      const currentUser = user.rows;
      if (currentUser.length === 0) {
        res.render("login", {
          error: "Please try again! Email or password are incorrect.",
        });
      } else {
        const hashedpassword = currentUser[0].hashedpassword;
        bcrypt.compare(password, hashedpassword).then((result) => {
          if (!result) {
            return res.render("login", {
              error: "Please try again! Email or password are incorrect.",
            });
          } else {
            res.redirect(302, "/");
          }
        });
      }
    });
  }
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  console.log(!firstname || !lastname || !email || !password);
  if (firstname && lastname && email && password) {
    bcrypt.genHash(password).then((hashedpassword) => {
      db.addUser(firstname, lastname, email, hashedpassword);
      req.session.firstname = firstname;
      req.session.lastname = lastname;
      req.session.email = email;
      req.session.hash = hashedpassword;
      console.log(req.session);
    });
    res.redirect(302, "/");
  } else {
    console.log("something went wrong with the input");
  }
});

app.post("/signed-petition", (req, res) => {
  let { signature } = req.body;
  if (!signature) {
    res.render("home", {
      title: "Awesome life petition",
      description:
        "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff",
      error: "Please fill out all fields",
    });
  } else {
    res.cookie("signed", true);
    db.addSignature(signature)
      .then((user) => {
        req.session.userID = user.rows[0].id;
        console.log(req.session);
        res.redirect("/thank-you");
      })
      .catch((error) => console.log(error));
  }
});

app.listen(8080);
