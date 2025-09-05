const express = require('express');
//const puppeteer = require('puppeteer');
const { chromium } = require('playwright');
const cors = require('cors');
//const axios = require('axios');

const app = express();
const port = 3123;

app.use(cors());

const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
];

function getRandomUserAgent() {
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

function getRandomViewport() {
  const width = Math.floor(Math.random() * (1920 - 1366 + 1)) + 1366;
  const height = Math.floor(Math.random() * (1080 - 768 + 1)) + 768;
  return { width, height };
}

async function createStealthBrowserContext() {
  const browser = await chromium.launch({
    headless: false, // Set to false to evade detection
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--remote-debugging-port=9214']
  });

  const context = await browser.newContext({
    viewport: getRandomViewport(),
    userAgent: getRandomUserAgent(),
    cacheEnabled: false,
    javaScriptEnabled: true,
    extraHTTPHeaders: {
      'accept-language': 'en-US,en;q=0.9'
    }
  });

  return { browser, context };
}


app.get('/fetch-ali', async (req, res) => {
  const { url } = req.query;

  try {
    const { browser, context } = await createStealthBrowserContext();
    const page = await context.newPage();

    console.log('Navigating to the URL:', url);

    // Navigate to the URL and wait until DOM content is loaded
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 40000 }); // Increased timeout to 20 seconds

    console.log('Waiting for 5 seconds to ensure page has time to load.');
    // Wait for a fixed period to allow dynamic content to load
    await page.waitForTimeout(20000); // Wait for 5 seconds

    console.log('Extracting page content.');

    // Extract the full page content
    const bodyContent = await page.content();

    // Close the browser
    await browser.close();

    // Send the extracted content
    res.send(bodyContent);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send(`Error fetching data: ${error.message}\n${error.stack}`);
  }
});

app.get('/fetch-temu', async (req, res) => {
  const { url } = req.query;

  try {
    const { browser, context } = await createStealthBrowserContext();
    const page = await context.newPage();

    console.log('Navigating to the URL:', url);

    // Navigate to the URL and wait until DOM content is loaded
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 5000 }); // Increased timeout to 20 seconds

    console.log('Waiting for 5 seconds to ensure page has time to load.');
    // Wait for a fixed period to allow dynamic content to load
    await page.waitForTimeout(2000); // Wait for 5 seconds

    console.log('Extracting page content.');

    // Extract the full page content
    const bodyContent = await page.content();

    // Close the browser
    await browser.close();

    // Send the extracted content
    res.send(bodyContent);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send(`Error fetching data: ${error.message}\n${error.stack}`);
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
