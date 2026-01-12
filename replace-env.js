const fs = require('fs');
const path = require('path');

// Target the BUILT file in the dist folder
const distPath = path.join(__dirname, 'dist/ai-saas-testing-platform/browser/assets/env.js');

if (fs.existsSync(distPath)) {
    let content = fs.readFileSync(distPath, 'utf8');
    
    // This list maps your Netlify Variable Name -> Your env.js placeholder
    const vars = [
        { netlify: 'NG_APP_API_BASE_URL', placeholder: 'SPRING_API' },
        { netlify: 'NG_APP_FIREBASE_API_KEY', placeholder: 'FIREBASE_API_KEY' },
        { netlify: 'NG_APP_FIREBASE_AUTH_DOMAIN', placeholder: 'FIREBASE_AUTH_DOMAIN' },
        { netlify: 'NG_APP_FIREBASE_PROJECT_ID', placeholder: 'FIREBASE_PROJECT_ID' },
        { netlify: 'NG_APP_FIREBASE_STORAGE_BUCKET', placeholder: 'FIREBASE_STORAGE_BUCKET' },
        { netlify: 'NG_APP_FIREBASE_MESSAGING_SENDER_ID', placeholder: 'FIREBASE_MESSAGING_SENDER_ID' },
        { netlify: 'NG_APP_FIREBASE_APP_ID', placeholder: 'FIREBASE_APP_ID' }
    ];

    vars.forEach(v => {
        const value = process.env[v.netlify] || '';
        // This finds $FIREBASE_API_KEY (or whatever placeholder) and replaces it
        const regex = new RegExp(`\\$${v.placeholder}`, 'g');
        content = content.replace(regex, value);
    });

    fs.writeFileSync(distPath, content);
    console.log('✅ SUCCESS: Final dist file updated with Netlify variables.');
} else {
    console.error('❌ ERROR: Could not find the file at: ' + distPath);
}