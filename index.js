const fs = require('fs').promises;
const path = require('path')
const {argv} = require('yargs');

var AdmZip = require('adm-zip');

async function rebuildCbzs(inputPath) {
    try {
        var stat = await fs.stat(inputPath);
    } catch (err) {
        console.error(`Does not exist ${inputPath}`);
    }
    
    if (stat.isDirectory()) {
        return Promise.all((await fs.readdir(inputPath))
            .map(child => rebuildCbzs(path.join(inputPath, child))))
    } else {
        const {ext, dir, name } = path.parse(inputPath);

        if (['.cbz'].includes(ext)) {
            console.log(`Rebuilding cbz file: ${inputPath}`);
            var zip = new AdmZip(inputPath);
            const extractDir = path.format({
                dir,
                name
            });
            zip.extractAllTo(extractDir, true);
            
            try {
                await fs.rmdir(path.join(extractDir, '__MACOSX'), {recursive: true})
            } catch (err) {}

            zip = new AdmZip();
            zip.addLocalFolder(extractDir);
            zip.writeZip(inputPath);
        }
    }   
}

rebuildCbzs(argv._[0]);

