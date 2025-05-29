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
    } else if (file.endsWith('.scss') && file !== '_color-functions.scss') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

// SCSS içeriğini güncelleme fonksiyonu
function updateScssImports(filePath, content) {
  // Hatalı import'u kontrol et
  if (content.includes('@use \'../../../scss/color-functions\'')) {
    // Dosyanın src klasörüne göre derinliğini hesapla
    const relativePath = path.relative(path.dirname(filePath), path.join(__dirname, 'src', 'scss'));
    const updatedImport = `@use '${relativePath.replace(/\\/g, '/')}/color-functions' as cf;`;
    
    // Eski import'u yenisiyle değiştir
    const updatedContent = content.replace(/@use\s+'[^']*\/scss\/color-functions'\s+as\s+cf;/g, updatedImport);
    
    return updatedContent;
  }
  
  return content;
}

// Ana fonksiyon
function fixScssImports() {
  const srcDir = path.join(__dirname, 'src');
  const scssFiles = findScssFiles(srcDir);
  
  console.log(`Toplam ${scssFiles.length} SCSS dosyası bulundu.`);
  
  let updatedCount = 0;
  
  scssFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Import ifadesi içeriyor mu kontrol et
    if (content.includes('@use') && content.includes('color-functions')) {
      const updatedContent = updateScssImports(filePath, content);
      
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
fixScssImports();
