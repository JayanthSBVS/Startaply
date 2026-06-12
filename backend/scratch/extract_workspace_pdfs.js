const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const files = [
  path.join(__dirname, '..', '..', 'STARTAPLY_ WEBSITE _  BLUEPRINT.pdf'),
  path.join(__dirname, '..', '..', 'STARTAPLY - COMPANY OVERVIEW.pdf')
];

async function extract() {
  const parseFn = typeof pdf === 'function' ? pdf : pdf.PDFParse;
  if (!parseFn) {
    console.error('No parse function found on pdf-parse!', Object.keys(pdf));
    return;
  }
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    const dataBuffer = fs.readFileSync(file);
    try {
      const data = await parseFn(dataBuffer);
      console.log(`--- START OF ${path.basename(file)} ---`);
      console.log(data.text);
      console.log(`--- END OF ${path.basename(file)} ---`);
    } catch (e) {
      console.error(`Error parsing ${file}:`, e.message);
    }
  }
}

extract().catch(console.error);
