const fs = require('fs');
const path = require('path');

// SCSS dosyalarını bulmak için recursive fonksiyon
function findScssFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findScssFiles(filePath, fileList);
    } else if (file.endsWith('.scss')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// SCSS içeriğini güncelleme fonksiyonu
function updateScssContent(content) {
  // darken() fonksiyonunu güncelle
  let updatedContent = content.replace(/darken\(\s*([^,]+),\s*([^)]+)\)/g, 'cf.custom-darken($1, $2)');
  
  // lighten() fonksiyonunu güncelle
  updatedContent = updatedContent.replace(/lighten\(\s*([^,]+),\s*([^)]+)\)/g, 'cf.custom-lighten($1, $2)');
  
  // Dosyanın başına import ekle (eğer yoksa)
  if (!updatedContent.includes('@use \'scss/color-functions\'')) {
    updatedContent = '@use \'../../../scss/color-functions\' as cf;\n\n' + updatedContent;
  }
  
  return updatedContent;
}

// Ana fonksiyon
function fixScssFiles() {
  const srcDir = path.join(__dirname, 'src');
  const scssFiles = findScssFiles(srcDir);
  
  console.log(`Toplam ${scssFiles.length} SCSS dosyası bulundu.`);
  
  let updatedCount = 0;
  
  scssFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // darken veya lighten fonksiyonu içeriyor mu kontrol et
    if (content.includes('darken(') || content.includes('lighten(')) {
      const updatedContent = updateScssContent(content);
      
      // Eğer içerik değiştiyse dosyayı güncelle
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        updatedCount++;
        console.log(`Güncellendi: ${filePath}`);
      }
    }
  });
  
  console.log(`Toplam ${updatedCount} dosya güncellendi.`);
}

// Scripti çalıştır
fixScssFiles();
