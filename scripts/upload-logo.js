import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

async function run() {
  console.log('Starting logo upload script...');
  
  // Find amplify_outputs.json in current directory
  let outputsPath = path.resolve('amplify_outputs.json');
  if (!fs.existsSync(outputsPath)) {
    outputsPath = path.resolve('../amplify_outputs.json');
    if (!fs.existsSync(outputsPath)) {
      console.warn('amplify_outputs.json not found in root or parent. Searching recursively...');
      // search in current folder
      const files = fs.readdirSync('.');
      const found = files.find(f => f.includes('amplify_outputs.json'));
      if (found) {
        outputsPath = path.resolve(found);
      } else {
        console.error('Could not find amplify_outputs.json!');
        process.exit(1);
      }
    }
  }

  console.log(`Found outputs file at: ${outputsPath}`);
  const outputs = JSON.parse(fs.readFileSync(outputsPath, 'utf8'));
  
  const bucketName = outputs.storage?.bucket_name;
  const region = outputs.storage?.aws_region || 'eu-north-1';

  if (!bucketName) {
    console.warn('No S3 bucket name found in amplify_outputs.json. Skipping logo upload to S3.');
    return;
  }

  console.log(`Target S3 Bucket: ${bucketName}`);
  console.log(`Region: ${region}`);

  const s3 = new S3Client({ region });
  const logoPath = path.resolve('public/atlas.png');

  if (!fs.existsSync(logoPath)) {
    console.error(`Logo file not found at: ${logoPath}`);
    process.exit(1);
  }

  console.log(`Reading logo file: ${logoPath}`);
  const logoBuffer = fs.readFileSync(logoPath);

  console.log('Uploading logo to S3 at path: images/atlas.png...');
  await s3.send(new PutObjectCommand({
    Bucket: bucketName,
    Key: 'images/atlas.png',
    Body: logoBuffer,
    ContentType: 'image/png',
  }));

  console.log('Logo uploaded successfully to S3 bucket!');
}

run().catch(err => {
  console.error('Error uploading logo:', err);
  process.exit(1);
});
