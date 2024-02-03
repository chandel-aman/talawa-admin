#!/usr/bin/env node

import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const scanEntireRepo = args.includes('--scan-entire-repo');

console.log('Checking for localStorage usage...');

const getModifiedFiles = () => {
  try {
    // If --scan-entire-repo flag is provided, get all TypeScript files in the repository
    if (scanEntireRepo) {
      const result = execSync('git ls-files | grep ".tsx\\?$"', {
        encoding: 'utf-8',
      });
      return result.trim().split('\n');
    }

    // Otherwise, get only modified files
    const result = execSync('git diff --cached --name-only', {
      encoding: 'utf-8',
    });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Error fetching modified files:', error.message);
    process.exit(1);
  }
};

const files = getModifiedFiles();

const filesWithLocalStorage = [];

const checkLocalStorageUsage = (file) => {
  console.log(`Checking file: ${file}`);
  if (!file) {
    return;
  }

  const scriptPath = path.resolve(new URL(import.meta.url).pathname);

  if (
    file === scriptPath ||
    path.basename(file) === 'check-localstorage-usage.js'
  ) {
    return;
  }

  try {
    // Check if the file exists
    if (existsSync(file)) {
      const content = readFileSync(file, 'utf-8');

      if (
        content.includes('localStorage.getItem') ||
        content.includes('localStorage.setItem') ||
        content.includes('localStorage.removeItem')
      ) {
        filesWithLocalStorage.push(file);
      }
    } else {
      console.log(`File ${file} does not exist.`);
    }
  } catch (error) {
    console.error(`Error reading file ${file}:`, error.message);
  }
};

files.forEach(checkLocalStorageUsage);

if (filesWithLocalStorage.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', '\nError: Found usage of localStorage');
  console.error('\nFiles with localStorage usage:');
  filesWithLocalStorage.forEach((file) => console.error(file));

  console.info(
    '\x1b[34m%s\x1b[0m',
    '\nInfo: Consider using custom hook functions.'
  );
  console.info(
    'Please use the getItem, setItem, and removeItem functions provided by the custom hook useLocalStorage.\n'
  );

  process.exit(1);
}