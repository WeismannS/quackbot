const Discord = require('discord.js-selfbot-v13')
const logger = require('node-color-log')
const fs = require('fs')
const request = require('request')

const { token } = require('./config.json')
const activities = require('./activities.json')
const { msToRelativeTime, Command } = require('./helper.js')
const { lua_eval } = require('./evaluator.js')
if (!fs.existsSync('./logs')) {
  fs.mkdirSync('./logs')
}
logger.setDate(() => new Date().toLocaleTimeString())

const client = new Discord.Client({
  checkUpdate: false
})

const activities_list = activities.activities

client.on('ready', () => {
  console.log('Bot is online!')
  console.log(`Logged in as ${client.user.tag}!`)
  setInterval(() => {
    const index = Math.floor(Math.random() * (activities_list.length - 1) + 1)
    client.user.setActivity(activities_list[index])
  }, 5000)
})

function safe_message (to_send,msg) {
  if (to_send.length >= 500) {
    let dn = Date.now()
    fs.writeFileSync('./logs/' + dn + '.txt', to_send)
    let formData = {
      file: fs.createReadStream('./logs/' + dn + '.txt'),
    }
    request.post(
      { url: 'https://crepe.moe/upload', formData: formData },
      (err, res, body) => { if (err) {logger.error(err)}
        logger.info(body, 'Uploaded to crepe.moe > ', res)
        // remove the '.txt' from body
        let body_ = body.replace('.txt', '')
        msg.channel.send(`https://crepe.moe/${body_}`)
      }
    )
  } else {
    msg.channel.send(to_send)
  }
}

const messageCreateCommands = []
messageCreateCommands.push(
  new Command('All the functions and their usage', 'help', message => {
    let help_message = ''
    for (let i = 0; i < messageCreateCommands.length; i++) {
      help_message += `${messageCreateCommands[i].description}\nUsage: ${messageCreateCommands[i].usage}\n\n`
    }
    safe_message(help_message,message)
  }),
  new Command('?', 'ping', message => {
    message.channel.send(
      `🏓\nLatency is ${Date.now() -
        message.createdTimestamp}ms.\nAPI Latency is ${Math.round(
        client.ws.ping
      )}ms`
    )
  }),
  new Command('How long the bot has been on', 'uptime', message => {
    let uptime = client.uptime
    let uptime_r = `${msToRelativeTime(uptime)} ago`
    message.channel.send(`Uptime: ${uptime_r}`)
  }),
  new Command('Gets the pfp of a user', 'getpfp', message => {
    let user = message.mentions.users.first()
    if (user) {
      message.channel.send(`${user.avatarURL()}?size=4096`)
    } else {
      message.channel.send(`No user Specified`)
    }
  }),
  new Command('Echoes back what you say', 'echo', message => {
    let blocked = ['?echo']
    let args = message.content.split(' ')
    let echo_message = ''
    for (let i = 1; i < args.length; i++) {
      echo_message += `${args[i]} `
    }
    for (let i = 0; i < blocked.length; i++) {
      if (echo_message.includes(blocked[i])) {
        echo_message = `"${echo_message}"`
      }
    }
    safe_message(echo_message,message)
  }),
  new Command('Evaluates a code snippet (lua)', 'eval', message => {
    let args = message.content.split(' ')
    let code = ''
    for (let i = 1; i < args.length; i++) {
      code += `${args[i]} `
    }
    lua_eval(code).then(res => {
      let to_log = ''
      let res_json = JSON.parse(res)
      if (res_json.Errors) {
        logger.error(res_json.Errors)
        to_log = res_json.Errors
      }
      if (res_json.Warnings) {
        logger.warn(res_json.Warnings)
        to_log += res_json.Warnings
      }
      logger.info(res_json.Result)
      to_log += res_json.Result
      safe_message(to_log,message)
    })
  })
)

client.on('messageCreate', async message => {
  if (message.author.bot) return
  for (let i = 0; i < messageCreateCommands.length; i++) {
    let prefix = '>'
    let commandName = messageCreateCommands[i].usage
    let command = `${prefix}${commandName}`
    if (message.content.indexOf(command) === 0) {
      messageCreateCommands[i].cmd_function(message)
      logger.info(`${message.author.username}: ${message.content}`)
      logger.colorLog(
        {
          font: 'black',
          bg: 'yellow'
        },
        `> : ${messageCreateCommands[i].usage}`
      )
    }
  }
})
client.login(token)
