'use strict';

const fs = require('fs');
const path = require('path');
const iconvlite = require('iconv-lite');

function eachfile(av) {
    const files = fs.readdirSync(av);

    return files.filter(f => /\.pmd$/.test(f)).sort().map(f => {
        const fn = path.join(av, f);

        let allBuffer = fs.readFileSync(fn, {mode: 'r', encoding: null});
        let headerOffset = 0;

        if(allBuffer.readInt8(0) === 0) {
            headerOffset = 1;
        }

        // zero.b?, part_num.b, part_ofs.h[6], drum_ofs.h, title_ofs.h, title2_ofs.h
        const titleOffset = allBuffer.readInt16LE(headerOffset + 1 + 12 + 2);
        const title2Offset = allBuffer.readInt16LE(headerOffset + 1 + 12 + 2 + 2);

        let titleStr = "", title2Str = "";

        let sliceString = (start) => {
            let pos;
            let char;
            for(pos = start; char = allBuffer.readUInt8(pos), char !== 0; pos++) {
                //
            }
            return iconvlite.decode(allBuffer.slice(start, pos), 'ShiftJIS');
        };

        if(titleOffset !== 0) {
            titleStr = sliceString(titleOffset).replace(/;/, "\n");
        }
        if(titleOffset !== 0) {
            title2Str = sliceString(title2Offset).replace(/;/, "\n");
        }

        return {
            'href': fn,
            'filename': f,
            'name': path.basename(f, '.pmd'),
            'title': titleStr,
            'title2': title2Str,
        }
    });
}


for(let av of process.argv.slice(2)) {
    console.log(JSON.stringify(eachfile(av)));
}
