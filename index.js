import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const usersFile = "users.csv";

// Load users from CSV file
let users = [];
fs.readFile(usersFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading CSV:", err);
  } else {
    const rows = data.trim().split("\n");
    rows.forEach((row) => {
      const [uid, username, email, password] = row.split(",");
      users.push({ uid, username, email, password });
    });
  }
});

// Middleware
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!user) {
    console.error("Error: User not found");
    return res.render("index.ejs", {
      error: "Please check your username and try again.",
      path: "login",
    });
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      console.error("Error comparing passwords:", err);
      return res.render("index.ejs", {
        error: "An error occurred. Please try again later.",
        path: "login",
      });
    }
    if (result) {
      console.log("Login successful");
      res.redirect(`/dashboard?username=${username}&uid=${user.uid}`);
    } else {
      console.error("Error: Incorrect password");
      res.render("index.ejs", {
        error: "Please check your password and try again.",
        path: "login",
      });
    }
  });
});

app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const isExist = users.some((u) => u.username === username);
    if (isExist) {
      console.error("Error: User already exists with this username.");
      return res.render("index.ejs", {
        error: "User already exists with this username.",
        path: "register",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      uid: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
    };
    users.push(newUser);
    const userRecord = `${newUser.uid},${username},${email},${hashedPassword}\n`;
    fs.appendFile(usersFile, userRecord, (err) => {
      if (err) {
        console.error("Error appending to CSV:", err);
      }
    });
    console.log("Registration successful");
    res.redirect(`/dashboard?username=${username}&uid=${newUser.uid}`);
  } catch (error) {
    console.error("Error: Registration Failed!", error);
    res.render("index.ejs", {
      error: "Registration failed. Please try again.",
      path: "register",
    });
  }
});

app.get("/dashboard", (req, res) => {
  const { username, uid } = req.query;
  const isExist = users.some((u) => u.username === username && u.uid === uid);
  if (isExist) {
    return res.render("index.ejs", { isLogged: true, username });
  } else {
    console.error("Error: User not found");
    return res.redirect("/");
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server listening at 'http://localhost:${port}'`);
});
