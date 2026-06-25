const fs = require('fs');
const path = require('path');

const files = [
  'src/index.css',
  'src/components/WeddingLookBook.tsx',
  'src/components/ImageMarquee.tsx',
  'src/components/Header.tsx',
  'src/components/CollectionShowcase.tsx',
  'src/components/CategoryGrid.tsx',
  'src/App.tsx'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/5F1517/gi, '4A2E2B');
    content = content.replace(/801416/gi, '4A2E2B');
    content = content.replace(/820C0F/gi, '4A2E2B');
    content = content.replace(/721013/gi, '4A2E2B');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced in ' + file);
  }
});
