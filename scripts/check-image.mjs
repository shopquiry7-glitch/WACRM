import fs from 'fs';
import path from 'path';

const imgPath = path.resolve('public/images/jeose-dp.png');
const buf = fs.readFileSync(imgPath);

// Check PNG width & height
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

console.log(`Image: ${imgPath}`);
console.log(`Dimensions: ${width} x ${height}`);
console.log(`Aspect ratio: ${(width / height).toFixed(2)}`);
console.log(`File size: ${(buf.length / 1024).toFixed(1)} KB`);
