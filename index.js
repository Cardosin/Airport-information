const Discord = require('discord.js');
const fetch = require('node-fetch');
const moment = require('moment');
const DBL = require("dblapi.js");
const notams = require('notams');

// const fs = require('fs');
const bot = new Discord.Client();
const dbl = new DBL('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQzNjQwNjEwNjAxMzgyNzA3MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNTMwNjI1Nzg1fQ.b3jqwLoTxGjdgBk6LNjl2Y_MQSZixKzfVY9rsFuCrN0', bot);
// Server counts for discordbots website.
dbl.on('posted', () => {
    console.log('Server count posted!');
});
dbl.on('error', e => {
   console.log(`Oops! ${e}`);
});

// Prefix
const prefix = '+';

// By using moment we get the Zulu time.
let time = moment.utc();
let timeform = time.format('YYYY-MM-DD HH:mm:ss Z');
let timeform2 = time.format('HH:mm:ss Z');

    // Console loggers for when the bot connects.
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log('Connecting...');

// Functions
function fixKeys(json) {
    if (typeof(json) !== "object") {
        return json;
    }
    let keys = Object.keys(json);
    let result = {};
    keys.forEach((key) => {
        let cleanKey = key.replace(/-/g, "");
        result[cleanKey] = fixKeys(json[key]);
    });
    return result;
}

// Makes the bot not crash.
bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
bot.on("debug", (e) => console.info(e));
// Logging and actions when bot is ready to use.
bot.on('ready', () => {
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log(`
        _____                _____               __      _____  
        |  __ \\              |  __ \\              \\ \\    / /__ \\ 
        | |  | |_   _ _ __   | |  | |_   _ _ __    \\ \\  / /   ) |
        | |  | | | | | '_ \\  | |  | | | | | '_ \\    \\ \\/ /   / / 
        | |__| | |_| | | | | | |__| | |_| | | | |    \\  /   / /_ 
        |_____/ \\__,_|_| |_| |_____/ \\__,_|_| |_|     \\/   |____|
                                                                 
                                                                 `);
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    console.log('Connection Time                                   ' + timeform);
    console.log('– - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    let notam = notams(['EKCH'], {format: ''}).then(results => {
        console.log(results);
    });
    // Sets activity
    bot.user.setActivity('the weather || +info', {type: 'WATCHING'});
});


