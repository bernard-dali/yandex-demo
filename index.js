import puppeteer from "puppeteer";
import { Solver } from "2captcha-ts";
const solver = new Solver('2captcha-api-key');

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    // devlools: true
  });

  const page = await browser.newPage();

  // open page
  await page.goto("https://captcha-api.yandex.en/demo");
  await page.waitForSelector("#captcha-container");
  await page.waitForSelector("iframe");

  // type data
  await page.$eval("#name", (element) => (element.value = ""));
  await page.type("#name", "Elon Musk");

  // grab `sitekey` value
  const sitekey = await page.evaluate(() => document.querySelector("#captcha-container").getAttribute("data-sitekey"));

  // solve Yandex captcha in 2captcha service
  const result = await solver.yandexSmart({
    pageurl: "https://captcha-api.yandex.ru/demo",
    sitekey: sitekey,
  });

  console.log("result:")
  console.log(result);

  // the resulting solution
  const captchaToken = result.data;

  // use captchaToken solution
  const setAnswer = await page.evaluate((captchaToken) => {
    document.querySelector("input[data-testid='smart-token']").value = captchaToken
  }, captchaToken);

  // check
  page.evaluate(() => document.querySelector("#smartcaptcha-demo-submit").click());

  await page.waitForSelector(".greeting");
  console.log("Done!!! Captcha solved.");

  // browser.close();
})();
