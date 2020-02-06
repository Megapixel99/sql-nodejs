const sqlParser = require('./index.js');

let p = new sqlParser();

p.Parse("CREATE DATABASE databasename;");
p.Parse("CREATE table tablename (test INT, test1 INT, test2 INT);");
p.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 0 + ", " + 2 + ", " + 0 + ");")
p.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 0 + ", " + 2 + ", " + 0 + ");")
p.Parse("INSERT INTO tablename (test, test1, test2) VALUES (" + 1 + ", " + 0 + ", " + 0 + ");")
p.Parse("Select test, test1, test2 from tablename WHERE test = " + 0 + ";");
p.Parse("Select test, test1 from tablename;");
p.Parse("Select * from tablename WHERE test = " + 1 + ";");
p.Parse("Select * from tablename;");
