const request = require("request");
const cheerio = require("cheerio");
const covidHistory = require('./covid.json');
const fs = require('fs');
getCurrentTime = () => {
  let time = new Date().getTime();
  return time;
}

let covidData = covidHistory;

request({
  method: 'GET',
  url: "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_California"
}, (err, res, body) => {
  if (err) return console.error(err);
  console.log('res', res && res.statusCode)
  if (res.statusCode == 200) {
    let data = []
    let $ = cheerio.load(body);
    $('.tp-container tbody tr').each((index, el) => {
      // console.log($(el).text())
      if (index < 41 && index > 2) {
        data.push($(el).text());
      }
    })
    let newData = [];
    data.forEach(county => {
      const datastr = JSON.stringify(county).split('\\n');
      if (datastr[1] && parseInt(datastr[3])) {
        const datas = {
          "county": datastr[1],
          "case": parseInt(datastr[3]),
          "death": parseInt(datastr[5])
        }
        newData.push(datas);
      }
    })
    
    let timeseriesData = {
      timeStamp: getCurrentTime(),
      data: newData
    }
    covidData.push(timeseriesData);
    fs.writeFile(`covidUpdate.json`, JSON.stringify(covidData, null, 2), function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('finish writing file')
      }

    })
  } else {
    console.log('failed',res.statusCode)
  }
});