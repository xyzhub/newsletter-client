import chalk from 'chalk';
import { saveUserInfo, getUserData } from '../utils/user.js';

export async function handleSlashCommand(message, context = {}) {
  if (!message.startsWith('/')) return false;
  const [command, ...args] = message.slice(1).split(' ');
  switch (command) {
    case 'help':
      console.log(chalk.cyan('Available commands: /help, /exit, /inbox, /setname, /clear'));
      return true;
    case 'exit':
      console.log(chalk.yellow('Exiting chat...'));
      process.exit(0);
    case 'inbox':
      try {
        const { default: inboxCommand } = await import('./inbox.js');
        await inboxCommand();
      } catch (e) {
        console.log(chalk.red('Inbox command not available.'));
      }
      return true;
    case 'clear':
      console.clear();
      return true;
    case 'setname':
      if (args.length) {
        let email = context.email;
        if (!email) {
          const userData = getUserData();
          email = userData?.email;
        }
        if (email) {
          await (context.saveUserInfo || saveUserInfo)(args.join(' '), email);
          console.log(chalk.green('Name updated to', args.join(' ')));
        } else {
          console.log(chalk.red('Could not determine your email.'));
        }
      } else {
        console.log(chalk.yellow('Usage: /setname <newname>'));
      }
      return true;
    // Add more commands here as needed
    default:
      console.log(chalk.red(`Unknown command: /${command}`));
      return true;
  }
} 