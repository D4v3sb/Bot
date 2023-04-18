import { ButtonInteraction, TwitchManager, SaphireClient as client } from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"

/**
 * @param { ButtonInteraction } interaction
 * @param { { c: 'twitch', src: 'clips', streamerId: streamerId } } commandData
 */
export default async (interaction, commandData) => {

    await interaction.reply({ content: `${e.Loading} | Buscando a live...`, ephemeral: true })

    const streamerVideos = await TwitchManager.fetcher(`https://api.twitch.tv/helix/videos?user_id=${commandData.streamerId}&first=25&type=archive`) || []

    if (streamerVideos == 'TIMEOUT')
        return interaction.editReply({
            content: `${e.SaphireDesespero} |Aaaaah, o sistema da Twitch está pegando FOOOOGO 🔥\n🧑‍🚒 | Fica tranquilo, que tudo está normal em menos de 1 minuto. ||Rate limit é uma coisinha chata||`
        }).catch(() => { })

    if (!streamerVideos.length)
        return interaction.editReply({ content: `${e.cry} | Eita... Eu não achei a live.` }).catch(() => { })

    // const selectMenuObject = {
    //     type: 1,
    //     components: [{
    //         type: 3,
    //         custom_id: 'menu',
    //         placeholder: `👁️‍🗨️ Últimas ${streamerVideos.length} lives de ${streamerVideos[0].user_name}`,
    //         options: []
    //     }]
    // }

    // selectMenuObject.components[0].options = streamerVideos
    //     .map(data => ({
    //         label: data.title,
    //         emoji: '🎬',
    //         description: `Duração de ${data.duration}`,
    //         value: data.url,
    //     }))

    // return interaction.editReply({
    //     content: null,
    //     embeds: [],
    //     components: [selectMenuObject]
    // })

    return interaction.editReply({
        content: null,
        embeds: [{
            color: 0x9c44fb, /* Twitch's Logo Purple */
            title: `👁️‍🗨️ Últimas ${streamerVideos.length} lives de ${streamerVideos[0].user_name}`,
            description: `${streamerVideos
                // .map(data => `\`${data.duration}\` [${data.title}](${data.url}) ${hyperlink(data.title, data.url)}`)
                .map(data => `\`${data.duration}\` [${data.title.replace(/#|\[|\]|\p{S}|\d+/gu, "").trim()}](${data.url})`)
                .join('\n') || 'Nenhuma live carregada?'}`
                .limit('MessageEmbedDescription'),
            image: { url: streamerVideos[0]?.thumbnail_url || null },
            footer: {
                text: `${client.user.username}'s Twitch Notification System`,
                icon_url: 'https://freelogopng.com/images/all_img/1656152623twitch-logo-round.png',
            }
        }]
    }).catch(() => { })
}