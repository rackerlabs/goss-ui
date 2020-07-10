# goss-ui

Micro UI for Guest Operating System Services. 

Local: https://local.dev.manage.rackspace.com:3000  
Dev: https://dev.manage.rackspace.com/goss  
Prod: https://manage.rackspace.com/goss

## System Requirements

- [nvm](https://github.com/nvm-sh/nvm) (Recommended)
- [Node v10.16.*](https://nodejs.org/en/download/)
- [Yarn v1.13.*](https://yarnpkg.com/en/docs/install)

## Getting Started

Local development requires that you add an `/etc/hosts` entry that points local.dev.manage.rackspace.com to localhost. This allows your local development environment to share session cookies with dev.manage.rackspace.com. This step only needs to be performed once:

```bash
$ echo "127.0.0.1        local.dev.manage.rackspace.com" | sudo tee -a /etc/hosts
```

Run the following commands to initialize your local development environment:

```bash
$ nvm use # (Optional) Switch to the correct node version if using nvm.
$ yarn install # Install dependencies
$ yarn start # Run local development server
```

## Running Tests

### Unit Tests

Run tests with `yarn test`. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### Integration Tests

Integration tests are built with [jest](https://jestjs.io) and [puppeteer](https://pptr.dev). Run tests using the following commands:

```bash
$ scripts/integration https://localhost:3000 # Run tests against local server.
$ scripts/integration https://dev.manage.rackspace.com/goss # Run tests against master branch in development environment.
$ scripts/integration https://dev.manage.rackspace.com/goss-<sha> # Run tests against a specific SHA in the development environment.
$ scripts/integration https://manage.rackspace.com/goss # Run tests against production environment.
$ HEADLESS=false scripts/integration https://dev.manage.rackspace.com/goss # Open a real browser instead of running in headless mode.
```

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br>
Open [https://local.dev.manage.rackspace.com:3000/racker](https://local.dev.manage.rackspace.com:3000/racker) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

#### Troubleshooting

- If you get a security warning, check the box to proceed (Firefox) or type "thisisunsafe" if you're using Chrome.
- If you see a page saying "Forbidden" make sure you're connected to the VPN.

### `yarn test`

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn format`

Runs the `prettier --write` command to correct and update formatting issues within the code base.

### `yarn format-check`

Runs the `prettier --check` to validate that the code base complies with the current configuration settings. This is tied into the CircleCi build such that it fails if the submission does not comply.