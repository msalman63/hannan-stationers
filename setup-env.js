const fs = require('fs');

const supabaseUrl = process.env.supabaseUrl;
const supabaseKey = process.env.supabaseKey;

console.log('supabaseUrl:', supabaseUrl ? 'EXISTS' : 'MISSING!');
console.log('supabaseKey:', supabaseKey ? 'EXISTS' : 'MISSING!');

const environment = `
export const environment = {
  production: true,
  supabaseUrl: '${supabaseUrl}',
  supabaseKey: '${supabaseKey}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', environment);
console.log('environment.ts created successfully!');