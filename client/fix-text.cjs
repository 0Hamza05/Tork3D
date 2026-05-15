const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('./src', (filePath) => {
  if (filePath.endsWith('.jsx') || filePath.endsWith('.js') || filePath.endsWith('.css')) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('text-foreground')) {
      console.log(`Replacing in ${filePath}`);
      content = content.replace(/text-foreground/g, 'text-slate-900');
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
