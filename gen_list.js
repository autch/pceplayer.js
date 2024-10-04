'use strict';

const fs = require('fs');
const path = require('path');
const iconvlite = require('iconv-lite');

function eachfile(av) {
    const files = fs.readdirSync(av);

    return files.filter(f => /\.pmd$/.test(f)).sort().map(f => {
        const fn = path.posix.join(av, f);

        let allBuffer = fs.readFileSync(fn, {encoding: null});
        let headerOffset = 0;

        if(allBuffer.readInt8(0) === 0) {
            headerOffset = 1;
        }

        const partNum = allBuffer.readInt8(headerOffset);

        // zero.b?, part_num.b, part_ofs.h[part_num], drum_ofs.h, title_ofs.h, title2_ofs.h
        const offsetToPart = headerOffset + 1;
        const titleOffset = allBuffer.readInt16LE(offsetToPart + partNum * 2 + 2);
        const title2Offset = allBuffer.readInt16LE(offsetToPart + partNum * 2 + 2 + 2);

        // console.log(`${fn}: partNum: ${partNum}, titleOffset: ${titleOffset}, title2Offset: ${title2Offset}`);

        let titleStr = "", title2Str = "";

        let sliceString = (start) => {
            let pos;
            let char;
            for(pos = start; char = allBuffer.readUInt8(pos), char !== 0; pos++) {
                //
            }
            return iconvlite.decode(allBuffer.subarray(start, pos), 'Shift_JIS');
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


let files = []
for(let av of process.argv.slice(2)) {
    files.push(...eachfile(av));
}

fs.writeFile("list.out.json", JSON.stringify(files, null, 2), (err) => {
    if(err) {
        console.error(err);
    }
});
