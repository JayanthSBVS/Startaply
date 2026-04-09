const fs = require('fs');
const pdf = require('pdf-parse');

const files = [
  'c:\\Users\\jayan\\OneDrive\\Documents\\Strataply\\Strataply\\STRATAPLY – COMPANY OVERVIEW.pdf',
  'c:\\Users\\jayan\\OneDrive\\Documents\\Strataply\\Strataply\\STRATAPLY_doc.pdf'
];

async function extract() {
  console.log('PDF-PARSE types:', typeof pdf, pdf);
  console.log('PDF-PARSE keys:', Object.keys(pdf));
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    const dataBuffer = fs.readFileSync(file);
    try {
      const data = await pdf(dataBuffer);
      console.log(`--- START OF ${file} ---`);
      console.log(data.text);
      console.log(`--- END OF ${file} ---`);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e);
    }
  }
}

extract().catch(console.error);
