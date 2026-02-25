import XLSX from 'xlsx';
import { readFileSync } from 'fs';

const filePath = '/Users/macbookair/Downloads/maricultor_profiles_rows (1).xlsx';
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Total de linhas:', data.length);
console.log('\nColunas encontradas:', Object.keys(data[0] || {}));
console.log('\nPrimeiras 3 linhas:');
console.log(JSON.stringify(data.slice(0, 3), null, 2));
