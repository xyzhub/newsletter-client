import chalk from 'chalk';
import { getIssues, getIssueContent } from '../utils/files.js';
import { renderMarkdown } from '../utils/markdown.js';

// Remove post-processing regex, marked config should handle it now
// const NESTED_LIST_FIX_REGEX = /^(.*?:?)(\s{2,})(\u001b\[\d+m[*-]\s+\u001b\[\d+m.*)$/gm;
// const INDENT_FIX_REGEX = /^(\s{0,3})(\u001b\[\d+m[*-]\s+.*)$/gm;

export function readLatestIssue() {
  try {
    const files = getIssues();
    
    if (files.length === 0) {
      console.log(chalk.yellow('No issues found.'));
      return;
    }

    const latestFile = files[0];
    const issueNumber = latestFile.replace('.md', '');
    const content = getIssueContent(issueNumber);
    // Render directly, no post-processing needed
    const rendered = renderMarkdown(content);
    console.log('\n' + rendered);
  } catch (error) {
    console.error(chalk.red('Error reading latest issue:', error.message));
  }
} 