const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // 1. Preserve text-white on primary buttons
  { regex: /bg-blue-600(.*?)text-white/g, replace: 'bg-orange-600 dark:bg-blue-600$1text-white' },
  { regex: /bg-blue-700(.*?)text-white/g, replace: 'bg-orange-700 dark:bg-blue-700$1text-white' },
  { regex: /bg-emerald-600(.*?)text-white/g, replace: 'bg-emerald-600$1text-white' },
  { regex: /bg-rose-600(.*?)text-white/g, replace: 'bg-rose-600$1text-white' },
  
  // 2. Backgrounds
  { regex: /(?<!dark:)bg-slate-950/g, replace: 'bg-slate-50 dark:bg-slate-950' },
  { regex: /(?<!dark:)bg-slate-900/g, replace: 'bg-white dark:bg-slate-900' },
  { regex: /(?<!dark:)bg-slate-800/g, replace: 'bg-slate-100 dark:bg-slate-800' },
  { regex: /(?<!dark:)bg-\[\#0f172a\]/g, replace: 'bg-white dark:bg-[#0f172a]' },
  
  // 3. Borders
  { regex: /(?<!dark:)border-slate-800/g, replace: 'border-slate-200 dark:border-slate-800' },
  { regex: /(?<!dark:)border-slate-700/g, replace: 'border-slate-300 dark:border-slate-700' },
  
  // 4. Text colors
  { regex: /(?<!dark:)text-slate-400/g, replace: 'text-slate-500 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-300/g, replace: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)text-white/g, replace: 'text-slate-900 dark:text-white' },
  
  // 5. Accents (Blue to Orange)
  // Backgrounds
  { regex: /(?<!dark:)bg-blue-500/g, replace: 'bg-orange-500 dark:bg-blue-500' },
  { regex: /(?<!dark:)bg-blue-600/g, replace: 'bg-orange-600 dark:bg-blue-600' },
  { regex: /(?<!dark:)bg-blue-700/g, replace: 'bg-orange-700 dark:bg-blue-700' },
  { regex: /(?<!dark:)bg-blue-900\/20/g, replace: 'bg-orange-100 dark:bg-blue-900/20' },
  { regex: /(?<!dark:)bg-blue-900\/10/g, replace: 'bg-orange-50 dark:bg-blue-900/10' },
  { regex: /(?<!dark:)bg-blue-50/g, replace: 'bg-orange-50 dark:bg-blue-50' },
  { regex: /(?<!dark:)from-blue-600\/20/g, replace: 'from-orange-500/20 dark:from-blue-600/20' },
  
  // Text
  { regex: /(?<!dark:)text-blue-400/g, replace: 'text-orange-500 dark:text-blue-400' },
  { regex: /(?<!dark:)text-blue-500/g, replace: 'text-orange-600 dark:text-blue-500' },
  { regex: /(?<!dark:)text-blue-600/g, replace: 'text-orange-600 dark:text-blue-600' },
  
  // Borders and Rings
  { regex: /(?<!dark:)border-blue-500/g, replace: 'border-orange-500 dark:border-blue-500' },
  { regex: /(?<!dark:)border-blue-400/g, replace: 'border-orange-500 dark:border-blue-400' },
  { regex: /(?<!dark:)ring-blue-500/g, replace: 'ring-orange-500 dark:ring-blue-500' },
  
  // Specific glass-panel or glow fixes
  { regex: /glow-blue/g, replace: 'glow-orange dark:glow-blue' },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replace } of replacements) {
        content = content.replace(regex, replace);
      }
      
      // Additional cleanup if double dark: classes occur
      content = content.replace(/dark:dark:/g, 'dark:');
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(srcDir);
console.log("Refactoring selesai!");
