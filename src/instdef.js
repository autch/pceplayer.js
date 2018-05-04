'use strict';

const inst = require('./inst.js');

exports.InstDef = [
    inst.presetInst.i_square0,
    inst.presetInst.i_saw0,
    inst.presetInst.i_triangle0,
    inst.presetInst.i_square,
    inst.presetInst.i_saw,
    inst.presetInst.i_triangle,

    require('./wave/i_BD909.js').i_BD909,
    require('./wave/i_SDGATE.js').i_SDGATE,
    require('./wave/i_SD909.js').i_SD909,
    require('./wave/i_HO909.js').i_HO909,
    require('./wave/i_HC909.js').i_HC909,
    require('./wave/i_CYMBD.js').i_CYMBD,
    require('./wave/i_CYMBD.js').i_CYMBD,
    require('./wave/i_TOMH1.js').i_TOMH1,
    require('./wave/i_TOMM1.js').i_TOMM1,
    require('./wave/i_TOML1.js').i_TOML1,
    require('./wave/i_HANDCLAP.js').i_HANDCLAP
];
