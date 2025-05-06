import chalk from 'chalk';
import { getIssueContent } from '../utils/files.js';
import { renderMarkdown } from '../utils/markdown.js';

// Remove post-processing regex, marked config should handle it now
// const NESTED_LIST_FIX_REGEX = /^(.*?:?)(\s{2,})(\u001b\[\d+m[*-]\s+\u001b\[\d+m.*)$/gm;
// const INDENT_FIX_REGEX = /^(\s{0,3})(\u001b\[\d+m[*-]\s+.*)$/gm;

export function readIssue(number) {
  try {
    const content = getIssueContent(number);
    if (content) {
      // Render directly, no post-processing needed
      const rendered = renderMarkdown(content);
      console.log('\n' + rendered);
    } else {
      console.log(chalk.red(`Issue #${number} not found.`));
    }
  } catch (error) {
    console.error(chalk.red('Error reading issue:', error.message));
  }
} 