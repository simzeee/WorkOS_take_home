# WorkOS SSO & Directory Demo

A Node.js/Express application demonstrating how to:

1. Authenticate users via **Okta SAML**, **Google OAuth** and **Microsoft OAuth** using [WorkOS SSO](https://workos.com/docs/sso).
2. Fetch and display a list of SCIM-provisioned users from an Okta directory using [WorkOS Directory Sync](https://workos.com/docs/directory-sync).

---

## Prerequisites

- **Node.js** v14+ and **npm**
- **Git** (to clone the repo)

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-org/workos-sso-directory-demo.git
cd workos-sso-directory-demo
npm install
```

### 2. Add .env

- Add a .env file in the root directory and copy over the variables and values sent in the email (Alexander or Betsy should have them!)

These are the required variables:

# example .env

```bash
WORKOS_CLIENT_ID=your-workos-client-id
WORKOS_API_KEY=sk_test_…
ORGANIZATION_ID=org_…
DIRECTORY_ID=directory_…
SESSION_SECRET=some-long-random-string
REDIRECT_URI=http://localhost:8000/callback
NODE_ENV=development
```

### 3. Run the app

```bash
npm run start
```

### Screen Recordings

- [Successful Login](./recordings/login_test_successful.mov)  
- [Unsuccessful Login outside of Okta Tenant](./recordings/login_test_not_assigned.mov)  
