const { createCanvas, loadImage } = require('canvas');
const colors = require('./colors.json'); 
const {stdout} = require('process');
stdout.columns ??= 64;
stdout.rows ??= 64;
const fs = require('fs');

const args = process.argv[0].includes('/node') ? process.argv.slice(2) : process.argv.slice(1);
const pathTo = args[0];
const scaleTo = (args[1] || '')
    .toLowerCase()
    .split('x')
    .map(dig => Number(dig.trim()));
if (args < 1) 
    throw 'Cant perform conversion without an input file';
(async () => {
    console.log('\x1b[H\x1b[2JLoading input image.');
    const inp = await loadImage(pathTo);
    const width = scaleTo[0] ?? inp.width;
    if (scaleTo.length < 2)
        scaleTo[1] = Math.ceil((inp.height * (scaleTo[0] / inp.width)) / 2);
    const height = scaleTo[1] ?? Math.ceil(inp.height / 2);
    const converter = createCanvas(width, height);
    const ctx = converter.getContext('2d');
    ctx.drawImage(inp, 0,0, width, height);
    console.log('\x1b[H\x1b[2JClamping image colors.');
    const pixels = ctx.getImageData(0,0, width, height);
    let demo = '';
    let text = '';
    for (let i = 0; i < pixels.data.length; i += 4) {
        const per = i / pixels.data.length
        console.log(`\x1b[2;1H\x1b[0m[${'='.repeat(Math.floor(per * 48))}${' '.repeat(48 - Math.floor(per * 48))}] ${Math.ceil(per * 100)}`);
        const px = pixels.data.slice(i, i +3);
        const sorted = colors
            .sort((a,b) => (
                (Math.abs(a[0][0] - px[0]) + Math.abs(a[0][1] - px[1]) + Math.abs(a[0][2] - px[2])) -
                (Math.abs(b[0][0] - px[0]) + Math.abs(b[0][1] - px[1]) + Math.abs(b[0][2] - px[2]))
            ));
        demo += `\x1b[48;2;${sorted[0][0].join(';')}m \x1b[0m`;
        const code = text.lastIndexOf('m');
        if (text.slice(code - sorted[0][1].length +2, code) === sorted[0][1].slice(0, -2))
            text += sorted[0][1].at(-1);
        else
            text += sorted[0][1];
        if (!((i +4) % (width * 4))) {
            text += '\n';
            demo += '\n';
        }
        console.log(demo);
    }
    fs.writeFileSync('./converted.txt', text);
    console.log('wrote output to ./converted.txt');
})(); 