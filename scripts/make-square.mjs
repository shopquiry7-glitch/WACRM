import fs from 'fs';
import path from 'path';

async function testSharp() {
  try {
    const sharp = (await import('sharp')).default;
    console.log('Sharp is available!');
    
    // Create a 1:1 square version with black background
    const inputPath = path.resolve('public/images/jeose-dp.png');
    const outputPath = path.resolve('public/images/jeose-dp-square.png');
    
    // 1024 x 1024 square with black background padding
    await sharp(inputPath)
      .resize(1024, 1024, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .toFile(outputPath);
      
    console.log('Square image created at:', outputPath);
    const buf = fs.readFileSync(outputPath);
    console.log('Square dimensions:', buf.readUInt32BE(16), 'x', buf.readUInt32BE(20));
  } catch (err) {
    console.log('Sharp error or not found:', err.message);
  }
}

testSharp();
