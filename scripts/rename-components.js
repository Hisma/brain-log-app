const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directory containing UI components
const UI_COMPONENTS_DIR = path.resolve(__dirname, '../src/components/ui');
const SRC_DIR = path.resolve(__dirname, '../src');

// Function to check if a filename is PascalCase
function isPascalCase(filename) {
  const baseName = path.basename(filename, path.extname(filename));
  return /^[A-Z]/.test(baseName);
}

// Function to convert filename to lowercase
function toLowercase(filename) {
  const ext = path.extname(filename);
  const baseName = path.basename(filename, ext);
  return baseName.toLowerCase() + ext;
}

// Step 1: Find all PascalCase component files and create a mapping
console.log('Scanning for PascalCase component files...');
const componentFiles = fs.readdirSync(UI_COMPONENTS_DIR)
  .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'));

const fileMapping = {};
componentFiles.forEach(file => {
  if (isPascalCase(file)) {
    fileMapping[file] = toLowercase(file);
    console.log(`Found PascalCase file: ${file} -> ${toLowercase(file)}`);
  }
});

if (Object.keys(fileMapping).length === 0) {
  console.log('No PascalCase component files found. Exiting.');
  process.exit(0);
}

// Step 2: Find all source files that might import these components
console.log('\nScanning for source files with imports...');
function findSourceFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findSourceFiles(filePath, fileList);
    } else if (
      (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) &&
      !file.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

const sourceFiles = findSourceFiles(SRC_DIR);
console.log(`Found ${sourceFiles.length} source files to check for imports.`);

// Step 3: Update imports in all source files
console.log('\nUpdating imports in source files...');
let totalFilesUpdated = 0;

sourceFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  
  Object.entries(fileMapping).forEach(([oldFile, newFile]) => {
    const oldBaseName = path.basename(oldFile, path.extname(oldFile));
    const oldImportPath = `@/components/ui/${oldBaseName}`;
    const newImportPath = `@/components/ui/${oldBaseName.toLowerCase()}`;
    
    // Replace import paths
    const regex = new RegExp(`from ['"]${oldImportPath}['"]`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `from '${newImportPath}'`);
      hasChanges = true;
      console.log(`  Updated import in: ${path.relative(SRC_DIR, filePath)}`);
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    totalFilesUpdated++;
  }
});

console.log(`\nUpdated imports in ${totalFilesUpdated} files.`);

// Step 4: Rename the component files
console.log('\nRenaming component files...');
Object.entries(fileMapping).forEach(([oldFile, newFile]) => {
  const oldPath = path.join(UI_COMPONENTS_DIR, oldFile);
  const newPath = path.join(UI_COMPONENTS_DIR, newFile);
  
  // Check if the lowercase file already exists
  if (fs.existsSync(newPath) && oldPath !== newPath) {
    console.error(`Error: ${newFile} already exists. Cannot rename ${oldFile}.`);
    return;
  }
  
  try {
    // On case-insensitive file systems (like Windows or macOS), we need a temporary name
    const tempPath = path.join(UI_COMPONENTS_DIR, `_temp_${newFile}`);
    fs.renameSync(oldPath, tempPath);
    fs.renameSync(tempPath, newPath);
    console.log(`  Renamed: ${oldFile} -> ${newFile}`);
  } catch (error) {
    console.error(`  Error renaming ${oldFile} to ${newFile}: ${error.message}`);
  }
});

console.log('\nComponent renaming and import updating completed!');
console.log('\nSummary:');
console.log(`- ${Object.keys(fileMapping).length} component files renamed`);
console.log(`- ${totalFilesUpdated} source files updated with new imports`);
