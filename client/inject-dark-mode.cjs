const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach( f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const replacements = [
  { search: /text-slate-900(?! dark:text-white)/g, replace: 'text-slate-900 dark:text-white' },
  { search: /bg-white(?!(\/|\s*dark:bg-slate-900|\s*dark:bg-slate-950))/g, replace: 'bg-white dark:bg-slate-900' },
  { search: /border-slate-200(?! dark:border-slate-800)/g, replace: 'border-slate-200 dark:border-slate-800' },
  { search: /border-slate-300(?! dark:border-slate-700)/g, replace: 'border-slate-300 dark:border-slate-700' },
  { search: /text-slate-600(?! dark:text-slate-300)/g, replace: 'text-slate-600 dark:text-slate-300' },
  { search: /text-slate-500(?! dark:text-slate-400)/g, replace: 'text-slate-500 dark:text-slate-400' },
  { search: /bg-slate-50(?! dark:bg-slate-800)/g, replace: 'bg-slate-50 dark:bg-slate-800' },
  { search: /bg-slate-100(?! dark:bg-slate-800)/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { search: /bg-\[rgb\(var\(--secondary-bg\)\)\](?! dark:bg-slate-800)/g, replace: 'bg-[rgb(var(--secondary-bg))] dark:bg-slate-800' },
  { search: /text-slate-700(?! dark:text-slate-200)/g, replace: 'text-slate-700 dark:text-slate-200' },
  { search: /border-black\/10(?! dark:border-white\/10)/g, replace: 'border-black/10 dark:border-white/10' },
  { search: /border-black\/5(?! dark:border-white\/5)/g, replace: 'border-black/5 dark:border-white/5' }
];

walk('./src', (filePath) => {
  if (filePath.endsWith('.jsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    replacements.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });

    if (content !== original) {
      console.log(`Injecting dark mode classes into ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
