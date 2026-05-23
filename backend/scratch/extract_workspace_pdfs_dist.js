const fs = require('fs');
const path = require('path');
const pdfjsLib = require('pdfjs-dist');

const files = [
  path.join(__dirname, '..', '..', 'STARTAPLY_ WEBSITE _  BLUEPRINT.pdf'),
  path.join(__dirname, '..', '..', 'STARTAPLY – COMPANY OVERVIEW.pdf')
];

async function extractText(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdf = await loadingTask.promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    fullText += pageText + '\n';
  }
  return fullText;
}

async function run() {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      continue;
    }
    console.log(`--- START OF ${path.basename(file)} ---`);
    try {
      const text = await extractText(file);
      console.log(text);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
    console.log(`--- END OF ${path.basename(file)} ---`);
  }
}

run();
