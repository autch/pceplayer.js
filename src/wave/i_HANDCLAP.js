'use strict';

const inst = require('../inst.js');
const wdi_HANDCLAP = [
    0, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -2, -2, -1, -2, -2, -2, 0,
    -4, -8, -10, -7, -5, -26, -16, -8,
    -28, 4, 72, 26, 44, 57, -38, -30,
    58, -50, -75, -85, -61, -14, 17, 51,
    64, 60, 54, 31, 7, -8, -11, -8,
    2, -1, -13, -9, -11, -10, -3, -2,
    26, 33, 16, -2, -7, -4, 1, -6,
    3, 18, 21, 20, 11, -4, -13, -8,
    -8, -5, 0, 3, -5, -12, -15, -11,
    -2, 1, 4, 5, 6, 8, 5, 3,
    0, -3, -5, -8, -7, -6, -5, -5,
    -5, -5, -2, -3, -3, 1, 1, 0,
    -3, -8, -11, -6, -3, 5, 8, 2,
    3, -5, -9, -4, -10, -15, -9, -5,
    -1, 1, 2, -3, -1, 0, 1, -1,
    -5, -6, -3, 1, 0, -5, -6, -8,
    -6, -1, 0, -1, -8, 3, 2, -1,
    7, 14, -6, -17, 14, 22, 69, 19,
    12, -9, -92, -78, -89, -96, 18, 69,
    45, 82, -16, -68, -45, 71, 96, -29,
    -92, -85, 2, 31, 32, 28, 12, 21,
    -8, 10, 58, 84, 14, -63, -77, -30,
    34, 37, -11, -30, -11, 18, 24, 16,
    1, -7, -14, -5, 15, 22, 17, 0,
    -5, -4, 1, -2, 5, 6, 5, -4,
    -4, -1, 2, -2, -1, -12, -3, -4,
    3, 6, 21, 20, 27, 52, 45, 24,
    28, -60, -36, 8, -35, -14, -10, -62,
    -30, -47, -32, -27, 7, 38, 38, 49,
    20, 34, 40, 8, 3, -8, -18, -18,
    -24, -24, -16, 1, 13, 26, 27, 21,
    10, -7, -12, -9, -12, -1, 1, 0,
    -2, 1, 2, 6, 5, 1, -9, -15,
    -12, -6, 0, 5, 14, 17, 18, 11,
    1, -1, -10, -16, -6, -1, 5, -6,
    -7, -11, -18, -28, -24, 3, 38, 74,
    63, 30, -44, -42, -13, 22, 17, -24,
    -15, -10, -16, -24, 4, 10, 22, 13,
    7, 0, 11, 15, -6, -11, 1, 0,
    1, 4, 0, 4, 4, 3, -3, 9,
    -1, 3, -5, -3, -9, -2, -2, 2,
    -3, 14, 22, 28, 18, 1, 5, -9,
    -4, -13, -2, -12, -1, -4, 7, -1,
    13, 4, 0, 1, 7, 16, 12, 0,
    -8, -2, 10, 1, -3, -3, -4, -7,
    -7, -4, 0, 9, 11, 7, 5, 0,
    -9, 0, 4, 2, 2, 1, 5, -2,
    1, 4, 6, 6, 0, -4, -7, -2,
    8, 17, 12, 12, -9, -11, -16, -8,
    -5, 2, 3, 9, 10, 5, 5, -7,
    -1, 5, 7, 17, 22, 11, -2, -1,
    10, -40, -28, -70, -81, -73, -44, 23,
    67, 99, 91, 86, 17, -70, -93, -47,
    -26, 50, 65, 17, -10, -27, -5, -5,
    -13, -36, -37, -10, 10, 24, 36, 27,
    14, 22, 1, 14, 31, 16, 10, -19,
    -20, -9, -11, -4, -6, 14, -2, -7,
    15, 19, 28, 7, -13, -11, -13, -4,
    5, 15, 25, 10, 4, -37, -44, -24,
    -18, 3, -2, -21, 5, 51, 43, 49,
    40, 13, 23, 17, -2, -2, -27, -39,
    -22, -25, -16, 4, 8, 5, 13, 7,
    -2, 8, 1, -19, -5, -28, -23, -2,
    22, 33, 13, -2, 2, 16, 27, 29,
    5, -6, -21, -16, -20, -8, 16, -1,
    1, -9, -17, -19, -10, 7, 13, 8,
    9, 13, 8, 4, 6, 12, 9, -2,
    -5, 5, 3, 1, 6, -7, -4, -3,
    -6, -7, 3, -7, -3, -3, -5, -7,
    -1, 3, 22, 25, 22, 18, 16, -9,
    -10, -12, -7, -11, -7, -14, -19, -22,
    -17, 0, 8, 10, -3, -4, -2, -8,
    -6, -3, 16, 17, 19, 8, -1, -4,
    -13, -14, 7, 8, 18, 3, -4, 0,
    -2, -3, 1, -2, 7, 0, -5, -11,
    -5, 12, -2, -14, -18, -16, -11, 6,
    -5, -3, 6, -5, 1, -5, 12, 12,
    12, 16, 12, 24, 3, 11, -10, -20,
    2, -4, -12, -15, -11, 22, 14, 4,
    -7, -44, -22, -4, 9, 11, 9, -5,
    -17, 5, 1, -5, -7, 4, 8, 18,
    17, 6, 10, 6, -1, -28, -28, -33,
    -2, 14, 5, 13, -6, -6, -6, -6,
    0, -2, 20, 11, 35, 39, 33, 15,
    -8, -25, -60, -55, -41, -26, 13, 10,
    8, 6, -11, -7, 2, 12, 13, -1,
    16, 9, 20, 37, 37, 40, 30, 6,
    -7, -44, -52, -61, -44, -28, -17, 12,
    12, 21, 18, 3, 10, 9, 17, 32,
    20, 22, 11, 1, 2, 7, -5, -15,
    -20, -20, -13, -1, 8, -5, -10, -1,
    -1, 27, 25, 23, 23, -3, -5, -26,
    -27, -18, -32, -24, -30, -8, 31, 42,
    37, 45, 26, 23, -1, -5, -11, -21,
    -24, -16, -11, -11, -6, -8, -9, 5,
    5, 13, 6, 11, 9, 6, 6, -7,
    -8, -9, 4, 2, 5, -1, 8, 0,
    9, 19, 4, 2, -7, -7, 2, -13,
    -6, 3, 4, 8, -6, 4, 1, -1,
    0, 3, 11, 1, 2, -4, -8, 1,
    -19, -11, -10, -7, 3, 8, 9, 9,
    9, 7, -6, -5, -12, -11, -3, -4,
    8, 22, 17, -2, -8, -11, -15, -10,
    -12, -7, -5, 3, 7, 10, 13, 9,
    5, -6, -3, -6, -15, -11, -1, 9,
    4, 9, 8, -5, 1, -4, -9, 2,
    0, 5, 3, 12, 2, 1, 0, -5,
    -5, -8, -6, 11, 6, 5, -1, -7,
    -9, -16, -5, 4, 24, 12, 2, -3,
    -2, 3, -9, -11, -12, -14, -6, -9,
    -5, 2, 7, 22, 32, 27, 15, 1,
    -12, -16, -39, -41, -20, -15, 6, -5,
    -5, 3, 11, 51, 48, 32, 27, 7,
    -30, -53, -48, -32, -5, 7, 20, 19,
    19, 6, -12, 1, 8, 4, 1, -18,
    -20, -19, -8, -7, 0, 6, 15, 8,
    4, 4, -5, 7, 1, 3, 10, -6,
    -3, -1, 3, 6, -10, -12, -11, -20,
    -9, -11, 4, 9, 4, 6, -3, 6,
    3, 4, 8, 0, 2, -1, -4, -5,
    0, -1, -14, -10, -8, -5, 10, 8,
    15, 8, -5, -10, -16, -15, 3, 9,
    6, 12, 1, -8, -10, -11, -10, -5,
    -6, -4, 8, 1, 3, 6, 14, 14,
    8, -2, -9, -11, -4, -8, -5, -5,
    -3, 7, 12, 17, 10, 9, 0, -10,
    -16, -9, -2, 0, 3, -8, -6, -9,
    -5, -1, 8, 15, 10, 2, -4, -3,
    4, 1, -1, -8, -2, 2, -2, 1,
    -2, -4, -5, -7, -2, 1, 13, 17,
    17, 14, 2, -5, -11, -16, -14, -11,
    -7, -6, -10, -4, 1, 7, 1, 4,
    2, 3, 8, 8, 0, -9, -2, 0,
    -2, 0, -5, -4, 5, 6, 9, 6,
    0, -10, -11, -4, -5, 0, -2, 0,
    -4, 1, 1, -4, 0, 4, 6, 8,
    1, 2, 1, 6, 8, 6, 8, -1,
    -6, -12, -7, -6, -5, -2, -1, -1,
    3, -3, -2, -1, -2, -1, 3, 2,
    7, 1, -5, -2, -9, -3, 2, 13,
    7, -3, -5, 0, 5, 1, -4, -11,
    -5, -7, -4, 2, 7, 15, 6, 3,
    -1, -2, 5, -1, -3, -7, -5, -1,
    -1, 0, 0, -2, 0, 5, 1, -5,
    -6, -4, 6, 5, 9, 7, 1, -5,
    -7, -12, -11, 1, 7, 18, 13, 6,
    -3, -10, -16, -15, -7, 2, 11, 14,
    2, 8, 4, -2, 2, -3, 0, -2,
    -1, -2, 0, -7, -6, 5, 5, 1,
    4, 8, 3, 7, 7, 1, 2, -4,
    -9, -12, -14, -4, -4, -3, 0, 1,
    3, 3, 2, 6, 6, 7, -1, -3,
    2, -6, 0, 4, -1, 3, 4, 3,
    -1, -3, -3, -3, -4, -3, -1, -5,
    -8, -3, 6, 11, 14, 14, 8, -2,
    -2, -6, -5, 2, 0, 0, -6, -4,
    3, -3, 3, -6, -6, -3, -6, -3,
    -5, -2, 8, 12, 11, 12, 5, -3,
    -7, -7, 0, 3, 2, 2, -1, 1,
    3, 2, -4, -4, -3, -3, 2, 5,
    8, 7, 6, 3, 1, 5, -5, -4,
    -9, -11, -6, 0, 2, 9, 2, 4,
    3, -3, -3, -2, 5, 0, -1, -3,
    2, 3, 5, 2, 0, -7, -6, -1,
    3, 7, 3, -6, -4, -4, 5, 8,
    8, 7, 7, -1, -6, -3, -4, -6,
    -1, -1, 5, 4, 2, 3, 0, 0,
    1, -3, -4, -5, -2, -2, 0, 0,
    1, -1, 7, 11, 11, 1, -3, -7,
    -3, -5, 1, 3, 2, 5, 3, 2,
    -3, -6, -5, -6, -5, -3, -1, 2,
    5, 7, 4, 5, -1, -4, -3, -1,
    -2, 1, 6, 7, 6, 3, -4, -9,
    -12, -11, 2, 12, 12, 9, 1, 1,
    -6, -6, -3, -5, -5, -5, 0, 1,
    2, 4, 4, 6, 6, 3, 2, -2,
    1, -1, 1, 1, 3, -3, -2, -5,
    -7, -1, 2, 5, 6, 5, -1, -6,
    -10, -6, -1, 5, 11, 15, 11, 2,
    -1, -9, -12, -9, -3, -2, 2, 8,
    4, 3, -1, -1, 2, -3, -3, -3,
    -2, 4, 6, 8, -1, -1, -3, -1,
    -1, 3, 3, 3, -3, -2, 2, 0,
    1, -2, 0, -3, -1, 0, -3, 0,
    0, 1, 3, 0, 1, 4, 2, 2,
    0, 4, 5, 3, -2, -4, -4, -1,
    1, 3, 2, 1, -5, -9, -4, -2,
    3, 7, 3, 1, 1, 2, -3, 1,
    2, 5, 1, -1, -2, -6, -2, -2,
    2, 3, -2, 3, 0, 0, 2, 2,
    5, 3, 3, 2, -1, -4, -2, -4,
    -4, 1, -1, -5, -4, -2, 2, 4,
    4, 5, 7, 1, -1, -4, -3, -1,
    -1, 2, 4, 3, 3, 0, 4, 3,
    0, -3, -8, -2, -1, -1, 1, -1,
    1, 0, 2, 1, -1, 3, -1, -1,
    0, 0, -3, -1, 1, 4, 4, 2,
    2, 1, 3, 1, 1, 0, -1, -3,
    -3, -4, -2, 3, 3, 4, 2, 3,
    -1, -3, -3, -6, 4, 3, 6, 5,
    2, -1, -5, -1, -3, 0, 3, 2,
    2, 0, 0, 1, -3, -1, -2, -4,
    -2, -1, 1, 0, 2, 2, -2, -1,
    -1, 1, 3, 4, 2, 1, 1, 2,
    3, -1, -1, -4, -5, -5, -5, -1,
    3, 2, 2, 2, 2, 3, 3, 1,
    -1, 0, -1, -2, 2, 3, 2, 3,
    4, 1, 2, 1, -1, -5, -4, -5,
    -5, -5, -1, 5, 8, 9, 7, 3,
    3, -2, -2, -4, -3, -1, 0, 2,
    2, 3, 2, 0, -2, -4, -3, -5,
    -2, -2, 0, 4, 5, 6, 3, 2,
    1, 0, 0, -1, 0, -1, -1, 0,
    3, 2, 1, 0, -3, -4, -2, 0,
    3, 4, 2, 2, 1, -1, -4, -3,
    -2, 0, 2, 0, 2, 2, 2, 4,
    1, -1, -1, -1, -1, -3, -3, 0,
    1, 2, 6, 3, 0, -3, -4, -1,
    1, 1, 1, 2, 1, -1, -1, -3,
    -1, -1, 0, 2, 2, 3, 3, 0,
    4, 3, 2, 0, -1, -2, -3, -3,
    -2, -1, 0, 0, 0, -2, -2, -1,
    -1, -1, 3, 6, 2, 1, 2, 0,
    -1, -3, -3, -2, -2, 0, 0, 2,
    2, 1, 0, -2, -3, -4, -1, 1,
    3, 6, 2, -1, 0, 0, 2, 2,
    2, 2, -1, -2, -1, -2, -1, 0,
    1, 0, 0, 1, 1, 1, 2, 2,
    2, 0, -3, -2, -1, -1, 0, -1,
    0, 2, 2, 2, 1, 1, 0, -1,
    -1, -1, 1, 1, 1, 2, 2, 1,
    0, -1, -2, -1, 0, 1, 2, 3,
    2, 1, 0, 0, 1, 1, 2, 2,
    2, 1, -2, -2, -2, -2, -2, 0,
    0, 0, 1, -1, -1, -1, 0, 1,
    2, 3, 4, 2, 0, -1, -2, -2,
    0, 1, 0, 0, 1, 1, 0, 1,
    1, -1, 1, 1, 0, -1, -2, -2,
    -1, -1, 1, 3, 3, 1, -2, -1,
    1, 2, 1, -1, -1, -1, -1, -1,
    -1, 0, 0, 0, 1, 2, 1, 2,
    1, 1, 1, 1, 0, 0, -1, 0,
    0, 0, 0, 1, 0, -1, -2, -2,
    -2, 0, 1, 1, 2, 2, 2, 1,
    1, -1, -3, -2, 0, 0, 2, 2,
    3, 3, 1, 0, -1, -2, -3, -3,
    -1, 0, 2, 3, 3, 2, 1, 0,
    -2, 0, -1, 0, 0, -1, 0, 0,
    -1, -1, -1, 0, -1, -1, 0, 0,
    1, 2, 2, 2, 1, 2, -1, -1,
    -1, 0, -1, -1, 1, 2, 3, 0,
    -1, -3, -1, -1, 0, 1, 1, 2,
    1, 1, 1, 0, -1, -3, -3, 0,
    1, 1, 0, 0, -1, 0, 0, 1,
    0, 1, 0, 0, -1, -1, 0, 0,
    1, 1, 1, 1, 0, -1, -1, -2,
    0, 0, 2, 1, 1, 1, 0, -1,
    -1, 0, 0, 1, 0, -1, -1, -1,
    -2, 0, 0, 1, 1, 1, 0, 0,
    0, 0, 0, -1, -1, 0, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0,
];

exports.i_HANDCLAP =
    inst.createInst(
        0,
        0,
        0,
        0,
        inst.inst.PITCH16K,
        inst.inst.PITCH_C4,
        new Int8Array(wdi_HANDCLAP),
        0,
        2153 << 14
    );
