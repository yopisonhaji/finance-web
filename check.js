const fs = require('fs');
const content = fs.readFileSync('/mnt/d/finance/web-desktop/finance.db', 'utf8');
if (content.includes('6282138004443') || content.includes('082138004443')) {
  console.log('STILL EXISTS');
} else {
  console.log('DELETED');
}
