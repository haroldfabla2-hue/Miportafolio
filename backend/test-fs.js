const fs = require('fs');
try {
    if (!fs.existsSync('dist-test-node')) {
        fs.mkdirSync('dist-test-node');
        console.log('Directory created successfully');
    } else {
        console.log('Directory already exists');
    }
    fs.writeFileSync('dist-test-node/test.txt', 'Hello World');
    console.log('File written successfully');
} catch (error) {
    console.error('FS operation failed:', error);
}
