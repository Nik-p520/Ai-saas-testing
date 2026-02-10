const fs = require('fs');
const path = require('path');

// Target the possible build locations for the new Angular builder
const pathsToTry = [
  path.join(__dirname, 'dist/ai-saas-testing-platform/browser/assets/env.js'),
  path.join(__dirname, 'dist/ai-saas-testing-platform/assets/env.js')
];

const vars = [
  'SPRING_API',
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

let foundFile = false;

pathsToTry.forEach((filePath) => {
  if (fs.existsSync(filePath)) {
    foundFile = true;
    let content = fs.readFileSync(filePath, 'utf8');
    
    vars.forEach(v => {
      // Specifically look for the NG_APP_ prefix from your Netlify settings
      const value = process.env[`NG_APP_${v}`] || process.env[v] || '';
      const regex = new RegExp(`\\$\\{${v}\\}`, 'g');
    
      console.log(`Checking ${v}... Found value: ${value ? 'YES' : 'EMPTY'}`);
      content = content.replace(regex, value);
    });

    fs.writeFileSync(filePath, content);
    console.log(`✅ SUCCESS: Injected keys into: ${filePath}`);
  }
});

if (!foundFile) {
  console.error('❌ ERROR: Could not find env.js. Checked:');
  pathsToTry.forEach(p => console.log(` - ${p}`));
  
  // List files to help us debug the path if it fails again
  const distDir = path.join(__dirname, 'dist/ai-saas-testing-platform');
  if (fs.existsSync(distDir)) {
    console.log('Actual files found in dist:', fs.readdirSync(distDir, { recursive: true }));
  }
}