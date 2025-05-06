import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const issuesDir = path.join(__dirname, '../../issues');

export function ensureIssuesDir() {
  if (!fs.existsSync(issuesDir)) {
    fs.mkdirSync(issuesDir, { recursive: true });
  }
}

export function getIssues() {
  return fs.readdirSync(issuesDir)
    .filter(file => file.endsWith('.md'))
    .sort((a, b) => b.localeCompare(a));
}

export function getIssueContent(number) {
  const filePath = path.join(issuesDir, `${number}.md`);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return null;
}

export function createNewIssue() {
  const files = getIssues()
    .map(file => parseInt(path.basename(file, '.md')));
  
  const nextNumber = files.length > 0 ? Math.max(...files) + 1 : 1;
  const template = `# Issue ${nextNumber}

## Introduction

## Main Content

## Conclusion

> Published on ${new Date().toISOString().split('T')[0]}
`;

  const filePath = path.join(issuesDir, `${nextNumber}.md`);
  fs.writeFileSync(filePath, template);
  return nextNumber;
} 