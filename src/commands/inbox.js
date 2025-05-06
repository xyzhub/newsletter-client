import chalk from 'chalk';
import fetch from 'node-fetch';
import { getOrCreateUserId, getUserName } from '../utils/user.js';

const MESSAGES_ENDPOINT = process.env.MESSAGES_ENDPOINT || 'https://newsletter.xyz.social/api/messages';

const replyStyle = {
  box: chalk.green,
  quote: chalk.cyan,
  reply: chalk.greenBright,
  check: chalk.yellow,
  nameSelf: chalk.blue.bold,
  nameOther: chalk.magenta.bold,
  userName: chalk.white,
  founderName: chalk.white,
};

async function fetchMessages(userId) {
  try {
    const response = await fetch(`${MESSAGES_ENDPOINT}?userId=${userId}`);
    if (response.ok) {
      const data = await response.json();
      return data.messages || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

function displayInbox(messages, yourName) {
  // Group replies under their original messages
  const messageMap = {};
  messages.forEach(msg => {
    // Use replyTo field for reply relationships, fallback to metadata.replyTo for old messages
    const parentId = msg.replyTo || msg.metadata?.replyTo;
    if (parentId) {
      // It's a reply, group under original
      if (!messageMap[parentId]) messageMap[parentId] = { replies: [] };
      messageMap[parentId].replies = messageMap[parentId].replies || [];
      messageMap[parentId].replies.push(msg);
    } else {
      // It's an original message
      messageMap[msg.id] = messageMap[msg.id] || {};
      messageMap[msg.id].message = msg;
      messageMap[msg.id].replies = messageMap[msg.id].replies || [];
    }
  });

  // Display all original messages and their replies
  Object.values(messageMap).forEach(({ message, replies }) => {
    if (!message) return;
    const timestamp = new Date(message.createdAt).toLocaleTimeString();
    console.log(
      chalk.dim(`[${timestamp}] `) +
      replyStyle.userName(`${message.user?.name || yourName}: `) +
      chalk.white(message.content) + ' \t' +
      replyStyle.check('✓')
    );
    if (replies && replies.length > 0) {
      replies.forEach(reply => {
        const replyUserName = reply.user?.name || reply.metadata?.senderName || 'Someone';
        const replyTimestamp = reply.createdAt
          ? new Date(reply.createdAt).toLocaleTimeString()
          : new Date().toLocaleTimeString();
        console.log(
          chalk.dim(`[${replyTimestamp}] `) +
          replyStyle.founderName(`${replyUserName}: `) +
          replyStyle.reply(reply.content) + ' \t' +
          replyStyle.check('✓')
        );
      });
    }
  });
}

export default async function inboxCommand() {
  const userId = getOrCreateUserId();
  const yourName = await getUserName();
  const messages = await fetchMessages(userId);
  if (messages.length === 0) {
    console.log(chalk.yellow('No messages found.'));
    return;
  }
  displayInbox(messages, yourName);
} 