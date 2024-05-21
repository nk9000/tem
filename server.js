const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to enable CORS
app.use(cors());

// Function to get followers count
async function getFollowersCount(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2' }); 
        await page.waitForSelector('.MjjYud'); 
        
        const followersCount = await page.evaluate(() => {
            const element = document.querySelector('.MjjYud');
            if (element) {
                const description = element.querySelector('.VwiC3b')?.innerText;
                if (description) {
                    const match = description.match(/(\d[\d,]*)\s+followers/);
                    return match ? match[1].replace(/,/g, '') : null;
                }
            }
            return null;
        });
        return followersCount;
    } catch (error) {
        console.error(`Error fetching followers for URL: ${url}`, error);
        return null;
    } finally {
        await browser.close();
    }
}

// API endpoint
app.post('/x', async (req, res) => {
    const { abc } = req.body;

    if (!Array.isArray(abc)) {
        return res.status(400).json({ error: 'Invalid input format. Expected an array.' });
    }

    const urls = abc.map(domain => `https://www.google.com/search?q=${domain.split('.')[1]}+linkedin`);

    try {
        const results = await Promise.all(urls.map(async url => {
            const followersCount = await getFollowersCount(url);
            return { url, followersCount };
        }));

        res.json(results);
    } catch (error) {
        console.error('Error processing requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use("/" , (req,res)=>{
    res.json({
        status:"Api working" ,
        code:200
    })
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    
});
