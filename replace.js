const fs = require('fs');
const file = 'src/app/mentorship.ts';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/text-slate-950/g, 'text-brand-900');
content = content.replace(/text-slate-900/g, 'text-brand-900');
content = content.replace(/text-slate-800/g, 'text-brand-900\/90');
content = content.replace(/text-slate-700/g, 'text-brand-900\/80');
content = content.replace(/text-slate-600/g, 'text-brand-900\/70');
content = content.replace(/text-slate-500/g, 'text-brand-900\/60');
content = content.replace(/text-slate-400/g, 'text-brand-900\/50');
content = content.replace(/border-slate-200/g, 'border-brand-200');
content = content.replace(/border-slate-100/g, 'border-brand-100');
content = content.replace(/bg-slate-50/g, 'bg-brand-50');
content = content.replace(/bg-slate-950/g, 'bg-brand-900');
content = content.replace(/hover:bg-slate-800/g, 'hover:bg-brand-800');
content = content.replace(/bg-slate-800/g, 'bg-brand-800');

fs.writeFileSync(file, content);
console.log('Done');
