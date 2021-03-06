module.exports = class TNS {
    static get TNS_MAX_ORDER() {
        return 20;
    }

    static get SHORT_BITS() {
        return [1, 4, 3];
    }

    static get LONG_BITS() {
        return [2, 6, 5]
    }

    constructor() {
        // private int[] nFilt = new int[8];
        this.nFilt = (new Int32Array(8)).fill(0);

        // private int[][] order = new int[8][4];
        this.order = (new Int32Array(8*4)).fill(0);
    }

    decode(bitStream, info) {
        const windowCount = info.getWindowCount();

        const bits = info.isEightShortFrame() ? TNS.SHORT_BITS : TNS.LONG_BITS;

        const order = this.order, nFilt = this.nFilt;

        let w, i, filt, coefLen, coefRes, coefCompress, tmp;

        for (w = 0; w < windowCount; w++) {
            if ((nFilt[w] = bitStream.readBits(bits[0])) !== 0) {
                coefRes = bitStream.readBit();

                for (filt = 0; filt < nFilt[w]; filt++) {
                    /*this.length[w][filt] =*/ bitStream.readBits(bits[1]);

                    if ((order[w*8+filt] = bitStream.readBits(bits[2])) > 20)
                        throw "TNS filter out of range: " + order[w*8+filt];
                    else if (order[w*8+filt] !== 0) {
                        /*this.direction[w][filt] = !!*/bitStream.readBit();
                        coefCompress = bitStream.readBit();
                        coefLen = coefRes + 3 - coefCompress;
                        tmp = 2 * coefCompress + coefRes;

                        for (i = 0; i < order[w*8+filt]; i++) {
                            // this.coef[w][filt][i] = TNS_TABLES[tmp][bitStream.readBits(coefLen)];
                            bitStream.readBits(coefLen)
                        }
                    }
                }
            }
        }
    }

    process(ics, spec, sf, decode) {
        // todo
    }
};

const TNS_COEF_1_3 = new Float32Array([
    0.00000000, -0.43388373, 0.64278758, 0.34202015
]);

const TNS_COEF_0_3 = new Float32Array([
    0.00000000, -0.43388373, -0.78183150, -0.97492790,
    0.98480773, 0.86602539, 0.64278758, 0.34202015
]);

const TNS_COEF_1_4 = new Float32Array([
    0.00000000, -0.20791170, -0.40673664, -0.58778524,
    0.67369562, 0.52643216, 0.36124167, 0.18374951
]);

const TNS_COEF_0_4 = new Float32Array([
    0.00000000, -0.20791170, -0.40673664, -0.58778524,
    -0.74314481, -0.86602539, -0.95105654, -0.99452192,
    0.99573416, 0.96182561, 0.89516330, 0.79801720,
    0.67369562, 0.52643216, 0.36124167, 0.18374951
]);

const TNS_TABLES = [
    TNS_COEF_0_3, TNS_COEF_0_4, TNS_COEF_1_3, TNS_COEF_1_4
];