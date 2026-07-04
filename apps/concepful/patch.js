const fs = require('fs');
const file = require.resolve('next/dist/lib/typescript/getTypeScriptConfiguration.js');
let content = fs.readFileSync(file, 'utf8');

// Undo the bad patch
content = content.replace(/tsConfigPath\.replace\(\/\\\\\\\\\/g, "\/"\)/g, 'tsConfigPath');

// Apply the good patch
content = content.replace(
  'const { config, error } = ts.readConfigFile(tsConfigPath, ts.sys.readFile);',
  'const { config, error } = ts.readConfigFile(tsConfigPath.replace(/\\\\/g, "/"), ts.sys.readFile);'
);

content = content.replace(
  'ts.parseJsonConfigFileContent(configToParse,',
  'ts.parseJsonConfigFileContent(configToParse,'
); // just checking, the second usage is _path.default.dirname(tsConfigPath) which is fine

fs.writeFileSync(file, content);
console.log('Repatched', file);
