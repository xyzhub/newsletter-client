import readline from 'readline';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { getOrCreateUserId, getUserEmail, saveUserEmail } from '../utils/user.js';
import ora from 'ora';
import figlet from 'figlet';
import gradient from 'gradient-string';
import boxen from 'boxen';

function prompt(question, defaultValue = '') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => rl.question(question, (ans) => {
    rl.close();
    resolve(ans || defaultValue);
  }));
}

function displayHeader() {
  console.log('\n');
  console.log(
    gradient.pastel(
      figlet.textSync('Chat with the founder', { font: 'Standard', horizontalLayout: 'full' })
    )
  );
  console.log('\n');
}

async function multilinePrompt() {
  console.log(chalk.blue('Type your message below. When finished, press Enter twice.\n'));
  
  let message = '';
  let line;
  let lastLineEmpty = false;
  
  while (true) {
    line = await prompt(chalk.yellow('> '));
    
    if (line === '' && lastLineEmpty) {
      break;
    }
    
    lastLineEmpty = line === '';
    message += line + '\n';
  }
  
  return message.trim();
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

async function getEmailIfNeeded() {
  const existingEmail = getUserEmail();
  
  if (existingEmail) {
    return existingEmail;
  }
  
  console.log(chalk.blue('\nWe need your email to send you replies. This is only asked once.'));
  
  let email = '';
  while (!email) {
    email = await prompt(chalk.cyan('Your email: '));
    
    if (!email) {
      console.log(chalk.yellow('Email is required to continue.'));
      continue;
    }
    
    if (!isValidEmail(email)) {
      console.log(chalk.yellow('Please enter a valid email address.'));
      email = '';
      continue;
    }
  }
  
  const spinner = ora({
    text: 'Saving your email...',
    color: 'green'
  }).start();
  
  // Simulate a small delay for better UX
  await new Promise(resolve => setTimeout(resolve, 800));
  
  saveUserEmail(email);
  spinner.succeed('Email saved successfully!');
  
  return email;
}

async function chatCommand() {
  displayHeader();
  
  const userId = getOrCreateUserId();
  console.log(chalk.dim(`Session ID: ${userId.slice(0, 8)}...\n`));
  
  // Get email if it doesn't exist
  const userEmail = await getEmailIfNeeded();
  console.log(chalk.dim(`Replies will be sent to: ${userEmail}\n`));
  
  const message = await multilinePrompt();
  
  if (!message) {
    console.log(chalk.yellow('\nNo message to send. Chat cancelled.'));
    return;
  }
  
  // Show message preview
  console.log('\n' + boxen(message, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'cyan'
  }));
  
  const confirmation = await prompt(chalk.cyan('\nSend this message? (Y/n): '), 'Y');
  
  if (confirmation.toLowerCase() !== 'y' && confirmation !== '') {
    console.log(chalk.yellow('\nMessage cancelled.'));
    return;
  }

  const spinner = ora({
    text: 'Sending your message...',
    color: 'blue'
  }).start();

  const payload = {
    id: userId,
    email: userEmail,
    message,
  };

  try {
    const response = await fetch('https://your-webhook-or-endpoint-here.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('Network response was not ok');

    spinner.succeed('Message sent successfully!');
    console.log(
      boxen(chalk.green('We\'ll reply in your inbox soon. Thanks for reaching out!'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'green'
      })
    );
  } catch (err) {
    spinner.fail('Failed to send message');
    console.log(
      boxen(chalk.red('Something went wrong. Please try again later.'), {
        padding: 1,
        margin: 1,
        borderStyle: 'double',
        borderColor: 'red'
      })
    );
  }
}

export default chatCommand;
