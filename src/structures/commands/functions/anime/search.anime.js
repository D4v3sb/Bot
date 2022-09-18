import axios from 'axios'
import { Emojis as e } from '../../../../util/util.js'
import translate from '@iamtraction/google-translate'
import { SaphireClient as client } from '../../../../classes/index.js'

export default async interaction => {

    await interaction.reply({ content: `${e.Loading} | Buscando anime...` })

    const { options } = interaction
    const search = options.getString('input')
    const lookingFor = options.getString('in')

    if (!['anime', 'manga'].includes(lookingFor))
        return await interaction.reply({
            content: `${e.Deny} | Parâmetro de busca incorreto.`,
            ephemeral: true
        })

    return axios({
        baseURL: `https://kitsu.io/api/edge/${lookingFor}?filter[text]=${search}`,
        headers: {
            Accept: 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json'
        }
    })
        .then(async result => {

            if (!result.data.data || !result.data.data.length)
                return await interaction.editReply({
                    content: `${e.Deny} | Nenhum resultado obtido para a sua busca.`
                }).catch(() => { })

            const { attributes: anime } = result.data.data[0]

            translate(`${anime.synopsis.replace(/<[^>]*>/g, '').split('\n')[0]}`, { to: 'pt' })
                .then(async res => {

                    const Subtype = {
                        // Anime
                        ONA: 'Animação Original da Net (ONA)',
                        OVA: 'Video de Animação Original (OVA)',
                        TV: 'Televisão',
                        movie: 'Filme',
                        music: 'Música',
                        special: 'Especial',
                        // Manga
                        doujin: 'Doujin',
                        manga: 'Manga',
                        manhua: 'Manhua',
                        manhwa: 'Manhwa',
                        novel: 'Novel',
                        oel: 'Oel',
                        oneshot: 'Oneshot',
                    }[anime.showType || anime.mangaType] || '\`Not Found\`'

                    const Sinopse = res.text?.limit('MessageEmbedDescription') || '\`Synopsis Not Found\`'

                    const Status = {
                        current: 'Atual',
                        finished: 'Finalizado',
                        tba: 'Em Breve',
                        unreleased: "Inédito",
                        upcoming: 'Em Lançamento'
                    }[anime.status] || 'Sem status definido'

                    const Name = {
                        en: anime.titles.en,
                        en_jp: anime.titles.en_jp,
                        original: anime.titles.ja_jp,
                        canonical: anime.canonicalTitle,
                        abreviated: anime.abbreviatedTitles
                    }

                    const IdadeRating = {
                        G: 'Livre',
                        PG: '+10 - Orientação dos Pais Sugerida',
                        R: '+16 Anos',
                        R18: '+18 Anos'
                    }[anime.ageRating] || 'Sem faixa etária'

                    const NSFW = anime.nsfw ? 'Sim' : 'Não'
                    const Nota = anime.averageRating || '??'
                    const AnimeRanking = anime.ratingRank || '0'
                    const AnimePop = anime.popularityRank || '0'
                    const Epsodios = anime.episodeCount || 'N/A'
                    const Volumes = anime.volumeCount || null

                    const Create = anime.createdAt
                        ? Date.Timestamp(new Date(anime.createdAt), 'f', true)
                        : 'Não criado ainda'

                    const LastUpdate = anime.updatedAt
                        ? Date.Timestamp(new Date(anime.updatedAt), 'f', true)
                        : 'Sem atualização'

                    const Lancamento = anime.startDate ? `${new Date(anime.startDate).toLocaleDateString("pt-br")}` : 'Em lançamento'
                    const Termino = anime.endDate
                        ? new Date(anime.endDate).toLocaleDateString("pt-br")
                        : anime.startDate ? 'Ainda no ar' : 'Não lançado'

                    return await interaction.editReply({
                        content: null,
                        embeds: [
                            {
                                color: client.green,
                                title: `🔍 Pesquisa Requisitada: ${search}`,
                                description: `**📑 Sinopse**\n${Sinopse}`,
                                fields: [
                                    {
                                        name: '🗂️ Informações',
                                        value: `Nome Japonês: ${Name.original}\nNome Inglês: ${Name.en}\nNome Mundial: ${Name.en_jp}\nNome Canônico: ${Name.canonical}\nNome abreviado: ${Name.abreviated.join(', ')}\nFaixa Etária: ${IdadeRating}\nNSFW: ${NSFW}\nTipo: ${Subtype}${anime.episodeLength ? `\nTempo médio por epsódio: ${anime.episodeLength} minutos` : ''}`
                                    },
                                    {
                                        name: `📊 Status - ${Status}`,
                                        value: `Nota Média: ${Nota}\nRank Kitsu: ${AnimeRanking}\nPopularidade: ${AnimePop}${Volumes ? `\nVolumes: ${Volumes}` : `\nEpisódios: ${Epsodios}`}\nCriação: ${Create}\nÚltima atualização: ${LastUpdate}\nLançamento: ${Lancamento}\nTérmino: ${Termino}`
                                    }
                                ],
                                image: { url: anime.posterImage?.original ? anime.posterImage.original : null }
                            }
                        ]
                    }).catch(async err => {
                        return await interaction.editReply('Ocorreu um erro no comando "anime"\n`' + err + '`')
                    })

                }).catch(async err => {
                    return await interaction.editReply(`${e.Warn} | Houve um erro ao executar este comando.\n\`${err}\``)
                })

        }).catch(console.log)

}