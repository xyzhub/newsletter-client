#!/usr/bin/env node

import { Command } from 'commander';
import { ensureIssuesDir } from '../src/utils/files.js';
import { createWelcomeBanner } from '../src/utils/banner.js';
import { listIssues } from '../src/commands/list.js';
import { readIssue } from '../src/commands/read.js';
import { readLatestIssue } from '../src/commands/latest.js';
import { createIssue } from '../src/commands/new.js';
import chatCommand from '../src/commands/chat.js';
import inboxCommand from '../src/commands/inbox.js';

const program = new Command();

// Ensure issues directory exists
ensureIssuesDir();

// Render welcome banner
console.log(createWelcomeBanner());

// Command: list
program
  .command('list')
  .description('List all available issues')
  .action(listIssues);

// Command: read <number>
program
  .command('read <number>')
  .description('Read a specific issue by number')
  .action(readIssue);

// Command: latest
program
  .command('latest')
  .description('Read the latest issue')
  .action(readLatestIssue);

// Command: new
program
  .command('new')
  .description('Create a new issue')
  .action(createIssue);

// Command: chat
program
  .command('chat')
  .description('Chat with the newsletter team')
  .action(chatCommand);

program.parse(process.argv);

if (program.args.length > 0) {
  const cmd = program.args[0];
  if (cmd === 'inbox') {
    await inboxCommand();
    process.exit(0);
  }
}
