const { loadImage, createCanvas } = require('canvas');
const fs = require('fs');
const {stdout} = require('process')
const shades = [' ', '░', '▒', '▓', '█'];
// start here
const varients = 
    shades.map((char, c) => c === 0 || c === 4 
        ? [
            new Array(9)
                .fill(0)
                .map((fo, j) => c === 4 
                    ? `\x1b[0;${30 + j}m${char}` 
                    : `\x1b[0;${40 + j}m${char}`
                )
        ] 
        : new Array(9)
            .fill(0)
            .map((fo, j) => new Array(9)
                .fill(0)
                .map((ba, i) => `${j === 8 ? '\x1b[0m' : ''}\x1b[0;${30 + i};${40 + j}m${char}`))
    )
    .flat(); if (!global.process) console.log(varients.map(row => row.join('')).join('\n'));
// end here
loadImage('./colors.png')
    .then(map => {
        const can = createCanvas(map.width, map.height);
        const ctx = can.getContext('2d');
        ctx.drawImage(map, 0,0);
        const colors = [];
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const px = ctx.getImageData(x,y, 1,1).data.slice(0, -1);
                colors.push([[...px], varients[y][x]]);
                stdout.write(`${varients[y][x]}\x1b[10C\x1b[48;2;${px[0]};${px[1]};${[px[2]]}m \x1b[0m\x1b[11D`);
            }
            stdout.write('\n')
        }
        fs.writeFileSync('./colors.json', JSON.stringify(colors));
    })