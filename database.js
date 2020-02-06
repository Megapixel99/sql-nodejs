class Database {
  constructor(_name) {
    this.tables = []
    this.name = _name
  }
  getTables(){
    return this.tables;
  }
  getTable(_table){
    return (this.tables.find(function () {
      return _table;
    }));
  }
  createTable(_tableName){
    this.tables.push(_tableName);
  }
  getName(){
    return this.name;
  }
  dropTable(table){
    let index = this.tables.indexOf(_table);
    if (index > -1) {
    this.tables.splice(index, 1);
  } else {
    console.log("Table: " + table.toUpperCase() + " not found.");
  }
  }
}

module.exports = Database;
