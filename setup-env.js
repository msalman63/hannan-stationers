const fs = require('fs');

const environment = `
export const environment = {
  production: true,
  supabaseUrl: '${process.env.supabaseUrl}',
  supabaseKey: '${process.env.supabaseKey}'
};
`;

fs.writeFileSync('./src/environments/environment.ts', environment);
console.log('environment.ts created successfully!');