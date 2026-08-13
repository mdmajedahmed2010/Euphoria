const fs = require('fs');
const path = require('path');

const targetDirs = ['app', 'components', 'lib', 'store', 'prisma'];
const extensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.prisma', '.sql'];

const replacements = [
    { from: /Dressly By Nishat/gi, to: 'Sitara By Abida' },
    { from: /Dressly/gi, to: 'Sitara' },
    { from: /BIBAZ/gi, to: 'Sitara' },
    { from: /ড্রেসলি বাই নিশাত/gi, to: 'Sitara By Abida' },
    { from: /Sew In Style by Farzana/gi, to: 'Sitara By Abida' },
    { from: /Sew In Style/gi, to: 'Sitara' },
    { from: /01736-696614/gi, to: '01765-301286' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next') {
                processDirectory(fullPath);
            }
        } else {
            if (extensions.includes(path.extname(fullPath))) {
                let content = fs.readFileSync(fullPath, 'utf8');
                let updated = false;
                for (const rep of replacements) {
                    if (content.match(rep.from)) {
                        content = content.replace(rep.from, rep.to);
                        updated = true;
                    }
                }
                if (updated) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log(`Updated: ${fullPath}`);
                }
            }
        }
    }
}

targetDirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (fs.existsSync(fullDir)) {
        processDirectory(fullDir);
    }
});
console.log("Done.");
