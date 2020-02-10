const Database = require('./database.js');
const Table = require('./table.js');

class SqlParser {
  constructor(_logging = false) {
    this.logging = _logging
    this.databases = []
    this.currentDatabase = null
    this.noDB = "No Database selected"
  }
  Parse(sqlQuery) {
    if (sqlQuery.indexOf(";") !== -1){
      sqlQuery = sqlQuery.slice(0, sqlQuery.length - 1);
    }
    sqlQuery = sqlQuery.toLowerCase().replace(/, /g, ',').split(" ");

    if (sqlQuery[0] === "select") {
      if (this.getCurrentDatabase()){
        return (this.Select(sqlQuery));
      } else {
        throw(new Error(this.noDB));
      }
    } else if (sqlQuery[0] === "create") {
      return (this.Create(sqlQuery));
    } else if (sqlQuery[0] === "insert" && sqlQuery[1] === "into") {
      return (this.Insert(sqlQuery));
    } else if (sqlQuery[0] === "drop") {
      return (this.Drop(sqlQuery));
    } else if (sqlQuery[0] === "use") {
      return (this.Use(sqlQuery[1]));
    } else {
      throw (new Error(sqlQuery[0] + " not supported"));
    }
  }
  Select(_sqlQuery) {
    if (this.currentDatabase.getTable(_sqlQuery[_sqlQuery.indexOf("from") + 1])) {
      if (_sqlQuery.includes("where")){
        if (_sqlQuery[1] === "*" && _sqlQuery[2] === "from") {
          return (this.currentDatabase.getTable(_sqlQuery[3]).selectAllDataFromTableWhere(_sqlQuery.slice(_sqlQuery.indexOf("where") + 1).join('').split(",")));
        }
        else if (_sqlQuery[1] !== "*" && _sqlQuery.includes("from")) {
          return (this.currentDatabase.getTable(_sqlQuery[_sqlQuery.indexOf(
            "from") + 1]).selectDataFromTableWhere(_sqlQuery.slice(1, _sqlQuery.indexOf("from")), _sqlQuery.slice(_sqlQuery.indexOf("where") + 1).join('').split(",")));
        } else {
          throw (new Error("Invalid Select statement"));
        }
      } else {
        if (_sqlQuery[1] === "*" && _sqlQuery[2] === "from") {
          return (this.currentDatabase.getTable(_sqlQuery[3]).selectAllDataFromTable());
        } else if (_sqlQuery[1] !== "*" && _sqlQuery.includes("from")) {
          return (this.currentDatabase.getTable(_sqlQuery[_sqlQuery.indexOf(
            "from") + 1]).selectDataFromTable(_sqlQuery.slice(1, _sqlQuery.indexOf("from"))));
        } else {
          throw (new Error("Invalid Select statement"));
        }
    }
  } else {
    throw (new Error("TABLE not found"));
    }
  }
  Create(_sqlQuery) {
    if (_sqlQuery[1] === "table") {
      if (this.getCurrentDatabase()){
      this.currentDatabase.createTable(new Table(_sqlQuery[2], _sqlQuery.join(' ')
      .slice(_sqlQuery.join(' ').indexOf("(") + 1, _sqlQuery.join(' ').indexOf(")"))
      .split(",")));
    } else {
        throw(new Error(this.noDB));
      }
      } else if (_sqlQuery[1] === "database") {
        let newDatabase = new Database(_sqlQuery[2]);
        this.databases.push(newDatabase);
        this.currentDatabase = newDatabase;
        if (this.logging) {
          console.log("Using database: " + newDatabase.name);
        }
      } else {
        console.log(_sqlQuery[1].toUpperCase() + " not supported.");
      }
    }
    Insert(_sqlQuery) {
      if (this.getCurrentDatabase()){
        if (this.currentDatabase.getTable(_sqlQuery[2])){
          this.currentDatabase.getTable(_sqlQuery[2]).insertDataIntoTable(this.parseColmuns(_sqlQuery), this.parseColmuns(_sqlQuery, 2))
        } else {
          throw (new Error("TABLE not found"));
        }
      } else {
          throw(new Error(this.noDB));
        }
    }
    Drop(_sqlQuery) {
      if (_sqlQuery[1] === "table") {
        if (this.getCurrentDatabase()){
        this.currentDatabase.dropTable(_sqlQuery[2]);
      } else {
          throw(new Error(this.noDB));
        }
      } else if (_sqlQuery[1] === "database") {
        dropDatabase(_sqlQuery[2]);
        this.currentDatabase = null;
      } else {
        console.log(_sqlQuery[1].toUpperCase() + " not supported.");
      }
    }
    Use(db) {
      let index = this.databases.indexOf(db);
      if (index > -1) {
        this.currentDatabase = db;
        if (this.logging) {
          console.log("Using database: " + db);
        }
      } else {
        console.log("Database: " + db.toUpperCase() + " not found.");
      }
    }
    getCurrentDatabase() {
      return this.currentDatabase;
    }
    dropDatabase(db) {
      let index = this.databases.indexOf(db);
      if (index > -1) {
        this.databases.splice(index, 1);
      } else {
        console.log("Database: " + db.toUpperCase() + " not found.");
      }
    }
    parseColmuns(_sqlQuery, num){
      let query = _sqlQuery.join(' ')
      if (num !== null && num !== undefined) {
      return (query.slice(query.indexOf("(", query.indexOf("(") + 1) + 1, query.indexOf(")",  query.indexOf(")") + 1)).split(","));
      } else {
      return (query.slice(query.indexOf("(") + 1,query.indexOf(")")).split(","));
      }
    }
  }

module.exports = SqlParser;
