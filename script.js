import {chromium} from "playwright";
import {createObjectCsvWriter} from 'csv-writer';


(async () => {

    console.log('=> start of scraping data...')
    // Setup
    const browser = await chromium.launch({
        headless: true
    });

    const page = await browser.newPage();
    await page.goto('https://www.bonhommedebois.com/nos-univers-de-jouets/naissance.html?mr_filter_marques=5737');
    await page.waitForLoadState('domcontentloaded');
    const products = await page.$$eval('.product-item-info', divs => {
        const data = [];
        divs.forEach(div => {
            data.push({
                productName: div.querySelector('.product-item-link').textContent,
                price: div.querySelector('.price').textContent.replace(/\u00a0/g, ''),
                url: div.querySelector('.product-image-photo').getAttribute('data-src')
            });
        });
        return data;
    })

    console.log(`=> collect ${products.length} products`)
    console.log('=> End of collect')

    const csvWriter = createObjectCsvWriter({
        path: 'products.csv',
        header: [
            {id: 'productName', title: 'Name'},
            {id: 'price', title: 'Price'},
            {id: 'url', title: 'Url'},
        ]
    });
    csvWriter
        .writeRecords(products)
        .then(()=> console.log('The CSV file was written successfully'));
    await browser.close();
})()