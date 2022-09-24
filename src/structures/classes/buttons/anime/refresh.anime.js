import {
    SaphireClient as client,
    Database
} from "../../../../classes/index.js"
import { Emojis as e } from "../../../../util/util.js"
import { ButtonStyle } from "discord.js"

export default async interaction => {

    const { message, user } = interaction
    const authorId = message.interaction.user.id
    if (user.id !== authorId) return

    const allAnimes = await Database.animeIndications() || []
    const anime = allAnimes.random()
    const animeIndex = allAnimes.findIndex(an => an.name === anime.name)

    return await interaction.update({
        embeds: [{
            color: client.blue,
            title: `💭 ${client.user.username}'s Indica Anime`,
            description: 'Todos os animes presentes neste comando foram sugeridos pelos próprios usuários e aprovados pela Administração da Saphire.',
            fields: [
                {
                    name: `📺 Anime - ${animeIndex + 1}/${allAnimes.length}`,
                    value: anime.name
                },
                {
                    name: '🧩 Gêneros',
                    value: anime.gender?.map(gen => `\`${gen}\``)?.join(', ') || '\`Not Found\`'
                },
                {
                    name: '🎞 Categorias',
                    value: anime.category?.map(cat => `\`${cat}\``)?.join(', ') || '\`Not Found\`'
                },
                {
                    name: '👥 Público Alvo',
                    value: anime.targetPublic?.map(pub => `\`${pub}\``)?.join(', ') || '\`Not Found\`'
                },
                {
                    name: '👤 Sugerido por',
                    value: `${client.users.resolve(anime.authorId)?.tag || 'Not Found'} - \`${anime.authorId}\``
                }
            ]
        }],
        components: [
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Atualizar',
                        emoji: '🔄',
                        custom_id: JSON.stringify({ c: 'anime', src: 'refresh' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Indicar',
                        emoji: e.saphireLendo,
                        custom_id: JSON.stringify({ c: 'anime', src: 'indicate' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: 'Informações',
                        emoji: '🔎',
                        custom_id: JSON.stringify({ c: 'anime', src: 'info' }),
                        style: ButtonStyle.Primary
                    },
                    {
                        type: 2,
                        label: anime.up?.length || 0,
                        emoji: e.Upvote,
                        custom_id: JSON.stringify({ c: 'anime', src: 'up' }),
                        style: ButtonStyle.Success
                    },
                    {
                        type: 2,
                        label: anime.down?.length || 0,
                        emoji: e.DownVote,
                        custom_id: JSON.stringify({ c: 'anime', src: 'down' }),
                        style: ButtonStyle.Danger
                    }
                ]
            }
        ]
    }).catch(() => { })

}