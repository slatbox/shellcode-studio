// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const genAPI = require('./GeneratorAPI')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "shellcode-studio" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('shellcode-studio.genShellcode', function () {
		// The code you place here will be executed every time your command is executed
		var current_doc = vscode.window.activeTextEditor.document.fileName
		genAPI.genShellcode(current_doc)
	});
	let disposable2 = vscode.commands.registerCommand('shellcode-studio.genGdbExe', function () {
		// The code you place here will be executed every time your command is executed
		var current_doc = vscode.window.activeTextEditor.document.fileName
		genAPI.genCFile(current_doc)
	});
	let disposable3 = vscode.commands.registerCommand('shellcode-studio.startGdb', function () {
		// The code you place here will be executed every time your command is executed
		var current_doc = vscode.window.activeTextEditor.document.fileName
		genAPI.startDBG(current_doc)
	});
	
	context.subscriptions.push(disposable);
	context.subscriptions.push(disposable2);
	context.subscriptions.push(disposable3);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
