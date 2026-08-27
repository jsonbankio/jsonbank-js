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

### Listing

List what's inside a project, one level deep. All three take a project slug and an optional
params object. Pass `folder` (a folder id or its path) to list inside a folder instead of the
project root.

```javascript
// Documents and folders together. The two lists paginate independently.
const {project, documents, folders} = await jsb.scanProject("my-project");

// Scoped to a folder, by path or by id.
await jsb.scanProject("my-project", {folder: "locales"});

// Only one of the lists, so nothing you don't need is queried or paged.
await jsb.listDocuments("my-project", {page: 2, perPage: 50});
await jsb.listFolders("my-project", {sort: "createdAt", order: "desc"});
```

`sort` is one of `name` (default), `createdAt` or `updatedAt`, and `order` is `asc` (default) or
`desc`. `perPage` defaults to 100 and goes up to 1000.

Each list is a page of results, so walk `meta.lastPage` to get everything:

```javascript
let page = 1, lastPage = 1;

do {
  const {documents} = await jsb.listDocuments("my-project", {page, perPage: 1000});
  lastPage = documents.meta.lastPage;

  for (const doc of documents.data) {
    // documents are metadata only, fetch content separately
    console.log(doc.path, doc.contentSize.string);
  }
} while (page++ < lastPage);
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
