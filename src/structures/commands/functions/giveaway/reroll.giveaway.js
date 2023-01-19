import { ButtonStyle } from "discord.js"
import { SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

export default async (interaction, guildData, giveawayId) => {

    const { options } = interaction
    const messageId = giveawayId || options.getString('id')

    if (messageId === 'info')
        return await interaction.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Info} | Informações Gerais Do Sistema de Reroll`,
                fields: [
                    {
                        name: '💬 Em qual canal?',
                        value: 'O meu sistema foi projetado para efetuar rerolls em qualquer canal do Servidor.'
                    },
                    {
                        name: '✍ Escolha o sorteio',
                        value: 'Se o servidor tiver sorteios disponíveis para reroll, aparecerá automaticamente em uma lista automática na tag `id`.'
                    },
                    {
                        name: '👥 Vencedores',
                        value: 'Você pode escolher de 1 a 20 vencedores para um reroll.\nSe o número de vencedores não for informado, a quantidade de usuários sorteados será a mesma do sorteio original.'
                    },
                    {
                        name: '🔢 Quantos rerolls posso fazer?',
                        value: 'Meu sistema fornece rerolls infinitos para todos os servidores gratuitamentes.'
                    },
                    {
                        name: '🔑 Quais sorteios estão disponíveis para Reroll?',
                        value: '1. Sorteios já sorteados.\n2. Sorteios com mais de 1 participante'
                    }
                ]
            }]
        })

    const giveaway = guildData?.Giveaways?.find(gw => gw.MessageID === messageId)
    const winnersAmount = giveawayId ? giveaway?.Winners : options.getInteger('winners') || giveaway?.Winners

    if (!giveaway)
        return await interaction.reply({
            content: `${e.Deny} | Sorteio não encontrado no banco de dados`,
            ephemeral: true
        })

    if (giveaway.Actived)
        return await interaction.reply({
            content: `${e.Deny} | Este sorteio ainda não foi finalizado.`,
            ephemeral: true
        })

    const winnersRandomized = giveaway?.Participants?.random(winnersAmount) || []

    if (!winnersRandomized || !winnersRandomized.length)
        return await interaction.reply({
            content: `${e.Deny} | Não foi possível obter nenhum vencedor.`,
            ephemeral: true
        })

    const Sponsor = await client.users.fetch(giveaway.Sponsor).catch(() => 'Not Found')

    const components = giveaway.MessageLink
        ? [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'Sorteio Original',
                    emoji: '🔗',
                    url: giveaway.MessageLink,
                    style: ButtonStyle.Link
                },
                {
                    type: 2,
                    label: `${giveaway.Participants?.length || 0} ${giveaway.Participants?.length > 1 ? 'Participantes' : 'Participante'}`,
                    emoji: '👥',
                    customId: 'participants',
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }]
        : [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: `${giveaway.Participants?.length || 0} ${giveaway.Participants?.length > 1 ? 'Participantes' : 'Participante'}`,
                    emoji: '👥',
                    customId: 'participants',
                    style: ButtonStyle.Primary,
                    disabled: true
                }
            ]
        }]

    return await interaction.reply({
        content: `${e.Notification} | ${winnersRandomized.map(id => `<@${id}>`).join(', ')}`.limit('MessageContent'),
        embeds: [
            {
                color: client.green,
                title: `${e.Tada} Sorteio Finalizado [REROLL]`,
                url: giveaway?.MessageLink || null,
                fields: [
                    {
                        name: `${e.CoroaDourada} Vencedores`,
                        value: `${winnersRandomized.map(id => `<@${id}> - \`${id}\``).join('\n') || 'Ninguém'}`.limit('MessageEmbedFieldValue'),
                        inline: true
                    },
                    {
                        name: `${e.ModShield} Patrocinador`,
                        value: `${Sponsor} - \`${giveaway.Sponsor || 0}\``,
                        inline: true
                    },
                    {
                        name: `${e.Star} Prêmio`,
                        value: `${giveaway.Prize}`,
                        inline: true
                    }
                ],
                footer: { text: `Giveaway ID: ${giveaway.MessageID}` }
            }
        ],
        components
    })

}