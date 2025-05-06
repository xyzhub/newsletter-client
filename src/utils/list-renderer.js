import { marked } from 'marked';

/**
 * Custom list renderer for marked-terminal
 * Handles both ordered and unordered lists
 * 
 * @param {string} body - The list content
 * @param {boolean} ordered - Whether this is an ordered list
 * @returns {string} - Formatted list with colored markers
 */
export const customListRenderer = (body, ordered, chalkColor) => {
  // First, preserve the original indentation and spacing
  const originalLines = body.split('\n');
  const processedLines = [];
  let counter = 1; // Counter for ordered lists
  
  for (let i = 0; i < originalLines.length; i++) {
    const line = originalLines[i];
    
    // Skip empty lines but preserve them
    if (!line.trim()) {
      processedLines.push(line);
      continue;
    }
    
    // Handle ordered lists with numbers
    if (ordered) {
      const indentation = line.match(/^\s*/)[0];
      
      // Check if this is a list item (could be any marker in the source)
      if (line.match(/^\s*([*+-]|\d+\.)\s+/)) {
        const content = line.replace(/^\s*([*+-]|\d+\.)\s+/, '');
        processedLines.push(indentation + chalkColor(counter + '.') + ' ' + marked.parseInline(content));
        counter++; // Increment counter only for list items
      } else {
        // Not a list item, leave it as is
        processedLines.push(line);
      }
    } else {
      // For unordered lists, just color the bullet markers
      if (line.match(/^\s*[*+-]\s+/)) {
        const coloredLine = line.replace(/^(\s*)([*+-])\s+(.*)$/, (match, spaces, marker, content) => {
          return spaces + chalkColor(marker) + ' ' + marked.parseInline(content);
        });
        processedLines.push(coloredLine);
      } else if (line.match(/^\s*\d+\.\s+/)) {
        // Convert numbered items to bullets in unordered lists
        const coloredLine = line.replace(/^(\s*)\d+\.\s+(.*)$/, (match, spaces, content) => {
          return spaces + chalkColor('*') + ' ' + marked.parseInline(content);
        });
        processedLines.push(coloredLine);
      } else {
        // Not a list item, leave it as is
        processedLines.push(line);
      }
    }
  }
  
  // Join back into a string and return
  return processedLines.join('\n');
};

/**
 * Custom list item renderer for marked-terminal
 * Returns the text as is without modification
 * 
 * @param {string} text - The list item content
 * @returns {string} - Unmodified text
 */
export const customListItemRenderer = (text) => {
  return text;
}; 