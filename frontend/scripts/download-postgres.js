const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://get.enterprisedb.com/postgresql/postgresql-17.11-5-windows-x64-binaries.zip';
const dest = 'C:/Users/soura/postgresql-binaries.zip';

console.log('Starting download from', url);
console.log('Destination:', dest);

const file = fs.createWriteStream(dest);

function fetchUrl(targetUrl) {
  https.get(targetUrl, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      console.log('Redirecting to:', res.headers.location);
      fetchUrl(res.headers.location);
      return;
    }

    if (res.statusCode !== 200) {
      console.error('Failed with status code:', res.statusCode);
      process.exit(1);
    }

    const total = parseInt(res.headers['content-length'] || '0', 10);
    let downloaded = 0;
    let lastPct = 0;
    const startTime = Date.now();

    res.on('data', (chunk) => {
      downloaded += chunk.length;
      if (total > 0) {
        const pct = Math.floor((downloaded / total) * 100);
        if (pct >= lastPct + 10) {
          lastPct = pct;
          const elapsed = (Date.now() - startTime) / 1000;
          const speed = (downloaded / 1024 / 1024 / elapsed).toFixed(2);
          console.log('Progress: ' + pct + '% (' + (downloaded / 1024 / 1024).toFixed(1) + ' / ' + (total / 1024 / 1024).toFixed(1) + ' MB) @ ' + speed + ' MB/s');
        }
      }
    });

    res.pipe(file);

    file.on('finish', () => {
      file.close(() => {
        console.log('Download complete! File saved to ' + dest);
      });
    });
  }).on('error', (err) => {
    console.error('Download error:', err.message);
    process.exit(1);
  });
}

fetchUrl(url);
