import readline from 'readline';
import chalk from 'chalk';
import fetch from 'node-fetch';
import { getOrCreateUserId, getUserEmail, getUserName, saveUserInfo } from '../utils/user.js';
import { io } from 'socket.io-client';
import { randomUUID } from 'crypto';
import ora from 'ora';
import { handleSlashCommand } from './slashCommands.js';
import { log } from 'console';

const replyStyle = {
  box: chalk.green,
  quote: chalk.cyan,
  reply: chalk.reset,
  check: chalk.green,
  userName: chalk.blue.bold,
  founderName: chalk.magenta.bold,
};

// Simple readline prompt function
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// Validate email format
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// API endpoints
const API_ENDPOINT = process.env.API_ENDPOINT || 'https://newsletter.xyz.social/api/chat';
const MESSAGES_ENDPOINT = process.env.MESSAGES_ENDPOINT || 'https://newsletter.xyz.social/api/messages';
const SOCKET_ENDPOINT = process.env.SOCKET_ENDPOINT || 'https://localhost:3001';

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// Async sleep function
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Wait for reply using WebSockets (real-time updates)
async function waitForReplySocket(userId, messageId, maxWaitTimeSeconds = 30) {
  return new Promise((resolve) => {
    console.log(chalk.yellow('\nWaiting for reply via socket...'));
    console.log(chalk.dim('(Press Ctrl+C to exit at any time)'));
    
    // Animation frames for waiting spinner
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let frameIndex = 0;
    let animationInterval;
    let socket = null;
    
    // Setup timeout
    const timeout = setTimeout(() => {
      if (animationInterval) clearInterval(animationInterval);
      if (socket) socket.disconnect();
      process.stdout.write('\r' + ' '.repeat(50) + '\r');
      resolve({ found: false });
    }, maxWaitTimeSeconds * 1000);
    
    // Start spinner animation
    animationInterval = setInterval(() => {
      process.stdout.write(`\r${frames[frameIndex]} Waiting for reply...`);
      frameIndex = (frameIndex + 1) % frames.length;
    }, 100);
    
    // Connect to Socket.IO server
    try {
      socket = io(SOCKET_ENDPOINT, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 3,
        timeout: 10000,
        reconnectionDelay: 1000
      });
      
      socket.on('connect', () => {
        console.log('\nConnected to socket server!');
        
        // Register with userId
        socket.emit('register', { userId });
        
        // Subscribe to specific message
        socket.emit('subscribe', { messageId });
      });
      
      socket.on('connect_error', (error) => {
        console.log(`\nSocket connection error: ${error.message}`);
        console.log('Falling back to polling...');
        clearTimeout(timeout);
        clearInterval(animationInterval);
        socket.disconnect();
        
        // Wait a moment before resolving to allow the message to be visible
        setTimeout(() => {
          resolve({ fallback: true });
        }, 1500);
      });
      
      socket.on('registered', (data) => {
        console.log('Registered with socket server');
      });
      
      socket.on('message_reply', (data) => {
        if (data.messageId === messageId && data.reply) {
          clearTimeout(timeout);
          clearInterval(animationInterval);
          socket.disconnect();
          
          // Clear the spinner line
          process.stdout.write('\r' + ' '.repeat(50) + '\r');
          
          resolve({
            found: true,
            reply: data.reply,
            repliedAt: data.timestamp
          });
        }
      });
      
      socket.on('new_reply', (data) => {
        if (data.messageId === messageId && data.reply) {
          clearTimeout(timeout);
          clearInterval(animationInterval);
          socket.disconnect();
          
          // Clear the spinner line
          process.stdout.write('\r' + ' '.repeat(50) + '\r');
          
          resolve({
            found: true,
            reply: data.reply,
            repliedAt: data.timestamp
          });
        }
      });
      
      socket.on('error', (error) => {
        console.log('\nSocket connection error, falling back to polling...');
        clearTimeout(timeout);
        clearInterval(animationInterval);
        socket.disconnect();
        
        // Wait a moment before resolving to allow the message to be visible
        setTimeout(() => {
          resolve({ fallback: true });
        }, 1500);
      });
      
      socket.on('disconnect', () => {
        clearTimeout(timeout);
        if (animationInterval) clearInterval(animationInterval);
      });
    } catch (err) {
      console.error('Error setting up socket connection:', err);
      clearTimeout(timeout);
      clearInterval(animationInterval);
      
      // Wait a moment before resolving to allow the message to be visible
      setTimeout(() => {
        resolve({ fallback: true });
      }, 1500);
    }
  });
}

