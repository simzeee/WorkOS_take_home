import express from "express";
import "dotenv/config";
import session from "express-session";
import router from "./routes/index.js";
import morgan from "morgan";

const app = express();
const port = process.env.PORT || 8000;

app.use("/public", express.static("public"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === "production" },
  })
);

app.use(morgan("dev"));

app.use("/", router);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).render("error.ejs", { error: err.message });
});

app.listen(port, () => {
  console.log(`⚡️ [server]: Server is running at http://localhost:${port}`);
});
