// node browser.js --url=https://www.instagram.com --config=config.json
const puppeteer = require("puppeteer");
const minimist = require("minimist");
const fs = require("fs");
const { url } = require("inspector");
let xlsx = require("xlsx");


//to get url and other credentials for further used 
let args = minimist(process.argv);


//to convert the config.json file data into json object
let jso = fs.readFileSync("config.json", "utf-8");
let json = JSON.parse(jso);


(async () => {

    let browser = await puppeteer.launch({
        headless: false,
        args: [
            '--start-maximized' // you can also use '--start-fullscreen'
        ],
        defaultViewport: false
    });

    let pages = await browser.pages();
    await pages[0].goto(args.url);

    //Name id
    await pages[0].waitForSelector('[aria-label="Phone number, username or email address"]');
    await pages[0].click('[aria-label="Phone number, username or email address"]');
    let name = await pages[0].$('[aria-label="Phone number, username or email address"]');
    await name.type(json.id);

    //password
    await pages[0].waitForSelector('[aria-label="Password"]');
    await pages[0].click('[aria-label="Password"]');
    let password = await pages[0].$('[aria-label="Password"]');
    await password.type(json.password);


    //login click
    await pages[0].waitForSelector('[type="submit"]');
    await pages[0].click('[type="submit"]');

    //create filename to make file name
    let filename = 1;

    // create array of profile 
    let profile = [];


    try {
        await pages[0].waitForSelector('.aOOlW.HoLwm');
        await pages[0].click('.aOOlW.HoLwm');
    } catch (error) {

    }


    // console.log(json.search.length);

    for (let k = 0; k < json.search.length; k++) {

        filename = 1;

        //search
        if (k == 0) {
            await pages[0].waitForSelector('[placeholder="Search"]');
            await pages[0].click('[placeholder="Search"]');

            await pages[0].waitForSelector('[placeholder="Search"]');
            let search = await pages[0].$('[placeholder="Search"]');
            await search.type(json.search[k]);
        }
        else {
            await pages[0].waitForSelector('.aIYm8.coreSpriteSearchClear');
            await pages[0].click('.aIYm8.coreSpriteSearchClear');

            await pages[0].waitForSelector('[placeholder="Search"]');
            await pages[0].click('[placeholder="Search"]');

            await pages[0].keyboard.down('Control');
            await pages[0].keyboard.press('KeyA');
            await pages[0].keyboard.press('Backspace');
            await pages[0].keyboard.up('Control');

            await pages[0].waitForSelector('[placeholder="Search"]');
            let search = await pages[0].$('[placeholder="Search"]');
            await search.type(json.search[k]);
        }


        // await pages[0].waitFor(3000);
        await pages[0].waitForSelector('a.-qQT3');
        let person = await pages[0].$$eval('a.-qQT3', function (atags) {
            return atags[0].getAttribute('href');
        })

        // console.log(person);
        let personProfile = args.url + person;


        let page = await browser.newPage();
        page.goto(personProfile);

        //follow
        try {
            await page.waitForSelector('._5f5mN.jIbKX._6VtSN.yZn4P');
            await page.click('._5f5mN.jIbKX._6VtSN.yZn4P');
        } catch (error) {

        }

        await page.waitForSelector('.g47SY');
        let numberOfPosts = await page.$$eval('.g47SY', function (number) {
            return number[0].innerText;
        });

        await page.waitForSelector('.g47SY');
        let numberOfFollowers = await page.$$eval('.g47SY', function (number) {
            return number[1].innerText;
        });

        await page.waitForSelector('.g47SY');
        let numberOfFollowing = await page.$$eval('.g47SY', function (number) {
            return number[2].innerText;
        });
        // console.log(numberOfPosts); 

        await page.waitForSelector('.g47SY');
        let nameId = await page.$eval('._7UhW9.fKFbl.yUEEX.KV-D4.fDxYl', function (number) {
            return number.innerText;
        });

        await page.waitForSelector('.g47SY');
        let description = await page.$eval('.-vDIg>span', function (number) {
            return number.innerText;
        });


        profile.push({
            "Name": nameId,
            "Post_uploaded": numberOfPosts,
            "Followers": numberOfFollowers,
            "following": numberOfFollowing,
            "Description": description
        });



        const imgs = await page.$$eval('[decoding="auto"]', imgs => imgs.map(img => img.getAttribute('src')));

        for (let i = 0; i < imgs.length; i++) {

            let imgPage = browser.newPage();
            let viewSource = await page.goto(imgs[i]);

            fs.writeFile(json.search[k] + filename + ".png", await viewSource.buffer(), function (err) {
                if (err) {
                    return console.log(err);
                }


                console.log("The file was saved!");

            })

            filename = filename + 1;

        }
        await pages[0].bringToFront();
        //close the page
        await page.close();



    }

    //to create a .json file of detail of profiles that client gived 
    let data = JSON.stringify(profile);
    
    fs.writeFile("aprofile.json", data, function (err) {
        if (err) throw err;
        console.log('complete');
    }
    );

    //function call to write details of a profile in excel format
    // await excelWriter("detailsOfProfile.xlsx",data,"sheet-1");


    //way to convert the data into excel format

    let newwb = xlsx.utils.book_new();

    let newws = xlsx.utils.json_to_sheet(profile);

    xlsx.utils.book_append_sheet(newwb, newws, `sheet-1`);

    xlsx.writeFile(newwb, `detailsOfProfile.xlsx`);


    // to close the current browser 
    await browser.close()

})();


async function excelWriter(filepath, data, sheetname) {
    let newwb = xlsx.utils.book_new();
    let newws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(newwb, newws, sheetname);
    xlsx.writeFile(newwb, filepath);
}