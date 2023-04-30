if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const initializePassport = require("./passport-config");
const { name } = require("ejs");
initializePassport(
  passport,
  (email) => users.find((user) => user.email === email),
  (id) => users.find((user) => user.id === id)
);

const users = [];

app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));

app.get("/", checkAuthenticated, (req, res) => {
  res.render("index.ejs", { name: req.user.name });
});

app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs");
});

// var dbid, dbname, dbemail, dbpassword;

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
    });
    // var dbid = users.id;
    // var dbname = users.name;
    // var dbemail = users.email;
    // var dbpassword = users.password;
    res.redirect("/login");
  } catch {
    res.redirect("/register");
  }
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
});

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

//----------------------------------------------------------------CONNECT TO MONGODB

// import { MongoClient } from "mongodb";
const MongoClient = require("mongodb").MongoClient;

// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  "mongodb+srv://example430:example430@cluster1.mox83lz.mongodb.net/?retryWrites=true&w=majority";

const client = new MongoClient(uri);

// app.get("/register", (req, res) => {
  async function run() {
    try {
      const database = client.db("insertDB");
      const account = database.collection("account");
      // create a document to insert
      // app.get("/register",(req,res) => {
      //   var name = req.body.name;
      //   var email = req.body.email;
      //   var password = req.body.passport;
      // })
      const doc = {
        id:"default",
        name:"default",
        email:"default",
        password:"default",
        title: "Record of a Shriveled Datum",
        content: "No bytes, no problem. Just insert a document, in MongoDB",
      };
      doc.id = users.id;
      doc.name = users.name;
      doc.email = users.email;
      doc.password = users.password;
      console.log(users)
      const result = await account.insertOne(doc);

      console.log(`A document was inserted with the _id: ${result.insertedId}`);
    } finally {
      await client.close();
    }
  }
  run().catch(console.dir);
// });

app.listen(3000);
