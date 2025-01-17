import { Database, Discloud, SaphireClient as client, TwitchManager, AfkManager, TempCallManager, ChestManager, SpamManager } from '../index.js'
import { Config } from '../../util/Constants.js'
import slashCommand from '../../structures/handler/commands.handler.js'
import automaticSystems from '../../functions/update/index.js'
import GiveawayManager from '../../functions/update/giveaway/manager.giveaway.js'
import PollManager from '../../functions/update/polls/poll.manager.js'
import managerReminder from '../../functions/update/reminder/manager.reminder.js'
import QuizManager from '../games/QuizManager.js'
import webhook from './webhooks.saphire.js'

export default async () => {
    console.log('Iniciating...')
    process.env.TZ = "America/Sao_Paulo"
    import('../../structures/handler/events.handler.js')
    import('../../functions/global/prototypes.js')

    await client.login()
    await Discloud.login()
    await Database.MongoConnect()
    slashCommand(client)
    Database.Cache.clearTables(`${client.shardId}`)
    await Database.loadGuilds()

    const guildsData = Database.guildData.toJSON()

    GiveawayManager.setGiveaways(guildsData)
    ChestManager.load(guildsData)
    PollManager.load(guildsData)
    TempCallManager.load(guildsData)
    SpamManager.load(guildsData)
    AfkManager.load()

    automaticSystems()

    client.setCantadas()
    client.setMemes()
    client.refreshStaff()
    managerReminder.load()
    QuizManager.load()
    client.fanarts = await Database.Fanart.find() || []
    client.animes = await Database.Anime.find() || []
    import('./webhooks.saphire.js').then(file => file.default()).catch(() => { })
    Config.webhookAnimeReporter = await webhook(Config.quizAnimeAttachmentChannel)
    Config.webhookQuizReporter = await webhook(Config.questionSuggestionsSave)

    console.log(`Shard ${client.shardId} is ready and was started.`)

    client.secretId = client.user.id == client.canaryId
        ? process.env.CANARY_SECRET
        : process.env.CLIENT_SECRET

    if (client.shardId == 0) {
        import('../../api/app.js')
        TwitchManager.checkAccessTokenAndStartLoading()
        client.linkedRolesLoad()
        client.executeMessages()
    }

    client.user.setPresence({
        activities: [
            { name: `${client.slashCommands.size} comandos incríveis\n[Shard ${client.shardId}/${client.shard.count} in Cluster ${client.clusterName}]` }
        ],
        status: 'idle',
        shardId: client.shardId
    })

    console.log('Iniciated')
    return client.calculateReload()
}