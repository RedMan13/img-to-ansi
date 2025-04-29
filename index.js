const { createCanvas, loadImage } = require('canvas');
const parseArgs = require('./argument-parser.js');
const colors = require('./colors.json'); 
const {stdout} = require('process');
stdout.columns ??= 64;
stdout.rows ??= 64;
const fs = require('fs');
const path = require('path');

function toTimeOrder(sec) {
    if (sec < 1) return `${sec * 1000} Milliseconds`;
    if (sec < 60) return `${sec} Seconds`;
    if (sec < 3600) return `${sec / 60} Minutes`;
    if (sec < 86400) return `${sec / 3600} Hours`;
    if (sec < 31536000) return `${sec / 86400} Days`;
    return `${sec / 31536000} Years`;
}
const args = parseArgs({
	image: [['default', 'i', 'src'], null, 'The image to convert'],
	width: [['w'], null, 'The width to cast the image to, defaults to source width'],
	height: [['h'], null, 'The height to cast the image to, defaults to half source height'],
	size: [['s'], null, 'The size to cap the image to, when set it overrides width/height setting to use the most optimal size.'],
	output: [['o'], './output.txt', 'The file to output the generated text to']
}, process.argv);
if (!args.image) 
    throw 'Cant perform conversion without an input file';
(async () => {
    console.log('\x1b[H\x1b[2JLoading input image.');
    const inp = await loadImage(args.image);
    const width = Math.ceil(args.height && !args.width ? (inp.width / inp.height) * args.height : args.width ?? inp.width);
    const height = Math.ceil(args.width && !args.height ? ((inp.height / inp.width) * args.width) / 2 : args.height ?? (inp.height / 2));
    const converter = createCanvas(width, height);
    const ctx = converter.getContext('2d');
    ctx.drawImage(inp, 0,0, width, height);
    console.log('\x1b[H\x1b[2JClamping image colors.');
    const pixels = ctx.getImageData(0,0, width, height);
    let demo = '';
    let text = '';
    const start = Date.now();
    for (let i = 0; i < pixels.data.length; i += 4) {
        const per = i / pixels.data.length
        const delta = ((Date.now() - start) / (i / 4)) / 1000
		const timePer = 1 / delta;
        console.log(`\x1b[2;1H\x1b[0m[${'='.repeat(Math.floor(per * 48))}${' '.repeat(48 - Math.floor(per * 48))}] ${Math.ceil(per * 100)}% (${Math.round(timePer)}PPS) ETA ${toTimeOrder(delta * ((pixels.data.length - i) / 4))}`);
        const px = pixels.data.slice(i, i +3);
        const sorted = colors
            .sort((a,b) => (
                (Math.abs(a[0][0] - px[0]) + Math.abs(a[0][1] - px[1]) + Math.abs(a[0][2] - px[2])) -
                (Math.abs(b[0][0] - px[0]) + Math.abs(b[0][1] - px[1]) + Math.abs(b[0][2] - px[2]))
            ));
		ctx.fillStyle = `rgb(${sorted[0][0].join(',')})`
        ctx.fillRect((i / 4) % width, Math.floor((i / 4) / width), 1,1);
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
        if (!width > stdout.columns) console.log(demo);
    }
    fs.writeFileSync(args.output, text);
    const imgVer = args.output.replace(path.extname(args.output), '.png');
    const upscale = createCanvas(width, height * 2);
    const utx = upscale.getContext('2d');
    utx.drawImage(converter, 0,0, width,height * 2);
    fs.writeFileSync(imgVer, upscale.toBuffer());
    console.log(`wrote ${text.length} characters to ${args.output} and ${imgVer}`);
})(); 
