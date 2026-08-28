# JsonBank NodeJs SDK

The official repository for [jsonbank.io](https://jsonbank.io) Javascript SDK.
##### STAGE: (RFC)

## Installation
```shell
npm i jsonbank
# OR YARN
yarn add jsonbank
```

## Usage
```javascript
const {JsonBank} = require("jsonbank")

// Initialize with Api keys.
const jsb = new JsonBank({
  keys: {
    pub: 'JSB_PUBLIC_KEY',
    prv: 'JSB_PRIVATE_KEY',
  }
});

// Get json content of a public file.
await jsb.getContent("public/my.json");

// Get json content of a private file
await jsb.getOwnContent("private/my.json");

// Get a json file from github.
await jsb.getGithubContent("github_username/repo/path/to/my.json");

// Update content of a json file.
await jsb.updateContent('private/numbers.json', {
  // new data...
})
```


## Testing
Create an .env file in the root of the project and add the following variables

```dotenv
JSB_HOST="https://api.jsonbank.io"
JSB_TIMEOUT=30000
JSB_PUBLIC_KEY="your public key"
JSB_PRIVATE_KEY="your private key"
```

Then run the test command below.

```bash
npm run test
```
