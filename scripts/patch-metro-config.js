const fs = require('fs');
const path = require('path');

/**
 * PATH PATCHER FOR WINDOWS NODE V22
 * Fixes: ERR_UNSUPPORTED_ESM_URL_SCHEME in metro-config
 */

const targets = [
  path.join('node_modules', 'metro-config', 'src', 'loadConfig.js'),
  path.join('node_modules', '@expo', 'metro', 'metro-config', 'loadConfig.js'),
  // Standard location for many build tools
  path.join('node_modules', 'metro-config', 'build', 'src', 'loadConfig.js')
];

targets.forEach(target => {
  if (fs.existsSync(target)) {
    let content = fs.readFileSync(target, 'utf8');
    
    // 1. Inject url module if not present
    if (!content.includes('var _url = require("url");')) {
      content = '"use strict";\n\nvar _url = require("url");\n' + content.replace('"use strict";', '');
    }

    // 2. Patch the import call to use fileURLToPath equivalent
    const find = 'const configModule = await import(absolutePath);';
    const replace = 'const configModule = await import(_url.pathToFileURL(absolutePath).href);';
    
    if (content.includes(find)) {
      content = content.replace(find, replace);
      fs.writeFileSync(target, content);
      console.log(`Successfully patched: ${target}`);
    } else if (content.includes(replace)) {
      console.log(`Already patched: ${target}`);
    } else {
      console.log(`Could not find target line in: ${target}`);
    }
  }
});
