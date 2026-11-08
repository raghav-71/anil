const http = require('http');

const urls = [
  'http://localhost:3000/',
  'http://localhost:3000/shop',
  'http://localhost:3000/catalog',
  'http://localhost:3000/mobiles',
  'http://localhost:3000/accessories',
  'http://localhost:3000/product/moto-g37-power',
  'http://localhost:3000/product/lava-a3-torch',
  'http://localhost:3000/product/boat-airdopes-156-nirvana',
  'http://localhost:3000/product/kdm-evergreen',
  'http://localhost:3000/product/boat-rockerz-425',
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR: ' + e.message });
    });
  });
}

async function run() {
  console.log('Testing HTML Page Routes:');
  for (const url of urls) {
    const res = await checkUrl(url);
    console.log(`  ${res.status === 200 ? '✓' : '✗'} [${res.status}] ${url}`);
  }
}

run();

