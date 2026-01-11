import puppeteer from 'puppeteer';
import fs from 'fs';

export const generatePdf = async (req, res) => {
    try {
        const { url } = req.body;

        if (!url) {
            return res.status(400).send('URL is required');
        }

        console.log(`Generating PDF for URL: ${url}`);

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // 🔹 Debug: Capture Puppeteer console and errors to file
        const logStream = fs.createWriteStream('debug_pdf.txt', { flags: 'a' });
        logStream.write(`\n--- NEW PDF REQUEST: ${new Date().toISOString()} ---\n`);
        logStream.write(`URL: ${url}\n`);

        page.on('console', msg => logStream.write(`PUPPETEER CONSOLE: ${msg.text()}\n`));
        page.on('pageerror', error => logStream.write(`PUPPETEER PAGE ERROR: ${error.message}\n`));
        page.on('requestfailed', request => logStream.write(`PUPPETEER REQ FAILED: ${request.url()} - ${request.failure()?.errorText}\n`));

        // Emulate screen media to ensure WYSIWYG
        await page.emulateMediaType('screen');

        // Set viewport to A4 dimensions (approx) to trigger correct media queries if any
        await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 }); // High DPI for crisp text

        // Navigate to the URL
        await page.goto(url, {
            waitUntil: ['networkidle2', 'domcontentloaded'],
            timeout: 60000
        });

        // Wait for React to finish rendering
        try {
            await page.waitForSelector('#pdf-ready', { timeout: 10000 });
            // 🔹 Small extra buffer to allow CSS/Images to settle
            await new Promise(r => setTimeout(r, 1000));
        } catch (e) {
            logStream.write(`Detailed rendering error: Timeout waiting for #pdf-ready\n`);
        }

        // Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                bottom: '0px',
                left: '0px',
                right: '0px'
            },
            preferCSSPageSize: true
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Length': pdfBuffer.length,
        });

        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        res.status(500).send('Error generating PDF');
    }
};
