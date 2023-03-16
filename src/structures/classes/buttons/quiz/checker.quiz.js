import QuizManager from '../../../../classes/games/QuizManager.js';
import options from './options.quiz.js';
import play from './play.quiz.js';
import newQuizCategory from './newQuizCategory.quiz.js';
import reviewCategory from './reviewCategory.quiz.js';
import acceptCategory from './acceptCategory.quiz.js';
import denyCategory from './denyCategory.quiz.js';
import newQuestion from './newQuestion.quiz.js';
import newQuizQuestion from './newQuizQuestion.quiz.js';
import reviewQuestion from './reviewQuestion.quiz.js';
import acceptQuestion from './acceptQuestion.quiz.js';
import newQuizRefuse from './newQuizRefuse.quiz.js';
import editQuestion from './editQuestion.quiz.js';
import newQuizEdition from './newQuizEdition.quiz.js';
import questionInfo from './questionInfo.quiz.js';
import newQuizEditionAdmin from './newQuizEditionAdmin.quiz.js';
import deleteQuestionRequest from './deleteQuestionRequest.quiz.js';
import deleteQuestion from './deleteQuestion.quiz.js';
import newQuizReport from './newQuizReport.quiz.js';
import reviewReports from './reviewReports.quiz.js';
import feedbackReport from './feedbackReport.quiz.js';
import editPainel from './editPainel.quiz.js';
import editCategory from './editCategory.quiz.js';
import newEditCategory from './newEditCategory.quiz.js';
import newQuizCuriosity from './newQuizCuriosity.quiz.js';
import saveQuestion from './saveQuestion.quiz.js';
import custom from './custom.quiz.js'
import config from './config.quiz.js'
import deleteConfig from './deleteConfig.quiz.js'
import viewCategories from './viewCategories.quiz.js'
import viewCategoryConfig from './viewCategoryConfig.quiz.js'
import deleteCategory from './deleteCategory.quiz.js'
import delCatAndQuestions from './delCatAndQuestions.quiz.js'
import changeCategoryName from './changeCategoryName.quiz.js'
import newQuizCatEdit from './newQuizCatEdit.quiz.js'
import { Buttons, Emojis as e } from '../../../../util/util.js';
import { SaphireClient as client } from '../../../../classes/index.js';

// Button/Modal/SelectMenu Interaction
export default async (interaction, { src }) => {

    if (!src)
        return await interaction.reply({ content: `${e.Deny} | \`src\` indefinido. #156484165`, ephemeral: true })

    const execute = {
        options, play, back, editPainel, changeCategoryName,
        newQuizCategory, reviewCategory, delCatAndQuestions,
        acceptCategory, denyCategory, deleteCategory,
        newQuestion, newQuizQuestion, viewCategories,
        reviewQuestion, acceptQuestion, saveQuestion,
        newQuizRefuse, editQuestion, newQuizCuriosity,
        newQuizEdition, questionInfo, editCategory,
        newQuizEditionAdmin, deleteQuestionRequest,
        deleteQuestion, report: QuizManager.newReport,
        newCategory: QuizManager.newCategory,
        refuseModel: QuizManager.defineRefuseReason,
        newQuizReport, reviewReports,
        modalFeedback: QuizManager.showModalFeedback,
        addCuriosity: QuizManager.addCuriosity,
        custom, config, deleteConfig, newQuizCatEdit
    }[src]

    if (execute)
        return await execute(interaction)

    if (src.includes('editCategory'))
        return newEditCategory(interaction)

    if (interaction.customId == 'quizOptionsData')
        return viewCategoryConfig(interaction)

    if (QuizManager.categories.includes(src))
        return QuizManager.newQuestion(interaction, src)

    if (interaction.customId.includes('newQuizfeedback'))
        return feedbackReport(interaction)

    return await interaction.update({
        content: `${e.DenyX} | Nenhuma função foi encontrada para esta interação. #13256987`,
        embeds: [], components: []
    }).catch(() => { })

    async function back() {

        let userId = interaction.customId.startsWith('{')
            ? getUserIdFromCustomId() : interaction.message?.interaction?.user?.id

        if (userId && interaction.user.id !== userId)
            return await interaction.reply({
                content: `${e.DenyX} | Epa epa, só ${userId ? `<@${interaction.message?.interaction?.user?.id}>` : 'quem usou esse comando'} pode usar essa função, beleza?`,
                ephemeral: true
            })

        return await interaction.update({
            content: null,
            embeds: [
                {
                    color: client.blue,
                    title: `${e.QuizLogo} ${client.user.username}'s Quiz`,
                    description: `Estamos construindo esse Quiz com todo o amor, ok?\nVocê pode mandar perguntar clicando no botão \`Mais Opções\`.\n \nAgradecemos a sua ajuda.\n${e.Admin} Saphire's Team Developers & Resourcers Management`,
                    footer: {
                        text: `❤️ Powered By: ${client.user.username}'s Community`
                    }
                }
            ],
            components: Buttons.QuizQuestionsFirstPage
        }).catch(() => { })

        function getUserIdFromCustomId() {
            const customData = JSON.parse(interaction.customId || {})
            if (customData?.userId) return customData.userId
        }
    }

}