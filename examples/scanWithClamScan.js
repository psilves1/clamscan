// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');
const fs = require('fs');

//switch between these two for happy/sad path testing
const fakeVirusUrl = 'https://www.eicar.org/download/eicar-com-2/?wpdmdl=8842&refresh=661ef9d576b211713306069';
const samplePDFUrl = 'https://pdfobject.com/pdf/sample.pdf';
const tempDir = __dirname;
const scanFile = `${tempDir}/tmp_file.txt`;

/**
 * This script demonstrates how to scan a file for viruses without requiring a permanent ClamAV daemon.
 * It provides an example of configuring the 'clamscan' command for one-time file scans, including downloading
 * a test virus file from the internet, scanning it with ClamAV, and handling the results.
 * 
 * Configuration options for both 'clamscan' and 'clamdscan' are included to showcase different 
 * scanning setups, such as bypassing certain tests, defining timeouts, and setting file scan preferences.
 * 
 * This example uses a test virus file from the EICAR website, which is safe and non-malicious, 
 * designed to verify that the virus scanning functionality works correctly.
 */

// Initialize the clamscan module
const NodeClam = require('../index'); // Offically: require('clamscan');
const { type } = require('os');

(async () => {
    const clamscan = await new NodeClam().init({
        debugMode: true,
        clamdscan: {
            bypassTest: true,
            host: 'localhost',
            port: 3310,
            // socket: '/var/run/clamd.scan/clamd.sock',
            active: false
        },
        clamscan: {
            path: '/usr/local/bin/clamscan',
            scanPdf: false,
            maxScanTime: 120000,
            active: true
        },
        preference: 'clamscan'
    });
    
    let body;

    // Request a test file from the internet...
    try {
        body = await axios.get(fakeVirusUrl, {
            responseType: 'arraybuffer',  // Ensure the file is returned as binary data
          });
        //console.log(JSON.stringify(body.data))
    } catch (err) {
        if (err.response) console.error(`${err.response.status}: Request Failed. `, err.response.data);
        else if (err.request) console.error('Error with Request: ', err.request);
        else console.error('Error: ', err.message);
        process.exit(1);
    }

    // Write the file to the filesystem
    fs.writeFileSync(scanFile, body.data);

    // Scan the file
    try {
        const { file, isInfected, viruses } = await clamscan.isInfected(scanFile);

        // If `isInfected` is TRUE, file is a virus!
        if (isInfected === true) {
            console.log(
                `You've downloaded a virus (${viruses.join(
                    ''
                )})! Don't worry, it's only a test one and is not malicious...`
            );
        } else if (isInfected === null) {
            console.log("Something didn't work right...");
        } else if (isInfected === false) {
            console.log(`The file (${file}) you downloaded was just fine... Carry on...`);
        }

        // Remove the file (for good measure)
        //if (fs.existsSync(scanFile)) fs.unlinkSync(scanFile);
        process.exit(0);
    } catch (err) {
        console.error(`ERROR: ${err}`);
        console.trace(err.stack);
        process.exit(1);
    }
})();
