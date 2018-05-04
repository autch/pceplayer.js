module.exports = {
    mode: 'production',
    entry: {
        muslib: __dirname + '/src/muslib.js',
        browser: __dirname + '/src/browser.js'
    },
    output: {
        path: __dirname + '/dist/', //ビルドしたファイルを吐き出す場所
        filename: '[name].dist.js' //ビルドした後のファイル名
    },
};
