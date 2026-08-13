# sql-nodejs

[![Tests](https://github.com/Megapixel99/sqlJS/actions/workflows/test.yml/badge.svg)](https://github.com/Megapixel99/sqlJS/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/sql-nodejs.svg)](https://www.npmjs.com/package/sql-nodejs)
[![npm downloads](https://img.shields.io/npm/dm/sql-nodejs.svg)](https://www.npmjs.com/package/sql-nodejs)
[![license](https://img.shields.io/npm/l/sql-nodejs.svg)](LICENSE)

An **in-memory SQL database written from scratch in JavaScript** — a hand-written
SQL parser and storage engine with **zero dependencies**. You give it SQL strings;
it creates databases and tables, stores rows, and answers `SELECT` queries.

> A learning project: the goal was to understand how a SQL engine parses and
> executes statements by building one, not to be a production database. See
> [Limitations](#limitations).

## Install

```bash
npm install sql-nodejs
```

Zero dependencies; requires Node 18 or newer. To pin a specific release:

```bash
npm install sql-nodejs@0.0.6
```

To work on the project itself:

```bash
git clone https://github.com/Megapixel99/sqlJS.git
```

## Usage

```javascript
const SqlParser = require('sql-nodejs');

const db = new SqlParser();
// Logging is off by default; pass `true` to log database switches:
//   const db = new SqlParser(true);

db.Parse('CREATE DATABASE mydb;');
db.Parse('CREATE TABLE users (id INT, name VARCHAR, age INT);');
db.Parse('INSERT INTO users (id, name, age) VALUES (1, alice, 30);');
db.Parse('INSERT INTO users (id, name, age) VALUES (2, bob, 25);');

db.Parse('SELECT * FROM users;');
// → [ ['1', 'alice', '30'], ['2', 'bob', '25'] ]

db.Parse('SELECT name, age FROM users;');
// → [ ['alice', '30'], ['bob', '25'] ]

db.Parse('SELECT * FROM users WHERE age=25;');
// → [ ['2', 'bob', '25'] ]
```

`SELECT` returns an **array of rows**, where each row is an array of the requested
column values in the order you asked for them.

## Supported statements

| Statement | Notes |
|---|---|
| `CREATE DATABASE <name>` | also becomes the active database |
| `USE <name>` | switch the active database |
| `CREATE TABLE <name> (<col> <type>, …)` | |
| `INSERT INTO <table> (<cols>) VALUES (<values>)` | one row per statement |
| `SELECT <cols|*> FROM <table> [WHERE <col>=<value>]` | |
| `DROP TABLE <name>` / `DROP DATABASE <name>` | |

## How it works

- **`index.js`** — `SqlParser`: tokenizes each statement and dispatches to the
  right handler (`Select` / `Create` / `Insert` / `Drop` / `Use`).
- **`database.js`** — `Database`: holds tables, looked up by name.
- **`table.js`** — `Table`: column definitions + rows; implements projection and
  `WHERE` filtering.
- **`row.js`** — `Row`: a single record.

## Tests

```bash
npm test
```

That runs `node --test` over `test/` — Node's built-in test runner, so there is
nothing to install first. 28 assertions across two files:

| File | Covers |
|---|---|
| `test/sql.test.js` | statement level: projection order and subsets, `WHERE` filtering (one match, many matches, none), name-based table/database resolution, `USE`, `DROP TABLE` / `DROP DATABASE`, case-insensitivity, the optional trailing semicolon, and the error paths (no database selected, missing table, unknown column, unsupported statement) |
| `test/table.test.js` | storage level: column names and types, `getDataForColumn`, inserts naming an unknown column, table lookup/drop on `Database`, and `Row` get/set |

To run a single file:

```bash
node --test test/sql.test.js
```

To re-run the suite as you edit:

```bash
node --test --watch
```

Every push and pull request runs the same suite on Node 18, 20, 22, and 24 via
GitHub Actions ([`.github/workflows/test.yml`](.github/workflows/test.yml)) —
that's the badge at the top.

## Limitations

This is a deliberately small learning project:

- **Values are stored as strings** — declared column types (`INT`, etc.) are
  recorded but not enforced or coerced.
- **`WHERE` supports a single `column=value` equality** — no `AND`/`OR`, ranges,
  or operators beyond `=`.
- **One row per `INSERT`**.
- **No `JOIN`, `UPDATE`, `DELETE`, `ORDER BY`, `GROUP BY`, or aggregates.**
- Statements are lowercased during parsing, so identifiers and values are
  case-insensitive.

## License

MIT © Seth Wheeler
