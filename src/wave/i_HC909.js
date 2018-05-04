'use strict';

const inst = require('../inst.js');
const wdi_HC909 = [
    0, 1, -1, 1, -1, 1, -1, 1,
    -1, 1, -1, 1, -1, 1, -1, 2,
    -2, 2, -2, 2, -2, 2, -3, 3,
    -3, 3, -4, 4, -4, 5, -5, 5,
    -6, 7, -7, 8, -9, 10, -12, 13,
    -14, 42, -77, 73, 11, -28, -16, 2,
    -19, 29, -20, 9, 14, -27, 96, -110,
    35, 32, 0, -38, 30, 16, -47, 28,
    -35, -9, 84, -83, 60, 36, -33, -20,
    22, 68, -42, 40, -2, 15, -18, 35,
    -3, -2, 5, 26, -20, 22, -17, -25,
    -16, -106, 120, -42, -53, -8, 5, 71,
    -42, 18, -82, 14, -9, -113, 23, 53,
    -18, 10, -5, 18, -74, 69, -31, -66,
    110, -11, -30, -2, 43, 9, -46, -7,
    14, -7, 14, -13, 22, 13, 44, 37,
    -43, 66, -25, -52, -23, -38, 5, -27,
    40, -16, 45, 41, 39, -23, 13, 83,
    3, -50, 35, 3, -38, -23, -1, -44,
    31, -33, -79, 39, 2, -58, -2, 4,
    12, -65, 19, 14, 8, 22, -32, 6,
    -9, 22, -20, -4, 106, -47, -14, 27,
    1, 32, -33, 29, 60, -46, 13, -2,
    14, 38, -22, -47, 71, 4, -78, 20,
    -14, -19, -16, -44, 53, 30, -38, -33,
    -23, 26, -48, -52, 14, 6, -35, 5,
    102, 8, -15, 22, -10, 6, 14, -19,
    -14, 75, 25, -6, -11, 7, 44, -86,
    47, 50, -71, -14, -22, -14, 14, -42,
    -23, 47, -18, -17, -38, 32, -35, 29,
    -24, -15, -4, -17, 26, 4, -3, 72,
    -16, -23, 40, -14, 33, -4, -20, 94,
    -19, -66, 47, -39, -11, -43, 45, -36,
    -8, -39, 68, -12, 20, 24, 47, -29,
    -6, 45, -27, 25, -41, 46, -7, -83,
    49, 16, -27, 12, 1, 33, -47, -14,
    -18, 47, -93, 87, -38, 6, 40, -63,
    38, -7, -75, 26, 28, -11, 4, 29,
    -12, 41, 28, -71, 62, -20, -30, 28,
    -7, -8, -19, -26, 3, -19, 7, 35,
    -19, 52, 31, -75, -27, 50, -25, -18,
    -23, 0, -11, 18, -30, -26, 0, 2,
    -19, 42, -12, 10, 53, -50, 48, -37,
    -4, 34, 52, -60, 28, 36, -34, 14,
    37, -54, -10, 34, 11, -23, 15, 26,
    -29, 30, -8, -47, 18, 4, 14, -42,
    62, -59, 81, 3, -20, 38, 0, -47,
    51, -20, 38, -69, -44, 63, -30, -42,
    30, 8, -26, -9, -6, -37, 17, -22,
    -2, -12, 37, 15, -18, 2, -5, -10,
    43, -31, -5, 40, 36, -13, 19, 25,
    -48, -10, 53, -35, -30, 21, -52, 30,
    -16, 24, -29, 42, -24, 45, -11, -23,
    -14, -22, -11, -10, -33, 44, 8, -23,
    -3, 32, 21, -32, -3, -25, -14, 32,
    -20, 36, -65, 72, -4, -9, 43, -39,
    14, 15, 35, -33, 28, 27, -30, 51,
    -30, -27, -28, 61, 15, -75, 31, -30,
    3, -7, -30, -22, 0, 36, 27, -25,
    65, -32, -23, 3, 25, -50, 21, 27,
    -35, 13, 7, -9, -45, 28, -19, -6,
    -15, 80, -52, 22, -21, -10, -23, 47,
    -4, -15, 47, -2, 2, 59, -47, 11,
    40, -27, -7, -35, 32, -19, -24, -21,
    -33, -6, -2, 27, -65, 54, -8, 24,
    27, -25, -11, 5, -14, 39, -2, -9,
    29, 23, -18, -1, 6, -29, 5, -13,
    -31, 44, -1, -17, -11, -26, 20, 13,
    59, -53, 52, -21, 35, -43, 43, -4,
    -10, -24, 44, -12, -21, 26, -11, -10,
    -10, -16, -28, 12, -13, 4, 4, -20,
    33, -11, 22, -12, -23, 33, -8, -7,
    4, -7, -16, -14, 17, -14, 29, -18,
    24, -9, -12, 61, -35, 6, 18, -25,
    -3, 44, -53, 15, 8, -2, -29, 34,
    32, -28, 10, -21, 13, -24, 39, -3,
    -21, -25, -8, -14, -2, -16, 44, -14,
    32, 2, -27, 23, -44, 71, -75, 26,
    22, -31, 48, -6, 30, -4, -9, -10,
    -18, 15, 27, -14, 10, -14, -27, 18,
    -10, -3, 22, -44, -8, 38, -26, -26,
    6, 26, 12, 35, -23, -11, -1, -27,
    25, -24, -4, 41, -45, 25, 30, -46,
    1, -9, 32, -3, -31, 20, 8, -5,
    -35, 19, 9, 16, -30, -19, -10, 10,
    28, 5, 16, -21, 17, -7, -28, 34,
    -6, 1, -11, -4, 2, -3, 15, 10,
    0, -20, 60, -56, 11, 18, -4, 18,
    0, 2, -32, 26, -43, 37, -39, 33,
    1, 7, 13, -40, -26, -4, 16, -4,
    -5, 30, -10, 7, -6, -9, -5, -12,
    19, -2, -23, 14, -12, 0, 50, -71,
    22, 13, -16, 1, 11, -24, -10, -4,
    -12, -4, 8, 20, 25, -25, 65, -30,
    -30, 41, -9, -21, 25, 5, 20, -15,
    2, -26, 38, -2, -26, -30, 22, 20,
    -29, 16, 8, -25, -8, 59, -27, -7,
    27, -9, 13, 3, -12, -5, 25, -26,
    -2, 6, -10, 47, -25, 15, -37, 10,
    9, -28, 28, -28, 21, -22, -14, 59,
    -51, 5, -25, 41, -26, 7, 1, -12,
    -13, 10, -19, 20, 13, 2, 3, -11,
    -29, 5, -3, 0, 28, -44, 41, 8,
    -7, 24, -6, -16, 35, -31, -24, 28,
    16, -28, 22, -24, -8, 14, -19, 18,
    -32, 32, 10, -45, 85, 0, -44, 24,
    46, -27, -2, 11, -52, 79, -34, -34,
    12, 7, 6, -11, 26, 1, -14, -16,
    1, -4, -21, 37, -26, -19, 3, 4,
    -25, 31, -37, 20, -1, -7, 27, -11,
    -39, 15, 22, -6, -5, 0, -18, 35,
    -8, -4, 9, -16, 7, 33, -31, -33,
    64, -16, 6, 0, -16, 6, 4, 24,
    -8, -18, 11, 18, -34, 25, 10, -23,
    32, -23, 25, -25, 26, -2, 15, -41,
    5, -11, 26, -31, 27, -18, -25, 12,
    0, 6, -23, -4, 11, -10, -29, 18,
    26, -6, 0, 8, -18, 8, 23, -30,
    62, -50, 31, -33, 16, -10, -7, -7,
    -6, 20, -31, 12, -23, 17, -2, -3,
    -15, 46, -21, 21, 15, -36, 0, -7,
    -9, 1, 1, 4, 12, 4, -4, 17,
    1, -12, 37, -17, -2, 39, -32, 40,
    -47, 6, 5, -7, -26, 21, -13, -1,
    -6, 11, -3, -19, -4, 1, 22, -6,
    10, -20, -10, 12, 23, -14, 26, 2,
    -17, -11, -14, 14, 4, -2, 0, 11,
    -14, -3, -2, -12, 4, -1, 25, -9,
    14, -5, -4, 12, -26, 19, -2, -13,
    0, -20, 21, -11, 15, -4, -11, 15,
    -25, -10, 29, -22, 36, -41, 23, -2,
    -3, 40, -35, 13, -1, -18, -18, 3,
    1, 4, 7, -5, 10, 3, -6, 17,
    -6, 14, -13, 11, 14, 9, -14, 18,
    -1, 13, -18, 42, -33, -17, -7, -11,
    -5, 0, 18, -12, 4, -2, 9, -16,
    -16, 0, -2, -5, 4, 11, 30, -26,
    8, -11, 4, -13, -4, -13, 0, 0,
    6, 2, -17, 4, -9, 21, -17, 16,
    -14, -2, 17, -10, 22, -16, -6, 2,
    26, -15, 10, -14, 12, 5, -23, 32,
    -6, -3, 5, -8, -9, 7, -5, 10,
    22, 1, -24, 56, -34, 13, -2, -11,
    0, 4, -5, -4, -2, 13, -31, 6,
    24, -25, -10, 13, -13, -3, -22, 31,
    -18, -14, 0, 14, -7, -3, -13, -5,
    4, 8, -14, 9, 5, 32, -4, -18,
    10, 4, -9, 8, 12, -16, 21, -13,
    -19, 20, -8, -7, 25, -11, 10, -20,
    28, -18, -4, 0, 13, -20, 32, -11,
    0, -3, 10, -8, -1, -2, -20, 4,
    28, -40, 22, 3, -21, 2, 6, -5,
    0, 24, -12, 33, -24, -6, 2, -11,
    13, -3, -21, 49, -42, 9, -1, -16,
    13, -7, 2, -2, 7, 23, -18, -8,
    -2, 4, -6, -10, 8, 1, -4, 3,
    -10, 32, -4, 14, -12, 20, -13, -11,
    22, -20, 2, -1, -6, 19, -24, 10,
    -12, -3, 9, -1, -17, 14, 22, -22,
    8, 7, -11, 16, -3, -9, -14, 9,
    -26, 0, 27, -10, -5, 4, 11, -24,
    3, 9, -6, -4, 21, -21, 16, 4,
    -6, 2, 6, -11, -3, 10, -8, 8,
    -8, 1, 3, -11, 9, 1, 4, 27,
    -33, -7, 7, 2, -15, 6, -5, -6,
    1, 5, -3, 4, -4, 6, -4, 16,
    -3, -9, 7, -17, 19, -2, -5, 15,
    -7, 0, -7, -2, 3, -1, -4, -4,
    15, 21, -22, 22, -16, 12, -6, 1,
    -2, -2, 12, -8, 3, 0, -6, -5,
    -1, -1, -5, 15, -4, -10, 19, -17,
    8, 1, -7, -2, 1, -2, -2, -4,
    -2, -8, 6, 1, 2, -5, 0, 1,
    -2, -1, 1, -3, 3, 0, 3, -6,
    12, -4, 1, 0, -1, 0, 1, -1,
    1, 0, 2, -1, 0, 1, 2, -2,
    -1, 1, 0, 0, 1, -1, 0, 1,
    -1, 0, 1, 2, -2, 0, 0, 0,
    -1, 1, 0,
];

exports.i_HC909 =
    inst.createInst(
        0,
        0,
        0,
        0,
        inst.inst.PITCH16K,
        inst.inst.PITCH_C4,
        new Int8Array(wdi_HC909),
        0,
        1427 << 14
    );