// Simple function to wait for a reply by checking messages
async function waitForMessageReply(messageId, userId, waitTime = 30000) {
  const startTime = Date.now();
  const spinner = ora('Waiting for reply...').start();
  
  while (Date.now() - startTime < waitTime) {
    try {
      const response = await fetch(`${MESSAGES_ENDPOINT}?userId=${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }
      
      const data = await response.json();
      // console.log(userId, data)
      
      // Find the reply message that references our original message
      const reply = data.messages.find(msg =>
        msg.replyTo && msg.replyTo === messageId
      );

      if (reply) {
        spinner.stop();
        return reply;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error checking for reply:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  spinner.fail('No reply received within time limit');
  return null;
}

// Fetch previous messages (keep for inbox, but remove debug logs here)
async function fetchMessages(userId) {
  try {
    const response = await fetch(`${MESSAGES_ENDPOINT}?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data.messages || [];
    }
    return [];
  } catch (error) {
    return [];
  }
}

// Display previous messages
function displayMessages(messages, systemColor) {
  if (messages.length === 0) {
    console.log(`${systemColor('System')}: No previous messages found.`);
    return;
  }
  
  console.log(`${systemColor('System')}: Your previous messages:`);
  console.log('───────────────────────────────────────');
  
  // Display last 5 messages
  const recentMessages = messages.slice(0, 5);
  
  recentMessages.forEach((msg, index) => {
    console.log(`${chalk.dim(formatDate(msg.createdAt))}`);
    console.log(`${chalk.cyan('You')}: ${msg.content}`);
    
    if (msg.reply) {
      console.log(`${chalk.green('Reply')}: ${msg.reply}`);
    } else if (msg.status === 'pending') {
      console.log(`${chalk.yellow('Status')}: Awaiting reply`);
    }
    
    if (index < recentMessages.length - 1) {
      console.log('───────────────────────────────────────');
    }
  });
  
  if (messages.length > 5) {
    console.log(`\n${systemColor('System')}: Showing 5 of ${messages.length} messages.`);
  }
  
  console.log('───────────────────────────────────────');
}

// Parse command line args
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    useSocket: args.includes('--socket') || args.includes('-s')
  };
  return options;
}

// Function to check if API is available
async function checkAPIConnection() {
  try {
    let fetchFunction = globalThis.fetch || fetch;
    
    console.log('Checking API...');
    try {
      const response = await fetchFunction(API_ENDPOINT.replace('/chat', '/health'), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      }).catch(err => {
        console.error('API health check failed:', err.message);
        return { ok: false, status: 'error', message: err.message };
      });
      
      if (response.ok) {
        return {
          available: true,
          status: response.status,
          endpoint: 'primary'
        };
      }
    } catch (error) {
      console.error('Error checking API:', error);
    }
    
    return { 
      available: false, 
      error: 'API endpoint failed health check'
    };
  } catch (error) {
    console.error('Error in API connection check:', error);
    return { available: false, error: error.message };
  }
}

// Main chat command function
export async function chatCommand() {
  try {
    // Get user info if not already saved
    let email = await getUserEmail();
    let name = await getUserName();
    const userId = getOrCreateUserId();

    if (!email || !name) {
      console.log(chalk.cyan('\nPlease provide your information:'));
      
      name = await prompt('Name: ');
      email = await prompt('Email: ');
      
      while (!isValidEmail(email)) {
        console.log(chalk.red('Invalid email format'));
        email = await prompt('Email: ');
      }
      
      await saveUserInfo(name, email);
    }

    // Clean start: do NOT show previous messages or debug logs

    console.log(chalk.cyan('\nEnter your message (press Enter twice to exit):'));
    let lastMessage = '';

    while (true) {
      const message = await prompt('> ');

      // Exit if user presses Enter twice
      if (!message && !lastMessage) {
        console.log(chalk.yellow('\nExiting chat...'));
        break;
      }

      // Handle slash commands
      if (await handleSlashCommand(message)) {
        lastMessage = '';
        continue;
      }

      // Save message for next comparison
      lastMessage = message;

      if (message) {
        // Show message with timestamp, user name, and checkmark immediately
        const timestamp = new Date().toLocaleTimeString();
        console.log(
          chalk.dim(`[${timestamp}] `) +
          replyStyle.userName(`${name}: `) +
          chalk.white(message) + ' 	' +
          chalk.green('✓')
        );

        try {
          const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user: {
                id: userId,
                email,
                name
              },
              content: message
            })
          });

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          
          // Wait for reply using the existing function
          const replyResult = await waitForMessageReply(data.messageId, userId);
          
          if (replyResult) {
            const replyUserName =
              (typeof replyResult === 'object' && replyResult.metadata && replyResult.metadata.senderName) ? replyResult.metadata.senderName
              : (typeof replyResult === 'object' && replyResult.user && replyResult.user.name) ? replyResult.user.name
              : (typeof replyResult === 'object' && replyResult.userName) ? replyResult.userName
              : 'Someone';

            const replyContent = typeof replyResult === 'object' && replyResult.content ? replyResult.content : replyResult;
            const replyTimestamp = replyResult.createdAt
              ? new Date(replyResult.createdAt).toLocaleTimeString()
              : new Date().toLocaleTimeString();

            console.log(
              chalk.dim(`[${replyTimestamp}] `) +
              replyStyle.founderName(`${replyUserName}: `) +
              replyStyle.reply(replyContent) + ' \t' +
              replyStyle.check('✓')
            );
          } else {
            console.log(chalk.yellow('\nNo reply received yet'));
          }
        } catch (error) {
          console.error(chalk.red('Error:'), error.message);
        }
      }
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
  }
}

export default chatCommand;