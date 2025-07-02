import express from "express";
import { WorkOS } from "@workos-inc/node";

const { WORKOS_API_KEY, WORKOS_CLIENT_ID, ORGANIZATION_ID, REDIRECT_URI } =
  process.env;

const workos = new WorkOS(WORKOS_API_KEY);

const router = express.Router();

router.post("/login", async (req, res, next) => {
  const method = req.body.login_method;

  const params = {
    clientID: WORKOS_CLIENT_ID,
    redirectURI: REDIRECT_URI,
  };

  if (method === "saml") params.organization = ORGANIZATION_ID;
  else params.provider = method;

  try {
    const url = workos.sso.getAuthorizationURL(params);
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

router.get("/callback", async (req, res, next) => {
  const { code, error } = req.query;

  if (error) return res.status(400).render("error.ejs", { error });

  try {
    const { profile } = await workos.sso.getProfileAndToken({
      code,
      clientID: WORKOS_CLIENT_ID,
    });

    if (
      profile.organization_id &&
      profile.organization_id !== ORGANIZATION_ID
    ) {
      return res
        .status(401)
        .render("error.ejs", { error: "Not in your Okta org." });
    }

    req.session.user = {
      firstName: profile.first_name,
      lastName: profile.last_name,
      email: profile.email,
    };
    req.session.isLoggedIn = true;

    res.redirect("/");
  } catch (e) {
    next(e);
  }
});

router.get("/", function (req, res, next) {
  if (req.session.isLoggedIn) {
    res.render("login_successful.ejs", {
      first_name: req.session.user.firstName,
      last_name: req.session.user.lastName,
    });
  } else {
    res.render("index.ejs");
  }
});

function ensureLoggedIn(req, res, next) {
  if (req.session.isLoggedIn) return next();
  res.redirect("/");
}

router.get("/directory", ensureLoggedIn, async (req, res, next) => {
  try {
    // fetch *all* users in the directory
    const { data: users } = await workos.directorySync.listUsers({
      directory: process.env.DIRECTORY_ID,
    });

    // render a view called "directory.ejs" and pass the users array
    res.render("directory.ejs", { users });
  } catch (error) {
    next(error);
  }
});

router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

export default router;
