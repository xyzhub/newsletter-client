import { marked } from 'marked';
import { markedTerminal } from 'marked-terminal';
import chalk from 'chalk';
import { customListRenderer, customListItemRenderer } from './list-renderer.js';

// Configure marked with terminal renderer and overrides
marked.use(markedTerminal({
  // Basic styling
  gfm: true,
  heading: chalk.cyan.bold,
  strong: chalk.bold,
  em: chalk.italic,
  blockquote: chalk.gray,
  code: chalk.gray,
  paragraph: chalk.white,

  // Link handling
  link: chalk.blue,
  href: chalk.blue.underline,

  // Image handling
  image: function(href, title, text) {
    return chalk.blue(`[Image: ${text || 'untitled'}]`) + chalk.blue.underline(` (${href})`);
  },

  // List styling
  list: (body, ordered) => customListRenderer(body, ordered, chalk.magenta),
  listitem: chalk.reset,
  // listitem: //customListItemRenderer,

  tab: 2,
  unescape: true
}));

export function renderMarkdown(content) {
  return marked.parse(content);
}