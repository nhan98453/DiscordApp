const fs = require("fs");
const request = require("request");
const async = require("async");
const cron = require("node-cron");
const NodeCache = require( "node-cache" );
const cache = new NodeCache();
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Discord Logged in as ${client.user.tag}!`);
  cron.schedule("*/15 * * * * *", function() {
    console.log("---------------------");
    console.log("Running Cron Job");
    let options = { method: 'GET',
      url: 'https://gateway.chotot.com/v1/public/ad-listing',
      json: true,
      qs:
       { region_v2: '13000',
         arena_id: '13112',
		 category_id:'1020',
		 limit:'20',
		 offset:'0',
		 regionId:'13000',
		 subRegionId:'13112',
		 categoryId:'1020',
		 st:'u'},
      headers:
       { 'Postman-Token': '513bb4d8-22b2-44c6-b830-aa612fd2e2e3',
         'cache-control': 'no-cache' } };

    request(options, function (error, response, body) {
      if (error) {
        return console.error(error.message)
      }

      if (response.statusCode != 200) {
        return
      }

      console.log(body.ads.length)
      async.each(body.ads, (ad, callback) => {
        if (cache.get(ad.ad_id) != undefined) {
          console.log(`Already sent: ${ad.ad_id}`)
          return
        }

        cache.set(ad.ad_id, true)
        let image = ad.image || "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
        client.channels.get("550512186951204887").send(`
          ===============================================\n**${ad.subject}**\n***${ad.price_string}***\n*${ad.area_name} - ${ad.region_name}*\n*https://nha.chotot.com/${ad.list_id}.htm*
        `, {
          files: [`${image}?file=file.png`]
        }).then(() => {
          return callback()
        }).catch(err => {
          console.log(`Send to discord err: ${err.message}`)
          console.log(ad)
          return callback()
        })
      }, (err) => {

      });
    });
  });
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
});

client.login('NTUwNTEyNjEyNzk0Njk1Njgw.D1jgag.qXn_ZNcFV-S72rKHpT2y3h78y7o');