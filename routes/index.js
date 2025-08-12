import express from "express";
import { WorkOS } from "@workos-inc/node";

const { WORKOS_API_KEY, WORKOS_CLIENT_ID, ORGANIZATION_ID, REDIRECT_URI, ENTRA_ORGANIZATION_ID } =
  process.env;

const workos = new WorkOS(WORKOS_API_KEY);

const router = express.Router();

const INTERVAL_MS = 30000; // 30 seconds
let cursor = undefined;

const pollEvents = async () => {

  const response = await workos.events.listEvents({
    events: [
      'dsync.activated',
      'dsync.deleted',
      'dsync.group.created',
      'dsync.group.deleted',
      'dsync.group.updated',
      'dsync.group.user_added',
      'dsync.group.user_removed',
      'dsync.user.created',
      'dsync.user.deleted',
      'dsync.user.updated',
    ],
    limit: 100,
    after: cursor
  });

  if (response.listMetadata && response.listMetadata.after) {
    cursor = response.listMetadata.after;
  }

  // console.log("EVENTS DATA HERE", response.data)
}

setInterval(pollEvents, INTERVAL_MS);

router.post("/login", async (req, res, next) => {
  const email = req.body.email?.toLowerCase();
  const method = req.body.login_method;

  console.log("in login route", email, method);

  const params = {
    clientId: WORKOS_CLIENT_ID,
    redirectURI: REDIRECT_URI,
  };

  if (email?.endsWith("@workos.com")) {
    params.organization = ORGANIZATION_ID; // org_xxx for Okta
  } else if (email?.endsWith("@workos781.onmicrosoft.com")) {
    params.organization = ENTRA_ORGANIZATION_ID; // org_xxx for Entra
  } else {
    return res
      .status(400)
      .render("error.ejs", { error: "Unsupported domain for SSO login." });
  }

  try {
    // console.log("in login route", params);
    const url = workos.sso.getAuthorizationUrl(params);
    res.redirect(url);
  } catch (e) {
    next(e);
  }
});

router.get("/callback", async (req, res, next) => {
  const { code, error } = req.query;
  console.log(code, "code here")

  if (error) return res.status(400).render("error.ejs", { error });

  try {
    const { profile } = await workos.sso.getProfileAndToken({
      code,
      clientId: WORKOS_CLIENT_ID,
    });
    console.log("profile", profile);

    if (
      profile.organizationId !== ENTRA_ORGANIZATION_ID &&
      profile.organizationId !== ORGANIZATION_ID
    ) {
      return res
        .status(401)
        .render("error.ejs", { error: "Not in your Okta org." });
    }

    req.session.user = {
      firstName: profile.firstName,
      lastName: profile.lastName,
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
    // const { data: entra_users } = await workos.directorySync.listUsers({
    //   directory: process.env.ENTRA_DIRECTORY_ID,
    // });
    // console.log("users", entra_users);

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
