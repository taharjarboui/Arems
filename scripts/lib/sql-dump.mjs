// Lecture des INSERT d'un dump MySQL (mysqldump), sans serveur MySQL.
// Retourne { table: [ { colonne: valeur } ] } avec les noms de colonnes tirés des CREATE TABLE.
import { readFileSync } from 'node:fs';

function parseValues(s, start) {
  // Parse une suite de tuples "(…),(…);" à partir de `start`. Gère les chaînes '…' avec échappements \x et ''.
  const rows = [];
  let i = start;
  while (i < s.length) {
    while (s[i] === ',' || s[i] === ' ' || s[i] === '\n') i++;
    if (s[i] === ';') break;
    if (s[i] !== '(') throw new Error(`Tuple attendu à la position ${i}`);
    i++;
    const row = [];
    for (;;) {
      if (s[i] === "'") {
        let v = '';
        i++;
        for (;;) {
          const c = s[i];
          if (c === '\\') {
            const n = s[i + 1];
            v += ({ n: '\n', r: '\r', t: '\t', 0: '\0', Z: '\x1a' })[n] ?? n;
            i += 2;
          } else if (c === "'" && s[i + 1] === "'") { v += "'"; i += 2; }
          else if (c === "'") { i++; break; }
          else { v += c; i++; }
        }
        row.push(v);
      } else {
        let j = i;
        while (s[j] !== ',' && s[j] !== ')') j++;
        const raw = s.slice(i, j).trim();
        row.push(raw === 'NULL' ? null : Number(raw));
        i = j;
      }
      if (s[i] === ',') { i++; continue; }
      if (s[i] === ')') { i++; break; }
    }
    rows.push(row);
  }
  return rows;
}

export function readDump(path) {
  const sql = readFileSync(path, 'utf8');
  const columns = {};
  for (const m of sql.matchAll(/CREATE TABLE `(\w+)` \(([\s\S]*?)\n\)/g)) {
    columns[m[1]] = [...m[2].matchAll(/^\s+`(\w+)`/gm)].map((c) => c[1]);
  }
  const tables = {};
  for (const m of sql.matchAll(/INSERT INTO `(\w+)` VALUES /g)) {
    const name = m[1];
    const rows = parseValues(sql, m.index + m[0].length);
    tables[name] = (tables[name] ?? []).concat(rows.map((r) => Object.fromEntries(columns[name].map((c, k) => [c, r[k]]))));
  }
  return tables;
}
