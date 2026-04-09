const fs = require('fs');
const pdfjsLib = require('pdfjs-dist');

const files = [
  'c:\\Users\\jayan\\OneDrive\\Documents\\Strataply\\Strataply\\STRATAPLY – COMPANY OVERVIEW.pdf',
  'c:\\Users\\jayan\\OneDrive\\Documents\\Strataply\\Strataply\\STRATAPLY_doc.pdf'
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
    console.log(`--- START OF ${file} ---`);
    try {
      const text = await extractText(file);
      console.log(text);
    } catch (e) {
      console.error(`Error reading ${file}:`, e);
    }
    console.log(`--- END OF ${file} ---`);
  }
}

run();
