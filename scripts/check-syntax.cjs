const fs = require('node:fs');
const path = require('node:path');
// Audit environment can provide a parser copied from the pinned source snapshot.
// Normal usage resolves the project's directly declared development dependency.
const parser = process.env.COPILOT_AUDIT_PARSER ? require(process.env.COPILOT_AUDIT_PARSER) : require('@babel/parser');
let count = 0;
function check(file) {
  const ast = parser.parse(fs.readFileSync(file, 'utf8'), {
    sourceType: 'unambiguous', plugins: ['jsx', 'typescript'],
  });
  for (const node of ast.program.body) {
    if (node.type === 'ImportDeclaration' && node.source.value.startsWith('.')) {
      const base = path.resolve(path.dirname(file), node.source.value);
      if (![base, ...['.js', '.jsx', '.ts', '.tsx', '.mjs', '.json'].map(ext => base + ext)].some(p => fs.existsSync(p) && fs.statSync(p).isFile())) {
        throw new Error(`${file}: unresolved relative import ${node.source.value}`);
      }
    }
  }
  count++;
}
function walk(dir) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(jsx?|tsx?|mjs|cjs)$/.test(file)) check(file);
  }
}
walk('src'); walk('scripts'); walk('tests');
for (const file of ['App.js', 'index.js', 'app.config.js', 'babel.config.js']) check(file);
console.log(`PASS: syntax parsed and relative imports resolved for ${count} files. Not an Expo bundle or native build.`);
