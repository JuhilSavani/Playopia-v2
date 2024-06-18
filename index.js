import express from "express";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import pg from "pg";
import session from "express-session";
import pgSession from "connect-pg-simple";
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
  max: 5,
  connectionTimeoutMillis: 2000,
  idleTimeoutMillis: 2000,
});

// Middlewares
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const PgSession = pgSession(session);

app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: 'session'
    }),
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

// first implementation
// app.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user) => {
//     if (err) {
//       return res.render("index.ejs", {
//         error: err.message,
//         path: "login",
//       });
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return next(err);
//       }
//       return res.redirect(`/${user.username}`);
//     });
//   })(req, res, next);
// });

// second implementation
const authLocal = passport.authenticate("local");
app.post("/login", (req, res, next) => {
  authLocal(req, res, (err)=>{
    const user = req.user;
    if (!user) {
      return res.render("index.ejs", {
        error: err.message,
        path: "login",
      });
    }
    req.logIn(user, (err) => {
      if (err){
        console.error(err.stack);
        return res.render("index.ejs", {
          error: "An error occurred during login. Please try again",
          path: "login",
        });
      }
      return res.redirect(`/${user.username}`);
    });
  });
});

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const response = await pool.query(
      `SELECT id FROM playopia WHERE username = $1 OR email = $2`,
      [username, email]
    );
    if (response.rows.length) {
      // user already exist with entered username or email
      return res.render("index.ejs", {
        error: "Try again with a different username or email.",
        path: "register",
      });
    }else{
      // user is unique
      const hash = await bcrypt.hash(password, saltRound);
      const result = await pool.query(
        `INSERT INTO playopia (username, email, password) VALUES ($1, $2, $3) RETURNING *;`,
        [username, email, hash]
      );
      const user = result.rows[0];
      req.logIn(user, (err) => {
        if (err) {
          console.error(err.stack);
          return res.render("index.ejs", {
            error: "An error occurred during registration. Please try again",
            path: "register",
          });
        }
        return res.redirect(`/${username}`);
      });
    }
  } catch (err) {
    
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
          if (err) return cb(err, false);
          else {
            if (isMatch) return cb(null, user);
            else
              return cb(new Error("Please, check your password and try again"), false);
          }
        });
      } else {
        cb(new Error("Please check your username and try again."), false);
      }
    } catch (err) {
      cb(err, false);
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

// Deleting the expired session on each 20 min
setInterval(async () => {
  try {
    await pool.query("DELETE FROM session WHERE expire < NOW()");
    console.log("Expired sessions deleted successfully.");
  } catch (err) {
    console.error("Error deleting expired sessions:", err);
  }
}, 20 * 60 * 1000);

// Closing the pool properly
const gracefulShutdown = () => {
  pool.end(() => {
    console.log('Pool has ended');
    process.exit(0);
  });
};

process.on('exit', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  gracefulShutdown();
});