import express from "express";
import session from "express-session";
import { WorkOS } from "@workos-inc/node";

const app = express();
const router = express.Router();
const workos = new WorkOS(process.env.WORKOS_API_KEY);
const clientID = process.env.WORKOS_CLIENT_ID;
const organizationID = process.env.ORGANIZATION_ID;
const redirectURI = "http://localhost:8000/callback";
const state = "";

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
  })
);

router.get("/", function (req, res) {
  if (session.isloggedin) {
    console.log("SESSION HERE", session);
    res.render("login_successful.ejs", {
      profile: session.profile,
      first_name: session.first_name,
      last_name: session.last_name,
    });
  } else {
    res.render("index.ejs", { title: "Home" });
  }
});

router.get("/directory", async (req, res, next) => {
  try {
    // fetch *all* users in the directory
    const { data: users } = await workos.directorySync.listUsers({
      directory: process.env.DIRECTORY_ID,
    });

    // render a view called "directory.ejs" and pass the users array
    console.log("users", users);
    res.render("directory.ejs", { users });
  } catch (error) {
    next(error);
  }
});

router.post("/login", (req, res) => {
  const login_type = req.body.login_method;
  console.log("login type", login_type);

  const params = {
    clientID: clientID,
    redirectURI: redirectURI,
    organization: process.env.ORGANIZATION_ID,
    state: state,
  };

  if (login_type === "saml") {
    params.organization = organizationID;
  } else {
    params.provider = login_type;
  }

  try {
    const url = workos.sso.getAuthorizationURL(params);

    res.redirect(url);
  } catch (error) {
    res.render("error.ejs", { error: error });
  }
});

router.get("/callback", async (req, res) => {
  let errorMessage;
  try {
    const { code, error } = req.query;

    if (error) {
      errorMessage = `Redirect callback error: ${error}`;
    } else {
      const profile = await workos.sso.getProfileAndToken({
        code,
        clientID,
      });
      const json_profile = JSON.stringify(profile, null, 4);

      const checkID = "org_01JZ0V6JQEKWNRMGJF2F52704G";

      if (profile.profile.organization_id !== checkID) {
        return res.status(401).send({
          message: "Unauthorized",
        });
      }

      session.first_name = profile.profile.first_name;
      session.last_name = profile.profile.last_name;
      session.profile = json_profile;
      session.isloggedin = true;
    }
  } catch (error) {
    errorMessage = `Error exchanging code for profile: ${error}`;
  }

  if (errorMessage) {
    res.render("error.ejs", { error: errorMessage });
  } else {
    res.redirect("/");
  }
});

router.get("/logout", async (req, res) => {
  try {
    session.first_name = null;
    session.profile = null;
    session.isloggedin = null;

    res.redirect("/");
  } catch (error) {
    res.render("error.ejs", { error: error });
  }
});

export default router;
