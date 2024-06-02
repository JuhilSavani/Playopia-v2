import express, { response } from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import pg from "pg";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();
const saltRound = parseInt(process.env.SALT_ROUNDS);

const pool = new pg.Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 10,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 2000,
  allowExitOnIdle: false,
});

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect(`/${req.user.username}`);
  }
  res.render("index.ejs");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render("index.ejs", {
        error: info.message,
        path: "login",
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(`/${user.username}`);
    });
  })(req, res, next);
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, saltRound);
    const result = await pool.query(
      `INSERT INTO playopia (username, email, password) VALUES ($1, $2, $3) RETURNING *;`,
      [username, email, hash]
    );
    const user = result.rows[0];
    req.logIn(user, (err) => {
      if (err) {
        console.error(err);
        return res.render("index.ejs", {
          error: "An error occurred during registration. Please try again",
          path: "register",
        });
      }
      return res.redirect(`/${username}`);
    });
  } catch (err) {
    if (err.message.includes('playopia_username_key')) {
      console.log('Username already exists');
      return res.render("index.ejs", {
        error: "Username already exists. Please choose another one.",
        path: "register",
      });
    } else if (err.message.includes('unique_email')) {
      return res.render("index.ejs", {
        error: "A User is already exists on this email ID. Please try another email ID.",
        path: "register",
      });
    }
  }
});

app.get("/:username", async (req, res) => {
  const username = req.params.username;
  if (req.isAuthenticated() && req.params.username === req.user.username) {
    res.render("index.ejs", { isLogged: true, username: username });
  } else {
    res.redirect("/");
  }
});

// Passport Setup
passport.use(
  new Strategy(async function verify(username, password, cb) {
    try {
      const result = await pool.query(
        `SELECT * FROM playopia WHERE username=$1;`,
        [username]
      );
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, isMatch) => {
          if (err) return cb(err);
          else {
            if (isMatch) return cb(null, user);
            else
              return cb(null, false, {
                message: "Please, check your password and try again",
              });
          }
        });
      } else {
        cb(null, false, {
          message: "Please check your username and try again.",
        });
      }
    } catch (err) {
      cb(err);
    }
  })
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

// Start Server
app.listen(port, () => {
  console.log(`Server listening at 'http://localhost:${port}'`);
});
