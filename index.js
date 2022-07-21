const Discord = require('discord.js-selfbot-v13')
const { token } = require('./config.json')
const logger = require('node-color-log')
const activities = require('./activities.json')
const { msToRelativeTime, Command } = require('./helper.js')
const { lua_eval } = require('./evaluator.js')
const fs = require('fs')
if (!fs.existsSync('./database.json')) {
  fs.writeFileSync('./database.json', '{}')
}
const database = require('./database.json')
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

const messageCreateCommands = []
messageCreateCommands.push(
  new Command('ping', '?', 'ping', message => {
    message.channel.send(
      `🏓Latency is ${Date.now() -
        message.createdTimestamp}ms.\n🏓API Latency is ${Math.round(
        client.ws.ping
      )}ms`
    )
  }),
  new Command('uptime', 'How long the bot has been on', 'uptime', message => {
    let uptime = client.uptime
    let uptime_r = `${msToRelativeTime(uptime)} ago`
    message.channel.send(`Uptime: ${uptime_r}`)
  }),
  new Command('help', 'All the functions and their usage', 'help', message => {
    let help_message = ''
    for (let i = 0; i < messageCreateCommands.length; i++) {
      help_message += `${messageCreateCommands[i].name}: ${messageCreateCommands[i].description}\nUsage: ${messageCreateCommands[i].usage}\n\n`
    }
    message.channel.send(help_message)
  }),
  new Command('getpfp', 'Gets the pfp of a user', 'getpfp', message => {
    let user = message.mentions.users.first()
    if (user) {
      message.channel.send(`${user.avatarURL()}?size=4096`)
    } else {
      message.channel.send(`No user Specified`)
    }
  }),
  new Command('echo', 'Echoes back what you say', 'echo', message => {
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
    message.channel.send(echo_message)
  }),
  new Command('eval', 'Evaluates a code snippet (lua)', 'eval', message => {
    let args = message.content.split(' ')
    lua_eval(args[1]).then(res => {
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
      message.channel.send(to_log)
    })
  })
)

client.on('messageCreate', async message => {
  if (message.author.bot) return
  for (let i = 0; i < messageCreateCommands.length; i++) {
    let prefix = '>'
    let commandName = messageCreateCommands[i].name
    let command = `${prefix}${commandName}`
    if (message.content.indexOf(command) === 0) {
      messageCreateCommands[i].cmd_function(message)
      logger.info(`${message.author.username}: ${message.content}`)
      logger.colorLog(
        {
          font: 'black',
          bg: 'yellow'
        },
        `> : ${messageCreateCommands[i].name}`
      )
    }
  }
})
client.login(token)
