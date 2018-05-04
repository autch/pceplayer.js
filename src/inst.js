'use strict';

const IT_LOOP = 0x10, IT_FAST = 0x80;
const PITCH44K = 47396,
    PITCH22K = 44324,
    PITCH16K = 42903,
    PITCH440 = 26976,
    PITCH_A4 = PITCH440,
    PITCH_C4 = (PITCH_A4 - 9 * 256),
    PITCH2 = (12 * 256),
    PITCH4 = (PITCH2 * 2),
    PITCH8 = (PITCH2 * 3),
    PITCH16 = (PITCH2 * 4),
    PITCH32 = (PITCH2 * 5),
    PITCH34 = 15629;
exports.inst = {
    IT_LOOP: IT_LOOP,
    IT_FAST: IT_FAST,
    PITCH44K: PITCH44K,
    PITCH22K: PITCH22K,
    PITCH16K: PITCH16K,
    PITCH440: PITCH440,
    PITCH_A4: PITCH_A4,
    PITCH_C4: PITCH_C4,
    PITCH2: PITCH2,
    PITCH4: PITCH4,
    PITCH8: PITCH8,
    PITCH16: PITCH16,
    PITCH32: PITCH32,
    PITCH34: PITCH34
};

function Inst(wtype, param, resv1, resv2, pitch_fs, pitch_org, data, loop_top, loop_end) {
    this.wtype = wtype;
    this.param = param;
    this.resv1 = resv1;
    this.resv2 = resv2;
    this.pitch_fs = pitch_fs;
    this.pitch_org = pitch_org;
    this.data = data;
    this.loop_top = loop_top;
    this.loop_end = loop_end;
}

function createInst(wtype, param, resv1, resv2, pitch_fs, pitch_org, data, loop_top, loop_end) {
    return new Inst(wtype, param, resv1, resv2, pitch_fs, pitch_org, data, loop_top, loop_end);
}
exports.createInst = createInst;

const instWave = {
    square: [
        0,
        0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
        0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f, 0x7f,
        0,
        -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f,
        -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f, -0x7f,
        0
    ],
    saw: [
        0,
        0x1f, 0x2f, 0x3f, 0x4f, 0x5f, 0x6f, 0x7f,
        0
        - 0x7f, -0x6f, -0x5f, -0x4f, -0x3f, -0x2f, -0x1f,
        0
    ],
    triangle: [
        0,
        -0x1f, -0x3f, -0x5f, -0x7f, -0x5f, -0x3f, -0x1f,
        0,
        0x1f, 0x3f, 0x5f, 0x7f, 0x5f, 0x3f, 0x1f,
        0
    ]
};

exports.presetInst = {
    i_square0: createInst(IT_FAST, 0, 0, 0, PITCH16K, PITCH16K - PITCH4, null, 0, 4 << 14),
    i_saw0: createInst(IT_FAST, 1, 0, 0, PITCH16K, PITCH16K - PITCH4, null, 0, 4 << 14),
    i_triangle0: createInst(IT_FAST, 2, 0, 0, PITCH16K, PITCH16K - PITCH4, null, 0, 4 << 14),
    i_square: createInst(IT_LOOP, 0, 0, 0, PITCH16K, PITCH16K - PITCH34, new Int8Array(instWave.square), 0, 34 << 14),
    i_saw: createInst(IT_LOOP, 0, 0, 0, PITCH16K, PITCH16K - PITCH16, new Int8Array(instWave.saw), 0, 16 << 14),
    i_triangle: createInst(IT_LOOP, 0, 0, 0, PITCH16K, PITCH16K - PITCH16, new Int8Array(instWave.triangle), 0, 16 << 14)
};
exports.Inst = Inst;
