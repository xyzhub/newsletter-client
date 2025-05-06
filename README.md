# Founder's Terminal

A beautiful terminal-based newsletter reader that allows you to read and manage your newsletter issues directly from the command line.

## Installation

### Using npm
```bash
npm install -g @xyz/founders-terminal
```

### From source
1. Clone this repository:
```bash
git clone https://github.com/yourusername/founders-terminal.git
cd founders-terminal
```

2. Install dependencies:
```bash
npm install
```

3. Install globally:
```bash
npm install -g .
```

## Usage

After installation, you can use the following commands:

### List all issues
```bash
founders list
```

### Read a specific issue
```bash
founders read <number>
```

### Read the latest issue
```bash
founders latest
```

### Create a new issue
```bash
founders new
```

## Features

- Beautiful terminal formatting with colors and styling
- Easy navigation through issues
- Markdown support with proper formatting
- Automatic issue numbering
- Template-based issue creation

## Directory Structure

- `issues/` - Directory containing all newsletter issues in markdown format
- `bin/index.js` - Main CLI application
- `package.json` - Project configuration and dependencies

## Contributing

Feel free to submit issues and enhancement requests!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find this project helpful, please give it a star on GitHub! 