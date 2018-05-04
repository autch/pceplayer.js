'use strict';

const inst = require('../inst.js');
const wdi_TOMM1 = [
    0, 1, 0, 1, 0, 1, 0, 1,
    -1, 1, -1, 1, -1, 1, -1, 1,
    -1, 2, -2, 2, -2, 3, -3, 11,
    -6, 55, 88, 19, -47, 13, 18, -62,
    -80, -45, -5, 20, -35, 4, 45, 3,
    94, 33, -49, 53, 53, 84, -2, 17,
    73, -17, 92, 20, 63, 17, 98, 30,
    12, 51, 71, 10, -11, 6, 82, -60,
    12, -16, 26, -52, -37, -64, -7, -30,
    -59, -38, -67, -11, -75, 6, -91, -80,
    -97, -38, -86, -77, -64, -65, -101, -84,
    -98, -84, -89, -88, -94, -87, -93, -88,
    -93, -88, -92, -88, -92, -88, -90, -83,
    -51, -72, -73, -65, -51, 28, -57, -92,
    -70, -81, -57, -43, -58, -86, -63, -81,
    -9, -20, -13, 53, -30, -12, 26, -33,
    -12, 2, 0, 54, 66, -8, 21, -35,
    68, 25, 39, 97, 3, 32, 85, 74,
    16, 93, 79, 72, 95, 66, -42, 66,
    92, 96, 89, 99, 37, 23, 64, -9,
    37, -31, -39, 12, -6, 57, 48, 11,
    2, 25, -13, -4, -26, -42, -8, -34,
    -61, -101, -79, -98, -55, -3, -74, -85,
    -81, -92, -87, -89, -67, -92, -84, -85,
    -88, -88, -85, -54, -78, -90, -86, -85,
    -68, -87, -73, -91, -82, -88, -27, -65,
    -88, -31, -28, -98, -8, -22, -50, -30,
    -81, 10, 30, -63, -62, -18, 12, -13,
    10, -55, -57, 39, 118, 25, 37, -10,
    17, 79, -7, 78, -7, 50, 85, 89,
    79, 94, 38, 49, 92, 80, 95, 84,
    86, 52, 90, 81, 83, 77, 83, 83,
    58, 32, 83, 76, 20, 76, 36, 51,
    14, 23, -6, 53, -42, -35, -27, -16,
    -47, -24, -66, -6, -46, -13, 0, -63,
    -71, -73, -41, -80, -81, -90, -80, -95,
    -63, -60, -91, -84, -90, -79, -83, -80,
    -84, -80, -75, -82, -87, -78, -71, -73,
    -63, -79, -76, -72, -66, -66, -67, -25,
    -51, -74, -34, -11, -43, -50, -1, -32,
    -37, -3, 23, 1, 30, -16, 34, 37,
    9, 34, 37, 24, 47, 64, 70, 74,
    79, 51, 70, 73, 72, 54, 91, 94,
    88, 85, 97, 91, 93, 96, 91, 91,
    89, 90, 85, 88, 77, 59, 65, 81,
    46, 32, 26, 10, 20, 36, 28, 29,
    64, 16, 14, 0, -7, -18, -6, -22,
    -54, -50, -57, -53, -55, -47, -47, -78,
    -63, -73, -78, -80, -81, -73, -82, -83,
    -82, -89, -78, -84, -79, -78, -84, -77,
    -78, -86, -74, -78, -76, -55, -66, -66,
    -50, -70, -39, -40, -36, -60, -45, -32,
    -36, -43, -21, -22, -28, 8, -32, -2,
    26, 20, 17, 12, -3, -5, 24, 60,
    38, 40, 33, 48, 42, 50, 48, 86,
    66, 69, 77, 89, 94, 96, 64, 79,
    93, 98, 88, 95, 86, 91, 94, 84,
    81, 73, 80, 62, 60, 78, 60, 48,
    53, 37, 44, 13, 44, 26, 17, 22,
    5, 23, -2, -4, -11, -27, -34, -36,
    -43, -36, -40, -34, -52, -56, -50, -57,
    -61, -66, -54, -72, -70, -81, -80, -80,
    -77, -74, -82, -79, -78, -72, -75, -71,
    -74, -67, -70, -68, -61, -59, -56, -56,
    -61, -48, -47, -44, -46, -39, -38, -29,
    -26, -27, -23, -24, -16, -2, -16, -6,
    14, 7, 19, 0, 19, 13, 40, 43,
    33, 40, 43, 30, 43, 62, 48, 64,
    71, 70, 59, 79, 81, 79, 83, 85,
    80, 95, 93, 92, 87, 90, 89, 87,
    87, 86, 90, 79, 69, 63, 75, 53,
    46, 44, 54, 37, 13, 31, 32, 18,
    24, 5, -3, 1, -18, -11, -16, -9,
    -26, -29, -33, -50, -41, -40, -49, -46,
    -62, -56, -56, -63, -59, -68, -61, -69,
    -69, -72, -69, -70, -74, -70, -73, -66,
    -65, -69, -71, -60, -64, -61, -54, -57,
    -54, -47, -48, -41, -47, -46, -40, -30,
    -20, -22, -32, -31, -11, -19, -3, -12,
    -9, -1, 11, -3, 13, 25, 18, 22,
    27, 36, 32, 43, 47, 47, 45, 51,
    48, 54, 65, 58, 65, 81, 70, 72,
    77, 78, 70, 86, 96, 82, 92, 91,
    89, 86, 92, 85, 71, 80, 69, 69,
    68, 57, 61, 54, 41, 33, 36, 23,
    38, 17, 16, 13, -1, 5, 11, -7,
    -14, -4, -16, -29, -36, -31, -27, -27,
    -38, -43, -49, -52, -51, -60, -58, -57,
    -55, -61, -60, -68, -65, -68, -71, -62,
    -67, -62, -64, -65, -64, -60, -56, -52,
    -50, -54, -53, -51, -53, -51, -42, -33,
    -32, -36, -27, -33, -20, -15, -16, -11,
    -14, -9, -1, -6, -14, -2, 5, 7,
    19, 17, 12, 13, 29, 36, 23, 34,
    35, 44, 53, 54, 43, 66, 77, 65,
    65, 64, 68, 72, 79, 81, 87, 85,
    85, 85, 82, 85, 87, 80, 77, 80,
    77, 66, 67, 74, 62, 53, 49, 46,
    45, 48, 40, 33, 24, 28, 24, 14,
    14, -1, 1, -4, -8, -8, -15, -20,
    -11, -20, -28, -35, -26, -33, -42, -35,
    -44, -47, -47, -52, -51, -58, -59, -49,
    -58, -65, -63, -64, -58, -61, -60, -55,
    -54, -63, -63, -58, -52, -51, -45, -45,
    -47, -36, -43, -42, -31, -40, -35, -27,
    -29, -21, -23, -21, -11, -17, -15, -10,
    1, 10, 1, 2, 17, 15, 15, 9,
    17, 29, 24, 32, 40, 35, 41, 39,
    44, 49, 57, 61, 52, 54, 62, 57,
    66, 76, 72, 62, 68, 76, 78, 86,
    89, 82, 80, 80, 75, 76, 78, 72,
    69, 57, 65, 66, 53, 54, 51, 46,
    36, 38, 28, 17, 20, 19, 13, 10,
    9, 4, 7, -12, -2, -5, -9, -25,
    -21, -21, -27, -25, -29, -37, -31, -37,
    -40, -46, -51, -48, -54, -54, -56, -57,
    -60, -57, -59, -57, -56, -54, -59, -54,
    -52, -52, -57, -47, -43, -46, -38, -41,
    -42, -37, -35, -33, -35, -32, -37, -27,
    -20, -23, -13, -19, -19, -11, -10, 0,
    5, 11, 5, -2, 13, 7, 19, 22,
    34, 29, 26, 19, 27, 30, 28, 35,
    42, 55, 57, 53, 51, 57, 58, 60,
    69, 73, 57, 69, 66, 77, 75, 73,
    68, 76, 72, 72, 71, 64, 67, 64,
    64, 62, 60, 59, 50, 49, 50, 34,
    37, 28, 27, 28, 21, 27, 19, 7,
    1, 5, 10, 2, -1, -4, -12, -12,
    -12, -16, -22, -24, -21, -31, -35, -39,
    -39, -38, -43, -38, -44, -43, -46, -47,
    -45, -49, -50, -52, -48, -52, -49, -48,
    -49, -48, -48, -45, -46, -42, -44, -38,
    -42, -33, -31, -33, -19, -19, -21, -28,
    -23, -22, -19, -16, -17, -10, -6, 1,
    -4, -3, 5, -1, 2, 10, 13, 8,
    12, 16, 29, 26, 24, 23, 29, 26,
    41, 44, 39, 39, 48, 57, 49, 46,
    52, 47, 55, 55, 55, 64, 60, 68,
    62, 62, 65, 62, 73, 56, 64, 67,
    61, 58, 57, 51, 51, 50, 47, 42,
    37, 36, 34, 28, 28, 36, 14, 22,
    20, 13, 12, 9, -2, 1, 3, -4,
    -9, -16, -9, -9, -14, -20, -19, -24,
    -25, -28, -30, -32, -32, -38, -39, -39,
    -35, -42, -41, -43, -46, -43, -46, -46,
    -45, -44, -45, -43, -40, -41, -37, -38,
    -33, -32, -30, -34, -29, -29, -27, -19,
    -25, -17, -21, -22, -19, -24, -14, -7,
    -16, -3, -3, -10, -5, -1, -6, 5,
    7, 6, 19, 17, 18, 18, 16, 27,
    25, 26, 30, 30, 28, 32, 36, 44,
    48, 38, 46, 40, 39, 45, 52, 48,
    52, 54, 54, 50, 57, 56, 54, 59,
    59, 59, 54, 55, 56, 52, 47, 55,
    46, 39, 42, 32, 32, 29, 32, 28,
    28, 27, 24, 23, 11, 11, 7, 11,
    8, 2, -1, -4, -2, -7, -5, -6,
    -14, -11, -16, -20, -21, -24, -18, -21,
    -28, -31, -33, -36, -35, -33, -35, -39,
    -38, -40, -39, -40, -37, -41, -40, -35,
    -37, -39, -34, -31, -38, -35, -29, -25,
    -31, -29, -28, -24, -26, -24, -22, -21,
    -18, -16, -11, -8, -10, -12, -9, -4,
    -2, -3, 0, -1, 10, 9, 4, 10,
    15, 18, 18, 19, 14, 21, 19, 16,
    27, 21, 27, 32, 28, 30, 39, 28,
    36, 45, 40, 42, 40, 45, 42, 49,
    51, 48, 52, 53, 48, 54, 52, 49,
    49, 48, 46, 50, 43, 42, 46, 38,
    36, 27, 30, 36, 25, 22, 22, 19,
    20, 19, 9, 9, 13, 9, 12, 1,
    2, 5, 2, -1, -3, -11, -14, -11,
    -18, -11, -19, -22, -17, -15, -25, -23,
    -23, -29, -30, -31, -28, -33, -32, -32,
    -36, -36, -34, -35, -35, -35, -31, -33,
    -31, -35, -29, -30, -28, -28, -25, -22,
    -26, -28, -21, -19, -18, -15, -14, -16,
    -16, -11, -13, -8, -12, -7, 0, -5,
    -1, 0, -2, 7, 7, 7, 4, 5,
    9, 13, 14, 17, 14, 23, 17, 17,
    26, 26, 20, 27, 31, 28, 30, 33,
    28, 34, 41, 37, 36, 34, 38, 42,
    41, 43, 43, 42, 48, 43, 44, 42,
    42, 41, 41, 41, 37, 37, 32, 36,
    35, 26, 28, 24, 21, 23, 17, 17,
    19, 19, 16, 11, 6, 3, 1, 6,
    7, 2, 0, -6, -2, -3, -11, -6,
    -9, -13, -16, -11, -17, -19, -13, -19,
    -22, -24, -26, -25, -27, -28, -28, -25,
    -29, -33, -31, -26, -29, -31, -28, -29,
    -26, -29, -27, -27, -27, -24, -21, -24,
    -20, -23, -19, -19, -17, -16, -19, -14,
    -10, -12, -10, -5, -9, -8, -4, -4,
    -5, 1, -3, 1, 1, -2, 3, 9,
    6, 8, 10, 10, 14, 11, 11, 13,
    17, 20, 14, 20, 20, 24, 23, 25,
    28, 29, 32, 30, 27, 31, 32, 28,
    36, 32, 36, 32, 37, 41, 35, 38,
    40, 38, 36, 33, 38, 35, 29, 33,
    30, 29, 26, 28, 27, 25, 21, 20,
    17, 17, 16, 8, 11, 14, 6, 7,
    11, 4, 1, 2, -3, -2, -2, -3,
    -8, -3, -8, -14, -11, -10, -15, -11,
    -12, -17, -18, -18, -22, -22, -23, -20,
    -24, -25, -24, -24, -25, -26, -27, -26,
    -25, -26, -25, -28, -23, -22, -24, -22,
    -21, -20, -18, -17, -20, -16, -17, -16,
    -15, -14, -7, -14, -14, -6, -7, -7,
    -1, -7, -4, -2, -4, 4, -1, 1,
    1, 2, 4, 3, 7, 10, 10, 10,
    11, 7, 15, 11, 13, 15, 16, 21,
    14, 18, 22, 18, 19, 24, 25, 25,
    27, 27, 27, 28, 31, 30, 29, 29,
    32, 30, 29, 31, 34, 31, 29, 34,
    31, 25, 26, 23, 25, 26, 23, 20,
    20, 20, 20, 17, 16, 15, 15, 10,
    11, 12, 7, 4, 8, 4, 3, 1,
    0, -4, -2, -4, -1, -6, -6, -5,
    -11, -6, -11, -12, -14, -14, -15, -18,
    -14, -15, -19, -18, -21, -17, -18, -22,
    -21, -22, -21, -22, -22, -20, -21, -21,
    -21, -20, -20, -19, -21, -19, -17, -17,
    -17, -15, -17, -13, -10, -9, -11, -11,
    -9, -6, -8, -7, -5, -3, -4, -9,
    -1, 0, -2, 1, 1, -1, 1, 2,
    6, 4, 6, 5, 8, 11, 10, 10,
    11, 11, 10, 14, 13, 14, 17, 14,
    16, 16, 16, 17, 16, 21, 21, 22,
    21, 21, 23, 22, 23, 24, 24, 24,
    27, 28, 26, 24, 23, 25, 24, 20,
    23, 22, 19, 17, 17, 19, 19, 16,
    17, 14, 13, 15, 14, 12, 7, 8,
    4, 4, 4, 1, 3, 1, 2, 2,
    -1, -5, -2, -4, -4, -4, -8, -7,
    -9, -9, -11, -11, -10, -12, -13, -13,
    -15, -14, -12, -16, -15, -17, -17, -17,
    -18, -19, -19, -18, -18, -18, -16, -16,
    -15, -18, -15, -16, -15, -13, -15, -13,
    -13, -14, -11, -10, -9, -8, -9, -8,
    -8, -7, -7, -6, -3, -4, -4, -4,
    -3, 1, -2, -2, -1, 0, 3, 3,
    4, 4, 5, 3, 5, 5, 6, 7,
    7, 9, 8, 10, 10, 10, 11, 13,
    12, 14, 13, 14, 15, 16, 16, 16,
    17, 19, 18, 17, 19, 20, 21, 19,
    19, 21, 20, 20, 21, 20, 17, 17,
    17, 16, 15, 16, 15, 16, 13, 11,
    13, 13, 10, 11, 6, 6, 7, 7,
    7, 6, 5, 3, 3, 3, 0, 1,
    0, -2, -4, -3, -3, -3, -6, -5,
    -7, -8, -9, -9, -8, -9, -10, -11,
    -11, -11, -10, -12, -13, -14, -14, -15,
    -14, -13, -15, -15, -14, -15, -15, -14,
    -14, -14, -13, -12, -13, -12, -12, -11,
    -9, -10, -10, -7, -9, -8, -9, -8,
    -8, -7, -5, -5, -3, -6, -4, -3,
    -3, -3, -2, -2, 0, 0, -1, 1,
    2, 1, 0, 2, 3, 2, 4, 5,
    6, 5, 6, 6, 8, 9, 9, 7,
    10, 10, 7, 10, 10, 12, 12, 11,
    12, 13, 12, 13, 12, 13, 13, 16,
    15, 15, 16, 15, 15, 16, 14, 15,
    14, 14, 14, 13, 13, 12, 11, 9,
    9, 11, 10, 8, 8, 8, 8, 6,
    5, 5, 4, 4, 4, 4, 1, 1,
    2, 0, 1, -1, -2, 0, -4, -4,
    -3, -4, -6, -4, -6, -6, -5, -8,
    -7, -7, -9, -8, -9, -9, -10, -11,
    -11, -11, -12, -12, -11, -12, -11, -12,
    -12, -12, -10, -11, -11, -11, -10, -10,
    -10, -8, -8, -9, -8, -8, -8, -8,
    -7, -6, -6, -5, -5, -6, -5, -3,
    -5, -3, -3, -2, -2, -1, -2, -1,
    0, 0, -1, 0, 0, 1, 2, 2,
    3, 2, 2, 3, 3, 4, 4, 5,
    5, 6, 6, 6, 6, 6, 8, 8,
    7, 9, 8, 9, 9, 9, 10, 10,
    10, 10, 11, 11, 10, 12, 12, 11,
    11, 12, 12, 10, 10, 11, 11, 9,
    9, 9, 10, 9, 8, 8, 7, 6,
    7, 7, 6, 4, 3, 3, 2, 2,
    2, 2, 2, 2, 2, -1, 0, 0,
    -1, -1, -1, -2, -2, -4, -4, -5,
    -5, -4, -5, -5, -6, -5, -7, -7,
    -6, -7, -7, -8, -7, -7, -9, -9,
    -9, -9, -8, -9, -9, -10, -8, -9,
    -8, -8, -8, -7, -8, -8, -8, -7,
    -7, -7, -6, -6, -7, -5, -4, -6,
    -5, -4, -4, -3, -4, -3, -4, -2,
    -3, -2, -2, -1, 0, -1, 0, 0,
    -1, 0, 0, 0, 1, 1, 1, 1,
    2, 1, 3, 3, 2, 3, 4, 4,
    5, 5, 4, 5, 6, 6, 6, 6,
    7, 5, 5, 7, 6, 6, 7, 7,
    7, 8, 8, 8, 8, 9, 8, 9,
    9, 8, 8, 8, 7, 8, 7, 7,
    6, 6, 6, 5, 5, 5, 4, 4,
    4, 3, 3, 3, 2, 1, 2, 2,
    1, 1, 0, 1, 1, -1, 0, -1,
    -2, -1, -3, -3, -1, -2, -3, -4,
    -4, -3, -4, -4, -4, -5, -4, -5,
    -5, -5, -6, -6, -7, -6, -7, -7,
    -7, -7, -7, -7, -7, -7, -7, -7,
    -6, -6, -6, -6, -6, -5, -5, -5,
    -5, -5, -5, -4, -4, -4, -4, -4,
    -4, -3, -4, -3, -3, -2, -2, -2,
    -2, -2, -2, 0, 0, -1, -1, -1,
    0, 0, 0, 0, 1, 1, 1, 1,
    1, 1, 2, 2, 1, 3, 3, 3,
    2, 3, 3, 3, 3, 4, 3, 3,
    5, 4, 4, 5, 5, 5, 4, 5,
    5, 5, 5, 5, 6, 5, 5, 6,
    5, 5, 6, 5, 5, 5, 5, 4,
    4, 4, 4, 4, 4, 3, 3, 4,
    3, 2, 2, 2, 2, 1, 2, 1,
    -1, 0, 0, 1, 0, 0, 0, 0,
    0, -1, -1, -2, -1, -2, -2, -2,
    -2, -3, -3, -2, -4, -3, -3, -3,
    -4, -4, -4, -4, -4, -5, -4, -4,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -4, -4, -4, -4, -4, -3,
    -4, -4, -3, -3, -4, -3, -3, -3,
    -3, -2, -2, -3, -2, -2, -2, -2,
    -2, -2, -1, -1, -1, -1, -1, -1,
    0, 0, -1, 0, 0, 1, 0, 0,
    1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 2, 2, 2, 2, 2, 2,
    2, 3, 3, 3, 2, 3, 3, 3,
    3, 3, 3, 3, 4, 3, 4, 4,
    3, 4, 4, 3, 3, 3, 3, 3,
    3, 3, 3, 3, 3, 3, 2, 2,
    2, 2, 2, 2, 1, 1, 1, 1,
    1, 1, 1, 1, 0, 0, 0, 0,
    0, 0, 0, -1, -1, -1, -1, -1,
    -1, -1, -1, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -3, -3,
    -3, -3, -3, -3, -3, -3, -3, -3,
    -3, -3, -3, -3, -3, -3, -3, -3,
    -3, -3, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, 0, 0, -1, 0, 0,
    0, 0, 0, 0, 0, 1, 0, 0,
    0, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 2, 1, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2, 2,
    2, 2, 2, 2, 2, 2, 2, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 0, 1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -2, -2, -2,
    -2, -2, -2, -2, -2, -2, -2, -2,
    -2, -2, -2, -2, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, -1, -1, -1, -1, -1, -1, -1,
    -1, 0, -1, -1, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, -1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, -52, -55, -45, -44, -62,
    -128, -128, -128, -55, -50, -58, -49, -55,
    -61, -46, -60, -117, -128, -128, -128, -78,
    -80, -80, -79, -83, -80, -72, -83, -78,
    -72, -128, -128, -55, -59, -50, -57, -119,
    -128, -128, -128, -56, -31, -46, -28, -52,
    -17, -61, -21, -128, -128, -55, -45, -58,
    -44, -112, -128, -128, -128, -45, -17, -11,
    -18, -28, -96, -58, -17, -14, -25, -27,
    -96, -76, -82, -75,
];

exports.i_TOMM1 =
    inst.createInst(
        0,
        0,
        0,
        0,
        inst.inst.PITCH16K,
        inst.inst.PITCH_C4,
        new Int8Array(wdi_TOMM1),
        0,
        /* http://www.piece-me.org/piece-lab/piece-lab-2017.txt
			  * Mon Aug 14 08:16:30 JST 2017 Naoyuki Sawa
			  - ドラム音色のノイズ
			*/
        (3116 - 73) << 14
    );
