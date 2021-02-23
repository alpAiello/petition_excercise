const express = require("express");
const exhb = require("express-handlebars");
const db = require("./database");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const bcrypt = require("./bcrypt");
const app = express();

function logSession(req, res, next) {
  next();
}

app.use(express.urlencoded());
app.use(express.static("public"));

app.engine("handlebars", exhb());
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
  if (request.session.firstname && request.session.lastname) {
    response.locals.showUser =
      request.session.firstname + " " + request.session.lastname;
  }
  console.log(request.session);
  next();
});

app.get("/register", (req, res) => {
  res.render("register", {
    linkToLogin: "/login",
  });
});

app.get("/profile", (req, res) => {
  res.render("profile", {});
});

app.get("/login", (req, res) => {
  res.render("login", {
    linkToRegister: "/register",
  });
});

app.get("/sign-petition", (req, res) => {
  res.render("sign-petition", {
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
      console.log(signature.rows[0]);
      res.render("thank-you", {
        title: "Thank you for signing our Petition!",
        ListOfSigners: "/signers-list",
        signature: signature.rows[0].signature,
      });
    });
});

app.get("/signers-list", (req, res) => {
  db.getSigners().then((signers) => {
    console.log(signers);
    res.render("signers-list", {
      title: "Awesome life petition signers",
      signer: signers.rows,
    });
  });
});

app.get("/update-user-data", (req, res) => {
  res.render("update-user-data");
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  console.log(!firstname || !lastname || !email || !password);
  if (firstname && lastname && email && password) {
    bcrypt.genHash(password).then((hashedpassword) => {
      db.addUser(firstname, lastname, email, hashedpassword).then((results) => {
        req.session.userID = results.rows[0].id;
        req.session.firstname = firstname;
        req.session.lastname = lastname;
        req.session.email = email;
        req.session.hash = hashedpassword;
        res.redirect(302, "/profile");
      });
    });
  } else {
    console.log("something went wrong with the input");
  }
});

app.post("/profile", (req, res) => {
  const { age, city, homepage } = req.body;
  if (age && city && homepage) {
    const userID = req.session.userID;
    db.addProfile(age, city, homepage, userID)
      .catch((error) =>
        res.render("profile", {
          error: error,
        })
      )
      .then((profile) => {
        req.session = { ...req.session, ...profile.rows[0] };
        res.redirect(302, "/sign-petition");
      });
  } else {
    res.render("profile", {
      error: "please fill out all fields",
    });
  }
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
            req.session.userID = currentUser[0].id;
            req.session.firstname = currentUser[0].firstname;
            req.session.lastname = currentUser[0].lastname;
            res.redirect(302, "/sign-petition");
          }
        });
      }
    });
  }
});

app.post("/sign-petition", (req, res) => {
  let { signature } = req.body;
  if (!signature) {
    res.render("home", {
      title: "Awesome life petition",
      description:
        "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff",
      error: "Please fill out the signature field",
    });
  } else {
    res.cookie("signed", true);
    db.addSignature(signature, req.session.userID)
      .then((user) => {
        res.redirect("/thank-you");
      })
      .catch((error) => console.log(error));
  }
});

app.listen(8080);
