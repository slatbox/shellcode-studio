const vscode = require('vscode');
const { exec, execSync } = require('child_process');
const fs = require('fs')
function assembly(asm_file_path) {
    //clear old file
    var old_obj_file_path = asm_file_path.split('.')[0] + '.obj'
    if(fs.existsSync(old_obj_file_path) == true)
        fs.rmSync(old_obj_file_path)

    // generate obj file
    var cmd = "nasm -f win32 " + asm_file_path
    try {
        execSync(cmd)
    } catch (error) {
        vscode.window.showErrorMessage('A exception happened in assembly process.See error messages in file asm.log')
        var folder_path = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(asm_file_path)).uri.fsPath
        fs.writeFileSync(folder_path + '\\asm.log', error.message)

    }

}
function cutObjFile(obj_file, obj_file_path) {
    var new_file_array = []
    var start_flag = 0

    for (let index = 0; index < obj_file.length; index++) {
        const element = obj_file[index];
        if (element == 96) {
            start_flag = 1
            continue
        }
        if (element == 46) {
            //detect ".file" end flag
            var keywords = [102, 105, 108, 101]
            var same = 1
            for (var i = 0; i < 4; i++)
                if (obj_file[index + i + 1] != keywords[i])
                    same = 0
            if (same == 1)
                break
        }

        if (start_flag == 1)
            new_file_array.push(element)
    }
    
    var shell_code_file = new Uint8Array(new_file_array)
    var shell_code_path = obj_file_path.split('.')[0] + '.shc'
    fs.writeFileSync(shell_code_path, shell_code_file)

    var clear = vscode.workspace.getConfiguration().get('shellcode-studio.clearTemFile');
    if(clear == true)
        fs.rmSync(obj_file_path)
    vscode.window.showInformationMessage('generated shellcode successfully!');

    console.log('waiting for shc file')


}

function genShellcode(asm_file_path) {

    //assembly asm file to obj file
    var obj_file_path = asm_file_path.split('.')[0] + ".obj"
    assembly(asm_file_path)
    var obj_file = fs.readFileSync(obj_file_path)
    cutObjFile(obj_file, obj_file_path)


}
async function genCFile(asm_file_path) {
    var dir = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(asm_file_path)).uri.fsPath
    var add_nop = vscode.workspace.getConfiguration().get('shellcode-studio.addNopMargin');
    var shellcode = fs.readFileSync(asm_file_path.split('.')[0] + ".shc").toString()
    // if(add_nop == true)
    //     shellcode = '����' + shellcode + '����'
    var shellcode = "char *shellcode=\"" + shellcode + "\";\n"
    var main = "int main(){\n\tasm(\"push %0;ret;\"\n\t:\n\t:\"r\"(shellcode));\n\treturn 0;\n}"
    fs.writeFileSync(dir + "\\dbg.c", shellcode + main)
}

async function startDBG(asm_file_path) {
    var dir = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(asm_file_path)).uri.fsPath
    genShellcode(asm_file_path)
    genCFile(asm_file_path)
    var dbg_file_path = dir + "\\dbg.c"
    var exe_path = dir + "\\dbg.exe"
    var cmd = "gcc " + dbg_file_path + " -o " + exe_path
    try {
        execSync(cmd)
    } catch (error) {
        vscode.window.showErrorMessage('A exception happened in assembly process.See error messages in file asm.log')
        var folder_path = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(asm_file_path)).uri.fsPath
        fs.writeFileSync(folder_path + '\\asm.log', error.message)
    }

    var clear = vscode.workspace.getConfiguration().get('shellcode-studio.clearTemFile');
    if(clear == true)
        fs.rmSync(dbg_file_path)

    var ollydbg_path = vscode.workspace.getConfiguration().get('shellcode-studio.ollydbgPath');
    var ollydbg_cmd = ollydbg_path + " " + exe_path
    while (fs.existsSync(exe_path) == false)
        console.log('waiting')
    try {
        execSync(ollydbg_cmd)
    } catch (error) {
        vscode.window.showErrorMessage('A exception happened in assembly process.See error messages in file asm.log')
        var folder_path = vscode.workspace.getWorkspaceFolder(vscode.Uri.file(asm_file_path)).uri.fsPath
        fs.writeFileSync(folder_path + '\\asm.log', error.message)
    }
}
module.exports = {
    assembly,
    cutObjFile,
    genShellcode,
    genCFile,
    startDBG
}