// For when someone sends a message
bot.on('message', async message => {

    // Regular things so it won't respond to itself nor work in DMs.
    if (message.author.bot) return;

    // Defining msg and args
    let msgArr = message.content.split(' ');
    let cmd = msgArr[0];
    let args = msgArr.slice(1);

    // Here comes the commands!
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Metar Command
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if(cmd == `${prefix}metar`) {
        console.log(`METAR for ${args}`);
        let argz = args.map(e=>e.toUpperCase());
        let reqURL = `https://avwx.rest/api/metar/${argz}?options=info,translate,speech`;
        message.channel.startTyping(true);
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.stopTyping(true);
        let METAREmbed = new Discord.RichEmbed()
            .setTitle(`${json.Info.City}, ${json.Info.Name} – ${json.Info.ICAO}`)
            .setColor([93, 233, 235])
            .addField('Readable Report:', `${json.Speech}`, true)
            .addField('RAW Report:',`${json.RawReport}`, true)
            .addField('Flight Rule:', `${json.FlightRules}`, true)
            .addBlankField(true)
            .addField('Time of Report', `${json.Meta.Timestamp}`, true)
            .addField('Wind', `${json.WindDirection} at ${json.WindSpeed} ${json.Units.WindSpeed}`, true)
            .addField('Visibility', `${json.Translations.Visibility}`, true)
            .addField('Clouds:', `${json.Translations.Clouds}`, true)
            .addField('Temperature:', `${json.Translations.Temperature}`, true)
            .addField('Dewpoint:', `${json.Translations.Dewpoint}`, true)
            .addField('QNH:', `${json.Translations.Altimeter}`, true)
            .addField('Remarks:', `${json.Remarks}` || 'NOSIG', true)
            .setFooter(`Requested at ${timeform2}`);
        message.channel.send(METAREmbed);
    }

    // TAF Command
    // https://avwx.rest/api/taf/EKCH?options=summary
    if (cmd == `${prefix}taf`) {
        console.log(`TAF for ${args}`);
        let argz = args.map(e=>e.toUpperCase());
        let reqURL = `https://avwx.rest/api/taf/${argz}?options=summary`;
        message.channel.startTyping(true);
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.stopTyping(true);
        let TAFEmbed = new Discord.RichEmbed()
            .setTitle(`TAF for ${json.Station}`)
            .setColor([99, 154, 210]) // Fix later.
            .addField('Raw Report', `${json.RawReport}`, true)
            .addBlankField(true)
            .addField('Readable', `${json.Forecast[0].Summary}`, true)
        message.channel.send(TAFEmbed);a
    }

    // NOTAM Command
    if (cmd == `${prefix}notam`) {
        notams([`${args}`], { format: 'DOMESTIC' }).then(result => {
            let notamEmbed = new Discord.RichEmbed()
            .setDescription(result[0].notams[1]);
            message.channel.send(`\`\`\`${result[0].notams[1]} \`\`\``);
            message.channel.send(notamEmbed);
        });
    }

    // ICAO Command
    // https://avwx.rest/api/metar/EKCH?options=info,translate,speech
    if (cmd == `${prefix}icao`) {
        console.log(`Checking ICAO for ${args}`);
        let reqURL = `https://avwx.rest/api/metar/${args}?options=info,translate,speech`;
        let response = await fetch(reqURL);
        let json = fixKeys(await response.json());
        let optText = (truthy, ifTrue, ifFalse = "") => truthy ? ifTrue : ifFalse;
        message.channel.send(`${json.Info.ICAO}'s full name is \`\`${json.Info.Name}\`\``);
    }

    // Ping Command to check connection.
    if (cmd == `${prefix}ping`) {
        console.log('Pong!');
        const editMsg = await message.channel.send('Why would you ping me?');
        editMsg.edit(`Pong! Roundtrip: ${editMsg.createdTimestamp - message.createdTimestamp}ms, heatbeat ${~~bot.ping}ms`);
   }

   // Uptime Command to check how long the bot hasa been up!
    if (cmd == `${prefix}uptime`) {
        let totalSeconds = (bot.uptime / 1000);
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        let days = Math.floor(totalSeconds / 86400);
        let uptimeEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Duns Uptime')
        .setDescription(`\`\`\`${days} Days, ${hours} hrs, ${minutes} mins, ${~~seconds} secs.\`\`\``)
        .setFooter('Wowie, maybe this is the longest time ol\' Dun-Dun has been up?!?!?!!');
        console.log(`Uptime: ${hours}, ${minutes}, ${~~seconds}`);
        message.channel.send(uptimeEmbed);
    }
    
    // Info Command
    if (cmd == `${prefix}info`) {
        console.log('Info');
        let infoEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun Information.')
        .setColor([55, 213, 252])
        .setDescription('Dun-Dun is a small Aviation bot that is mostly focused around weather.')
        .addField('Prefix:', '+', true)
        .addField('Getting started', '+help', true)
        .addField('Join the support server!', 'https://discord.gg/wf64e98', true)
        .addField('Please vote for the bot !', 'https://discordbots.org/bot/436406106013827072/vote', true)
        .setFooter('Bot made by Siaff#3293');
        message.channel.send(infoEmbed);
    }

    // Help Command.
    if (cmd == `${prefix}help`) {
        console.log('Helping');
        let helpEmbed = new Discord.RichEmbed()
        .setTitle('Dun-Dun to the rescue!')
        .setColor([43, 43, 255])
        .addField('+help', 'This command...', true)
        .addBlankField(true)
        .addField('+info', 'Gives some information about the bot.', true)
        .addField('+metar [ICAO]', 'Example \'+metar EKCH\'. Gives you METAR of any airport.', true)
        .addField('+uptime', 'Gives you the uptime of the bot.', true)
        .addBlankField(true)
        .addField('+ping', 'Pings the bot and gives you the bots ping.', true)
        .addField('+icao', 'If you supply an ICAO after the command it will give the Airports name.', true)
        .setFooter(`Requested by ${message.author.tag}`);
        message.channel.send(helpEmbed);
    }

    // Purge Command up to a 100.	
    if(cmd == `${prefix}purge`) {	
        // Checks server id. So it only works in Unga Flygare.
        if (message.guild.id != '380414605744275456') return message.channel.send('Shhhh, this only works in Siaffs private server!');
        if (isNaN(args)) return message.channel.send('**Please supply a valid amount of messages to purge**');	
        if (args > 100) return message.channel.send('**Please supply a number less than 100**');	
        // Logging	
        console.log(`Purged ${args} messages`);	
        let argz = Number(args);	
        message.channel.bulkDelete(argz + 1)	
        .then(messages => message.channel.send(`**Successfully deleted \`${messages.size - 1}/${args[0]}\` messages**`)	
        .then(message => message.delete(10000)));	
    }
    
    if (cmd == `${prefix}users`) {
        if (message.guild.id != '380414605744275456') return message.channel.send('Shhhh, this only works in Siaffs private server!');
        // message.channel.send(this.bot.users.size())
    }

});

// Login key for Dun Dunv2
// Token Removed.