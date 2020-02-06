### Overview

The purpose of this project is to create an SQL database which is stored in memory.

##### Supported Statements:
###### v0.0.1
  - Creating databases and tables
  - Switching databases
  - Select statements for querying tables

### How to use

In your Project require the module:

```
const sqlJS = require('sqlJS');
```
Then write the following to create your database:
```
let db = new sqlMock();
```
Then use the parse function and pass in an SQL statement. For example:
```
p.Parse("CREATE DATABASE databasename;");
db.Parse("CREATE table tablename (test INT, test1 INT, test2 INT);");
db.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 0 + ", " + 2 + ", " + 0 + ");")
db.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 0 + ", " + 2 + ", " + 0 + ");")
db.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 1 + ", " + 0 + ", " + 0 + ");")
db.Parse("Select test, test1, test2 from tablename WHERE test = " + 0 + ";");
db.Parse("Select test, test1 from tablename;");
db.Parse("Select * from tablename WHERE test = " + 1 + ";");
db.Parse("Select * from tablename;");
```

### How to test

In your Terminal or Command Prompt, run the following at the root of the
project directory:

```
$ npm test
```

### How to contribute

Contributions are appreciated, if you wish to contribute please make a pull request.
