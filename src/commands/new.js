import chalk from 'chalk';
import { createNewIssue } from '../utils/files.js';

export function createIssue() {
  try {
    const nextNumber = createNewIssue();
    console.log(chalk.green(`Created new issue #${nextNumber}`));
    console.log(chalk.gray('Edit the file to add your content.'));
  } catch (error) {
    console.error(chalk.red('Error creating new issue:', error.message));
  }
} 