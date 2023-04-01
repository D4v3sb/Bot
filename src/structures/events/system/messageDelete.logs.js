import { AuditLogEvent, Message } from "discord.js"
import { Emojis as e } from "../../../util/util.js"
import { Database, SaphireClient as client } from "../../../classes/index.js"

/**
 * @param { Message } message
 */
export default async message => {

    if (message.partial) return

    const { guild, author, type } = message
    if (type !== 0 || author?.bot) return

    const guildData = await Database.Guild.findOne({ id: guild.id }, "LogSystem")
    if (!guildData || !guildData.LogSystem?.channel || !guildData.LogSystem?.messages?.active) return

    const channel = await guild.channels.fetch(guildData.LogSystem?.channel).catch(() => null)
    if (!channel) return

    const auditory = await guild.fetchAuditLogs({ type: AuditLogEvent.MessageDelete }).catch(() => null)
    if (!auditory) return

    const entry = auditory?.entries?.first()
    const lastId = await Database.Cache.General.get(`${guild.id}.LastEntriesID`)
    let { executor } = entry
    if (lastId == entry?.id) executor = author
    await Database.Cache.General.set(`${guild.id}.LastEntriesID`, entry.id)

    const embeds = [{
        color: client.blue,
        title: "Dados da mensagem deletada",
        description: `Esta mensagem foi apagada no canal ${message.channel}`,
        fields: [
            {
                name: '👤 Autor(a)',
                value: `- ${author?.tag || "Not Found"} - \`${author?.id || 0}\``
            },
            {
                name: `${e.ModShield} Quem apagou`,
                value: `- ${executor?.tag || "Not Found"} - \`${executor?.id}\`\n- ${Date.Timestamp()}`
            }
        ]
    }]

    if (message.content) {
        if (message.content?.length <= 1018)
            embeds[0].fields.push({
                name: '📝 Conteúdo',
                value: `\`\`\`${message.content?.slice(0, 1018)}\`\`\``
            })
        else embeds.push({
            color: client.blue,
            title: '📝 Conteúdo',
            description: `\`\`\`${message.content?.slice(0, 4090)?.limit('MessageEmbedDescription')}\`\`\``
        })
    }

    return channel?.send({ content: `🛰️ | **Global System Notification** | Message Delete`, embeds }).catch(() => { })
}