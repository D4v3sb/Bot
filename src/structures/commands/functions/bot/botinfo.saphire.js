import { Database, TwitchManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e, Byte } from "../../../../util/util.js"
import { ButtonStyle, version as DiscordJsVersion } from 'discord.js'
import { Config } from "../../../../util/Constants.js"
import { readFileSync } from 'fs'
import os from 'os'
const packageData = JSON.parse(readFileSync('./package.json'))
let timeouts = []
const Timeouts = {}
const awaiting = {}

// SlashCommand & Button Interaction
export default async (interaction, commandData) => {

    if (commandData && commandData?.userId !== interaction.user.id)
        return await interaction.reply({
            content: `${e.Deny} | Calma calma, só <@${commandData.userId}> pode clicar aqui, ok?`,
            ephemeral: true
        })

    let message = undefined

    if (awaiting[interaction.user.id] && Timeouts[interaction.user.id] >= 5000)
        return interaction.reply({ content: `⏱️ | Você abusou muito desse comando... Você está sofrendo um cooldown de mais de ${Date.stringDate(Timeouts[interaction.user.id])}, ok?` })

    if (awaiting[interaction.user.id])
        return interaction.reply({ content: `${e.Deny} | [SYSTEM INFO COOLDOWN] | Você já tem uma solicitação em aberto, ok?`, ephemeral: true })

    const button = {
        type: 1,
        components: [
            {
                type: 2,
                label: 'Atualizando...',
                emoji: e.Loading,
                custom_id: 'refreshing',
                style: ButtonStyle.Primary,
                disabled: true
            }
        ]
    }

    if (timeouts.some(userId => userId == interaction.user.id)) {
        Timeouts[interaction.user.id] ? Timeouts[interaction.user.id] += 700 : Timeouts[interaction.user.id] = 2500
        awaiting[interaction.user.id] = true

        message = commandData
            ? await interaction.update({ components: [button], fetchReply: true }).catch(() => { })
            : await interaction.reply({ components: [button], fetchReply: true }).catch(() => { })

        return setTimeout(() => sendData(), Timeouts[interaction.user.id] || 0)
    } else {
        if (!Timeouts[interaction.user.id]) Timeouts[interaction.user.id] = 2500

        message = commandData
            ? await interaction.update({ components: [button], fetchReply: true }).catch(() => { })
            : await interaction.reply({ components: [button], fetchReply: true }).catch(() => { })

        return sendData()
    }

    async function sendData() {
        timeouts.push(interaction.user.id)
        awaiting[interaction.user.id] = true

        const shard = await client.shard.broadcastEval(shard => ({
            allUsers: shard.users.cache.size,
            allGuilds: shard.guilds.cache.size,
            allChannels: shard.channels.cache.size,
            allEmojis: shard.emojis.cache.size
        }))
            .catch(() => ([{
                allUsers: client.users.cache.size,
                allGuilds: client.guilds.cache.size,
                allChannels: client.channels.cache.size,
                allEmojis: client.emojis.cache.size
            }]))

        const shardData = shard.reduce((prev, cur) => {
            prev.allUsers += cur.allUsers
            prev.allGuilds += cur.allGuilds
            prev.allChannels += cur.allChannels
            prev.allEmojis += cur.allEmojis
            return prev
        }, {
            allUsers: 0,
            allGuilds: 0,
            allChannels: 0,
            allEmojis: 0,
        })

        const data = {
            developer: await client.users.fetch(Config.ownerId || '0').then(user => `${user.tag} - ${Config.ownerId}`).catch(() => `Rody#1000 - ${Config.ownerId}`),
            usersShardInCache: client.users.cache.size || 0,
            guildsShardInCache: client.guilds.cache.size || 0,
            channelsShardInCache: client.channels.cache.size || 0,
            emojisShardInCache: client.emojis.cache.size || 0,
            allUsers: shardData.allUsers,
            allGuilds: shardData.allGuilds,
            allChannels: shardData.allChannels,
            allEmojis: shardData.allEmojis,
            version: client.moonId == client.user.id ? 'Saphire' : 'Canary',
            uptime: Date.stringDate(client.uptime),
            ping: `${client.ws.ping}ms`,
            commandsSize: client.slashCommands.size || 0,
            greetingTime: getGreetingTime(),
            emojisHandlerCount: Object.keys(e).length,
            hostname: os.hostname(),
            archtecture: os.arch(),
            processor: os.cpus()[0].model,
            platform: os.platform(),
            totalMen: os.totalmem(),
            memoryUsage: process.memoryUsage().heapUsed,
            popularCommands: Object.entries(client.commandsUsed)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([cmdName, count]) => `${cmdName}: ${count}`)
                .join('\n')
        }

        const { primary, accumulate } = client.uptimeAllTime
        const timeDifference = primary.valueOf() // 100% all time online
        let result = (timeDifference / (Date.now() - accumulate)) * 100
        if (result > 100) result = 100
        const userTag = interaction.user.tag

        const rankingHi = [
            `Eai ${userTag},`,
            `Tudo bom ${userTag}?`,
            `Alô ${userTag},`,
            `Hey hey ${userTag},`,
            `Eai ${userTag}, como tem passado?`,
            `Olá ${userTag},`,
            `Opa ${userTag},`,
            `Oi oi ${userTag},`,
            `Aoba ${userTag},`,
            `Coé ${userTag},`
        ].random()

        const clientData = await Database.Client.findOne({ id: client.user.id }, 'TwitchNotifications')
        const TwitchNotifications = (clientData?.TwitchNotifications || 0) + TwitchManager.notifications

        const embed = {
            color: client.blue,
            title: `🔎 Minhas Informações Técnicas`,
            description: `${rankingHi} ${data.greetingTime}.`,
            fields: [
                {
                    name: '📜 Números do Cliente',
                    value: `\`\`\`txt\nShard: ${client.shardId}\nUsuários: ${data.usersShardInCache}\nServidores: ${data.guildsShardInCache}\nCanais: ${data.channelsShardInCache}\nEmojis: ${data.emojisShardInCache}\nOnline: ${result.toFixed(2)}%\nCluster: ${client.clusterName}\n\`\`\``,
                    inline: true
                },
                {
                    name: '🧩 Números das Shards',
                    value: `\`\`\`txt\nShards: ${client.shard.count}\nUsuários: ${data.allUsers}\nServidores: ${data.allGuilds}\nCanais: ${data.allChannels}\nEmojis: ${data.allEmojis}\nOnline: ${result.toFixed(2)}%\nCluster: ${client.clusterName}${"".padEnd(3)}\n\`\`\``,
                    inline: true
                },
                {
                    name: `${e.discloud} Hospedagem`,
                    value: `\`\`\`txt\nProcessador: ${data.processor}\nArquitetura: ${data.archtecture}\nPlataforma: ${data.platform}\nRAM: ${new Byte(data.memoryUsage)}\nTotal: ${new Byte(data.totalMen)}\n\`\`\``,
                    inline: true
                },
                {
                    name: '⚙️ Desenvolvimento',
                    value: `\`\`\`txt\nLinguagem: JavaScript ES6 Modules\nLivraria: Discord.js (${DiscordJsVersion})\nAmbiente: Node.js (${process.version})\nClient Version: ${data.version} (${packageData.version || 'Primary'})\nHost: discloud.app\n\`\`\``,
                    inline: false
                },
                {
                    name: '🛰️ Informações Gerais',
                    value: `\`\`\`txt\nShard Ping: ${data.ping}\nTempo Online: ${data.uptime}\nCriador: ${data.developer}\nComandos: ${data.commandsSize} disponíveis\nMensagens: ${client.messages?.currency()}\nInterações: ${client.interactions?.currency()}\nEmoji Handler: ${data.emojisHandlerCount}\n\`\`\``,
                    inline: false
                },
                {
                    name: `${e.slash} Comandos Populares`,
                    value: `\`\`\`txt\n${data.popularCommands}\n\`\`\``,
                    inline: false
                },
                {
                    name: `${e.twitch} Twitch System`,
                    value: `\`\`\`txt\nStreamers: ${TwitchManager.streamersOffline.length + TwitchManager.streamersOnline.length}\nNotificações Enviadas: ${TwitchNotifications}\nStreamers Online: ${TwitchManager.streamersOnline.length}\nStreamers Offline: ${TwitchManager.streamersOffline.length}\nServidores Registrados: ${TwitchManager.allGuildsID.length}\nRequisições em Espera: ${TwitchManager.awaitingRequests}\n\`\`\``,
                    inline: false
                },
            ],
            footer: {
                text: `💚 Powered by discloud.app | From Cluster ${client.clusterName}`
            }
        }

        const button = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Cooldown',
                    emoji: e.Loading,
                    custom_id: JSON.stringify({ c: 'botinfo', userId: interaction.user.id }),
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }

        message = commandData
            ? await interaction.message.edit({ content: null, embeds: [embed], components: [button] }).catch(() => resend(embed))
            : await interaction.editReply({ content: null, embeds: [embed], components: [button], fetchReply: true }).catch(() => resend(embed))
        return removeTimeout(button)
    }

    function resend(embed) {
        return interaction.channel.send({ content: null, embeds: [embed], components: [button] })
    }

    function getGreetingTime() {
        const data = [
            { hour: [0, 1, 2, 3, 4, 5], reply: 'Boa madrugada' },
            { hour: [6, 7, 8, 9, 10, 11], reply: 'Bom dia' },
            { hour: [12, 13, 14, 15, 16, 17], reply: 'Boa tarde' },
            { hour: [18, 19, 20, 21, 22, 23], reply: 'Boa noite' },
        ].find(value => value.hour.includes(new Date().getHours()))
        return data.reply // 'Boa madrugada' | 'Bom dia' | 'Boa tarde' | 'Boa noite'
    }

    function removeTimeout(button) {
        setTimeout(() => {
            button.components[0].disabled = false
            button.components[0].label = 'Atualizar Dados'
            button.components[0].emoji = '🔄'
            button.components.push({
                type: 2,
                label: 'Ping',
                emoji: '🏓',
                custom_id: JSON.stringify({ c: 'ping' }),
                style: ButtonStyle.Primary
            })
            message.edit({ components: [button] }).catch(() => { })
            delete awaiting[interaction.user.id]
            timeouts = timeouts.filter(userId => userId != interaction.user.id)
        }, Timeouts[interaction.user.id] || 0)
        return;
    }
}