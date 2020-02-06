const Row = require('./row.js');

class Table {
  constructor(_name, _columns) {
    this.name = _name;
    this.columns = this.parseColmuns(_columns);
    this.rows = [];
  }
  selectDataFromTable(_columns) {
    let data = [];
    if (this.contains(this.getColmunNames(), _columns[0].split(","))) {
      let queryColumns = _columns[0].split(",");
      for (var j = 0; j < this.rows.length; j++) {
      let arr = [];
      for (var i = 0; i < queryColumns.length; i++) {
        for (var l = 0; l < this.getColmunNames().length; l++) {
          if (queryColumns[i] === this.getColmunNames()[l]) {
            arr[i] = this.rows[j].data[i]
          }
        }
      }
      data.push(arr);
    }
    } else {
      throw (new Error("COLUMN(S) not found"));
    }
    return data;
  }
  selectDataFromTableWhere(_columns, _where) {
    let data = [];
    for (var k = 0; k < _where.length; k++) {
    if (this.contains(this.getColmunNames(), _columns[0].split(","))) {
      let queryColumns = _columns[0].split(",");
      for (var j = 0; j < this.rows.length; j++) {
      let arr = [];
      for (var i = 0; i < queryColumns.length; i++) {
        for (var l = 0; l < this.getColmunNames().length; l++) {
          if (_where[k].split("=")[1] === this.rows[j].data[this.getColmunNames().indexOf(_where[k].split("=")[0])]) {
          if (queryColumns[i] === this.getColmunNames()[l]) {
            arr[i] = this.rows[j].data[i]
          }
        }
        }
      }
    if (arr.length > 0) {
      data.push(arr);
    }
    }
    } else {
      throw (new Error("COLUMN(S) not found"));
    }
  }
    return data;
  }
  selectAllDataFromTable() {
    let data = [];
    for (var j = 0; j < this.rows.length; j++) {
      data.push(this.rows[j].data);
    }
    return data;
  }
  selectAllDataFromTableWhere(_where) {
    let data = [];
    for (var i = 0; i < _where.length; i++) {
      for (var j = 0; j < this.rows.length; j++) {
      let arr = [];
        if (this.contains(this.getColmunNames(), [_where[i].split("=")[0]])) {
          if (_where[i].split("=")[1] === this.rows[j].data[this.getColmunNames().indexOf(_where[i].split("=")[0])]) {
            for (var l = 0; l < this.rows[j].data.length; l++) {
              arr.push(this.rows[j].data[l])
            }
          }
        } else {
          throw (new Error("COLUMN(S) not found"));
        }
      if (arr.length > 0) {
      data.push(arr);
      }
      }
    }
    return data;
  }
  getDataForColumn(_column) {
    let data = [];
    let index = this.columns.indexOf(_column);
    if (index === -1) {
      for (var i = 0; i < this.rows.length; i++) {
        data.push(this.rows[i][index]);
      }
    } else {
      throw (new Error("COLUMN(S) not found"));
    }
    return data;
  }
  insertDataIntoTable(_columns, _data) {
    if (this.contains(this.getColmunNames(), _columns)){
      this.rows.push(new Row(_data));
    }
  }
  parseColmuns(_columns){
    let jsonData = [];
    for (var i = 0; i < _columns.length; i++) {
      jsonData.push({
      name: _columns[i].split(" ")[0],
      type: _columns[i].split(" ")[1]
    });
    }
    return jsonData;
  }
  getColmunNames(){
    let data = [];
    for (var i = 0; i < this.columns.length; i++) {
      data.push(this.columns[i].name);
    }
    return data;
  }
  getColmunTypes(){
    let data = [];
    for (var i = 0; i < this.columns.length; i++) {
      data.push(this.columns[i].type);
    }
    return data;
  }
  contains(arr1, arr2) {
    const isBelowThreshold = (currentValue) => arr1.includes(currentValue);

    return (arr2.every(isBelowThreshold));
  }
  insertAt(array, index, ...elementsArray) {
    return (array.splice(index, 0, ...elementsArray));
  }
}

module.exports = Table;
