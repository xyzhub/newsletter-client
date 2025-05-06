# Newsletter CLI

A beautiful terminal-based newsletter reader that allows you to read and manage your newsletter issues directly from the command line.

## Installation

### Using npm
```bash
npm install -g @xyz/newsletter
```

### From source
1. Clone this repository:
```bash
git clone https://github.com/xyzhub/newsletter-client.git
cd newsletter-client
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
newsletter list
```

### Read a specific issue
```bash
newsletter read <number>
```

### Read the latest issue
```bash
newsletter latest
```

### Create a new issue
```bash
newsletter new
```

## Features

- Beautiful terminal formatting with colors and styling
- Easy navigation through issues
- Markdown support with proper formatting
- Automatic issue numbering
- Template-based issue creation

## Troubleshooting

If you encounter any issues with the `newsletter` command, try these solutions:

### Command Not Found
If you get a "command not found" error after installation:

1. Check if npm's global bin directory is in your PATH:
```bash
echo $PATH
```

2. Find npm's global bin directory:
```bash
npm config get prefix
```

3. Add the global bin directory to your PATH:

For Bash/Zsh (add to ~/.bashrc or ~/.zshrc):
```bash
export PATH="$(npm config get prefix)/bin:$PATH"
```

For Windows (PowerShell):
```powershell
$env:Path += ";$(npm config get prefix)\bin"
```

4. Reload your shell configuration:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

### Permission Issues
If you get permission errors:

1. Try installing with sudo (Unix/Mac):
```bash
sudo npm install -g @xyz/newsletter
```

2. Or fix npm permissions:
```bash
sudo chown -R $USER:$(id -gn $USER) $(npm config get prefix)/{lib/node_modules,bin,share}
```

### Node.js Version
Ensure you have Node.js version 14 or higher:
```bash
node --version
```

If your version is lower, update Node.js from [nodejs.org](https://nodejs.org/).

### Manual Installation
If automatic installation fails:

1. Install the package locally:
```bash
npm install @xyz/newsletter
```

2. Run it using npx:
```bash
npx newsletter <command>
```

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

If you encounter any issues not covered in the troubleshooting guide, please:
1. Check the [GitHub Issues](https://github.com/xyzhub/newsletter-client/issues)
2. Create a new issue if your problem isn't already reported
3. Include your operating system, Node.js version, and the exact error message 