const test = require('node:test');
const assert = require('node:assert');
const Database = require('../database.js');
const Table = require('../table.js');
const Row = require('../row.js');

// A table matching `CREATE TABLE t (a INT, b VARCHAR)` holding two rows.
function freshTable() {
  const t = new Table('t', ['a int', 'b varchar']);
  t.insertDataIntoTable(['a', 'b'], ['1', 'x']);
  t.insertDataIntoTable(['a', 'b'], ['2', 'y']);
  return t;
}

test('a table records its column names and types', () => {
  const t = freshTable();
  assert.deepStrictEqual(t.getColmunNames(), ['a', 'b']);
  assert.deepStrictEqual(t.getColmunTypes(), ['int', 'varchar']);
});

test('getDataForColumn returns one column across every row', () => {
  const t = freshTable();
  assert.deepStrictEqual(t.getDataForColumn('b'), ['x', 'y']);
});

test('getDataForColumn on an unknown column throws', () => {
  const t = freshTable();
  assert.throws(() => t.getDataForColumn('z'), /COLUMN\(S\) not found/);
});

test('inserting with an unknown column stores nothing', () => {
  const t = freshTable();
  t.insertDataIntoTable(['z'], ['9']);
  assert.deepStrictEqual(t.selectAllDataFromTable(), [['1', 'x'], ['2', 'y']]);
});

test('a database resolves and drops tables by name', () => {
  const d = new Database('d');
  const t = freshTable();
  d.createTable(t);
  assert.strictEqual(d.getName(), 'd');
  assert.strictEqual(d.getTable('t'), t);
  assert.strictEqual(d.getTable('missing'), undefined);
  d.dropTable('t');
  assert.deepStrictEqual(d.getTables(), []);
});

test('a row holds and replaces its data', () => {
  const r = new Row(['1', 'x']);
  assert.deepStrictEqual(r.getRow(), ['1', 'x']);
  r.setRow(['2', 'y']);
  assert.deepStrictEqual(r.getRow(), ['2', 'y']);
});
