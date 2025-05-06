import chalk from 'chalk';
import figlet from 'figlet';
import boxen from 'boxen';

export function createWelcomeBanner() {
  return boxen(
    chalk.cyan(
      figlet.textSync('Founder\'s Terminal', {
        font: 'Standard',
        horizontalLayout: 'full',
        verticalLayout: 'default'
      })
    ) + '\n\n' +
    chalk.gray('Newsletter by XYZ') + '\n',
    {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    },
  );
} 