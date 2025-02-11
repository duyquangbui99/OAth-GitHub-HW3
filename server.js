require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;

const app = express();

// Session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

// Home Page (Login)
app.get("/", (req, res) => {
    res.send(`
        <html>
            <head>
                <title>GitHub OAuth</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        margin: 50px;
                        background-color: #f4f4f4;
                    }
                    h1 {
                        color: #333;
                    }
                    .btn {
                        display: inline-block;
                        padding: 12px 20px;
                        font-size: 18px;
                        color: white;
                        background-color: #24292e;
                        text-decoration: none;
                        border-radius: 6px;
                        transition: background 0.3s ease-in-out;
                    }
                    .btn:hover {
                        background-color: #0366d6;
                    }
                </style>
            </head>
            <body>
                <h1>GitHub OAuth Authentication</h1>
                <a class="btn" href="/auth/github">Login with GitHub</a>
            </body>
        </html>
    `);
});

// GitHub Authentication Route
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub Callback Route
app.get("/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/dashboard");
    }
);

// Dashboard with Modern Styling
app.get("/dashboard", (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect("/");
    }

    res.send(`
        <html>
            <head>
                <title>Dashboard</title>
                <style>
                    body {
                        font-family: 'Arial', sans-serif;
                        background-color: #f0f2f5;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                    }
                    .container {
                        background: white;
                        padding: 30px;
                        border-radius: 12px;
                        box-shadow: 0px 4px 10px rgba(0,0,0,0.1);
                        text-align: center;
                        width: 400px;
                    }
                    .profile-img {
                        width: 100px;
                        height: 100px;
                        border-radius: 50%;
                        margin-bottom: 15px;
                    }
                    h1 {
                        font-size: 24px;
                        margin: 10px 0;
                        color: #333;
                    }
                    p {
                        font-size: 16px;
                        margin: 8px 0;
                        color: #555;
                    }
                    a {
                        color: #0366d6;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                    .logout-btn {
                        display: inline-block;
                        margin-top: 20px;
                        padding: 12px 20px;
                        background-color: #d73a49;
                        color: white;
                        border-radius: 6px;
                        text-decoration: none;
                        font-weight: bold;
                        transition: background 0.3s ease-in-out;
                    }
                    .logout-btn:hover {
                        background-color: #c62828;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <img class="profile-img" src="${req.user.photos ? req.user.photos[0].value : 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'}" alt="Profile Picture">
                    <h1>Welcome, ${req.user.displayName || req.user.username}!</h1>
                    <p><strong>GitHub Username:</strong> ${req.user.username}</p>
                    <p><strong>GitHub Profile:</strong> <a href="${req.user.profileUrl}" target="_blank">${req.user.profileUrl}</a></p>
                    <p><strong>Email:</strong> ${(req.user.emails && req.user.emails[0]) ? req.user.emails[0].value : "Not Available"}</p>
                    <a class="logout-btn" href="/logout">Logout</a>
                </div>
            </body>
        </html>
    `);
});

// Logout Route
app.get("/logout", (req, res) => {
    req.logout(() => {
        res.redirect("/");
    });
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
