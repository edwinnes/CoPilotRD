import fs from 'node:fs';
import path from 'node:path';
const files=[];
function walk(dir) { for (const e of fs.readdirSync(dir,{withFileTypes:true})) {
  const p=path.join(dir,e.name); if(e.isDirectory())walk(p);else files.push(p);
}}
walk('src');files.push('app.json','app.config.js','App.js','index.js');
const rules=[
  ['embedded Google API key', /AIza[0-9A-Za-z_-]{30,}/],
  ['master password', /diosamor|password\s*===\s*['"]123456/],
  ['plaintext auth write', /(?:AsyncStorage|localStorage)\.setItem\([^\n]*(?:TOKEN|token|@copilot_user|auth_user)/],
  ['fabricated social identity', /apple\.user@|pasajero\.google@|conductor\.google@/],
  ['production API default', /https:\/\/nosotrosrd-backend[^'"\s]+/],
  ['sensitive logging', /console\.(?:log|warn|error)\([^\n]*(?:password|token|userData|storedUser)/],
  ['unrestricted WebView', /originWhitelist=\{\[['"]\*['"]\]\}/],
];
const findings=[];
for(const file of files){ const source=fs.readFileSync(file,'utf8');
  for(const [name,regex]of rules) if(regex.test(source))findings.push(`${file}: ${name}`);
}
if(findings.length){console.error(findings.join('\n'));process.exitCode=1;}
else console.log(`PASS: ${files.length} application/config files; ${rules.length} focused security rules. This is not a dependency/CVE audit.`);
