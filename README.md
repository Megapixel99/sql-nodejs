# sql-nodejs

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

Runs the assertion suite in `test/` (Node's built-in test runner — no
dependencies). It covers projection order and subsets, `WHERE` filtering,
name-based table/database resolution, `DROP`, and the error paths
(no database selected, missing table, unsupported statement).

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
