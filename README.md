# WorkOS SSO & Directory Demo

A Node.js/Express application demonstrating how to:

1. Authenticate users via **Okta SAML**, **Google OAuth** and **Microsoft OAuth** using [WorkOS SSO](https://workos.com/docs/sso).
2. Fetch and display a list of SCIM-provisioned users from an Okta directory using [WorkOS Directory Sync](https://workos.com/docs/directory-sync).

---

## Prerequisites

- **Node.js** v14+ and **npm** (or **yarn**)  
- A free [Okta Developer](https://developer.okta.com/signup/) tenant  
  - An **Enterprise SAML** app configured and assigned to at least one test user  
- A [WorkOS](https://workos.com/) account with:
  - An **SSO Connection** for Okta (SAML), Google OAuth & Microsoft OAuth  
  - A **Directory** that’s SCIM-provisioned from your Okta org  
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

- Add a .env file in your root directory and copy over the variables and values sent in the email (Alexander or Betsy should have them!)

### 3. Run the app

```bash
npm run start
```