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
  if (request.session.userID) {
    response.locals.login = true;
  } else {
    response.locals.login = false;
  }
  next();
});

app.get("/", (req, res) => {
  res.redirect(302, "/register");
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
  db.getSignature(req.session.userID)
    .then((signature) => {
      console.log(signature.rows.length);
      if (signature.rows.length == 0) {
        res.render("sign-petition", {
          title: "Awesome life petition",
          description:
            "We want everyone to have a awesome life and enjoy the insanity of beeing alive in a good way. Please sign so we can go on with stuff",
        });
      } else {
        res.redirect(302, "/thank-you");
      }
    })
    .catch((error) => console.log(error));
});

app.get("/thank-you", (req, res) => {
  db.getSignature(req.session.userID)
    .catch((error) => console.log(error))
    .then((signature) => {
      res.render("thank-you", {
        title: "Thank you for signing our Petition!",
        ListOfSigners: "/signers-list",
        signature: signature.rows[0].signature,
      });
    });
});

app.get("/signers-list", (req, res) => {
  db.getSigners().then((signers) => {
    console.log(signers.rows);
    res.render("signers-list", {
      title: "Awesome life petition signers",
      signer: signers.rows,
    });
  });
});

app.get("/update-user-data", (req, res) => {
  Promise.all([
    db.getUser(req.session.userID),
    db.getProfile(req.session.userID),
  ]).then((userData) => {
    const { firstname, lastname, email } = userData[0].rows[0];
    const { age, city, homepage } = userData[1].rows[0] || "";
    res.render("update-user-data", {
      firstname: firstname,
      lastname: lastname,
      email: email,
      age: age,
      city: city,
      homepage: homepage,
    });
  });
});

app.post("/update-user-data", (req, res) => {
  if (!req.session.userID) {
    res.redirect(302, "/login");
  } else {
    const {
      firstname,
      lastname,
      email,
      password,
      age,
      city,
      homepage,
    } = req.body;
    console.log("-> req.body", req.body);
    console.log("-> password", password);
    let updatePasswordPromise;
    if (password) {
      updatePasswordPromise = bcrypt
        .genHash(password)
        .then((hashedPassword) => {
          return db.updatePassword(req.session.userID, hashedPassword);
        });
    }
    Promise.all([
      db.updateUser(req.session.userID, firstname, lastname, email),
      updatePasswordPromise,
      db.upsertProfile(req.session.userID, age, city, homepage),
    ]).then((newUserData) => {
      const { firstname, lastname, email } = newUserData[0].rows[0];
      const { age, city, homepage } = newUserData[2].rows[0];
      req.session.firstname = firstname;
      req.session.lastname = lastname;
      req.session.email = email;
      req.session.age = age;
      req.session.city = city;
      req.session.homepage = homepage;
      res.redirect(302, "/update-user-data");
    });
  }
});

app.post("/register", (req, res) => {
  const { firstname, lastname, email, password } = req.body;
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

  const userID = req.session.userID;
  db.upsertProfile(userID, age, city, homepage)
    .catch((error) =>
      res.render("profile", {
        error: error,
      })
    )
    .then((profile) => {
      req.session = { ...req.session, ...profile.rows[0] };
      res.redirect(302, "/sign-petition");
    });
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("login", {
      error: "Please fill out both fields",
    });
  } else {
    db.getUserByEmail(email).then((user) => {
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

app.post("/unsign-petition", (req, res) => {
  db.deleteSignature(req.session.userID).then(() => {
    res.redirect(302, "/sign-petition");
  });
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/login");
});
app.listen(process.env.PORT || 8080);
