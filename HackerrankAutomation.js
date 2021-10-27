//CLI -->

//1.To fire the code --> node HackerrankAutomation.js --url="https://www.hackerrank.com" --config=config.json

//2.Libararies
//npm init -y
//npm install puppeteer
//npm install minimist

//let start with the code for Automating the process to add moderators in hackerrank contest <code>

let minimist = require("minimist");
let puppeteer=require("puppeteer");
let args=minimist(process.argv);
let fs=require("fs");

//console.log(clargs.url+" "+clargs.config); ekbar chweck krlo ki args shi se read horhe hai na

// now to need to open the browser and click on the first page
let configJSON=fs.readFileSync(args.config);
let configJSO=JSON.parse(configJSON);
//console.log(configJSO); ekbar print krake dekhlete hai ki jso shise read to hoparhi hai na

//calling the run function
 run();//ye khule me(jab ye function kisi function k andar na ho) vha await nhi likhskte, simple call krdo function ko
 //defin ing the run function
 async function run()
 {
     //1.start/open the browser
     let browser=await puppeteer.launch({
                                           defaultViewport :null,//us browser k andar jo content hai vo full screen khulega
                                           args:[
                                                  "--start-maximized"//full screen browser dikhega
                                                ],
                                           headless:false //work hote hue hume dikhega
                                       })
     //2.get a tab
      let pages=await browser.pages();
      let page=pages[0];
       
     //3.go to url
      await page.goto(args.url);

      //4.click on login on page 1
      await page.waitForSelector("a[data-event-action='Login']");
      await page.click("a[data-event-action='Login']");

      //5.click on login on page 2
      await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
      await page.click("a[href='https://www.hackerrank.com/login']");

      //6.type username/userid on page 3
      await page.waitForSelector("input[name='username']");
      await page.type("input[name='username']",configJSO.userid,{delay:50});
     
      //7.type password on page 3
      await page.waitForSelector("input[name='password']");
      await page.type("input[name='password']",configJSO.password,{delay:50});
      await page.waitFor(3000);
    
      //8.click on login on page 3
      await page.waitForSelector("button[data-analytics='LoginPassword']");
      await page.waitFor(3000);
      await page.click("button[data-analytics='LoginPassword']");
      await page.waitFor(3000);
      //9.click on compete after successful logging in
      await page.waitForSelector("a[data-analytics='NavBarContests']");
      await page.click("a[data-analytics='NavBarContests']");

      await page.waitFor(3000); 
      //click on manage contests
      await page.waitForSelector("a[href='/administration/contests/']");
      await page.click("a[href='/administration/contests/']");

      //now , we need to check how many pages of contest we have in manage contest therefore , we need to click on double right triangle button
      // we need to inspect double right angle triangle
      await page.waitFor(3000); 
      await page.waitForSelector("a[data-attr1='Last']");//hume last page par jana hai 
      let numPages=await page.$eval("a[data-attr1='Last']",function(lastTag)//$eval wait for selector chlayega aur jo result aayega use given function me pass krdega
                                                          {
                                                           //we are selecting the value of data pages attribute from the selector
                                                            let numpages=parseInt(lastTag.getAttribute('data-page'));
                                                           //converting the string into integer format
                                                            return numpages
                                                            
       
                                                         });
      await page.waitFor(3000); 
      console.log(numPages);//ekbar num of pages print krake dekhlena
      //we got numpages now , now we need on the next page button (numPages-1) times ,hume right vale page of n-1 times jana hai
   await page.waitFor(3000);
   for (let i = 0; i < numPages; i++)//move through all pages 
   {
     await handlePage(browser,page);
   }
 } 
 //now we will handle the code for adding moderators in all contest of a page 
async function handlePage(browser,page)
{
await page.waitForSelector("a.backbone.block-center");
let curls=await page.$$eval("a.backbone.block-center",function(atags){//curls mtlb contest url
                                                                    let iurls=[];//inner urls 
                                                                    for(let i=0;i<atags.length;i++)
                                                                    {
                                                                      let url=atags[i].getAttribute("href");
                                                                      iurls.push(url);
                                                                    }
                                                                    return iurls;
                                                                    });

      console.log(curls); //ekbar urls print krke dekhlene chahiye of all contests in pages
        for(let i=0;i<curls.length;i++)
        {
          await handlecontest(browser,page,curls[i]);
        }
  //to move on the next page 
  await page.waitFor(1500);//1.5 seconds ka wait krlete hai next page me jane se phle taki current page thoda set hojaye
  await page.waitForSelector("a[data-attr1='Right']");
  await page.click("a[data-attr1='Right']");
  await page.waitFor(3000);

}

async function handlecontest(browser,page,curl)
{
  let npage=await browser.newPage();
   await npage.goto(args.url + curl);
   await npage.waitFor(3000);

//click on moderators tab
   await npage.waitForSelector("li[data-tab='moderators']");
   await npage.click("li[data-tab='moderators']");
   await npage.waitFor(3000);

//type the moderator ids
   for(let i=0;i<configJSO.moderators.length;i++)
   {
     let moderator=configJSO.moderators[i];
   await npage.waitForSelector("input#moderator");
   await npage.type("input#moderator",moderator,{delay:50});
   await npage.waitFor(3000);
   
//now we need to press enter to save the moderator
 await npage.keyboard.press("Enter");
 await npage.waitFor(3000);  
   }
//close the current contest to continue the loop for all contest of all pages
   await npage.close();
   await page.waitFor(3000); 
  
}
