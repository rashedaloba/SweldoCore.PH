import assert from 'node:assert/strict';
import test from 'node:test';
import { escapeCsvCell } from './payrollExport.js';

test('CSV cells preserve quoted text while neutralizing spreadsheet formulas', () => {
  assert.equal(escapeCsvCell('Maria "M" Santos'), '"Maria ""M"" Santos"');
  assert.equal(escapeCsvCell('=HYPERLINK("https://example.com")'), `"'=HYPERLINK(""https://example.com"")"`);
  assert.equal(escapeCsvCell('  @SUM(A1:A2)'), '"\'  @SUM(A1:A2)"');
  assert.equal(escapeCsvCell(1250), '"1250"');
});
