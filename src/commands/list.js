import chalk from 'chalk';
import { getIssues } from '../utils/files.js';

export function listIssues() {
  try {
    const files = getIssues();
    
    if (files.length === 0) {
      console.log(chalk.yellow('No issues found.'));
      return;
    }

    console.log(chalk.cyan.bold('\nAvailable Issues:\n'));
    files.forEach((file) => {
      const issueNumber = file.replace('.md', '');
      const content = getIssueContent(issueNumber);
      const title = content.split('\n')[0].replace('# ', '');
      console.log(`${chalk.gray(`[${issueNumber}]`)} ${chalk.bold(title)}`);
    });
  } catch (error) {
    console.error(chalk.red('Error reading issues:', error.message));
  }
} 