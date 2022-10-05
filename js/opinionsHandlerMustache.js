import OpinionsHandler from "./opinionsHandler.js";
import Mustache from "./mustache.js";

export default class OpinionsHandlerMustache extends OpinionsHandler {
    constructor(opinionsFormElmId, opinionsListElmId, templateElmId) {
        //call the constructor from the superclass:
        super(opinionsFormElmId, opinionsListElmId);

        //get the template:
        this.mustacheTemplate =
            document.getElementById(templateElmId).innerHTML;
    }

    opinion2html(opinion) {
        //in the case of Mustache, we must prepare data beforehand:
        opinion.createdDate = new Date(opinion.created).toDateString();
        if (opinion.willRecomend !== undefined) {
            opinion.willYouReccomendMessage = `Will you reccomend our website? ${opinion.willRecomend}`;
        }
        if (opinion.willTry !== undefined) {
            opinion.willTryRecipesMessage = opinion.willTry
                ? "I will try one of these recipes in future"
                : "I won't try one of these recipes in future";
        }
        if (opinion.bestRecip !== undefined) {
            opinion.bestRecipMessage = `I think the best recip is ${opinion.bestRecip}`;
        }

        //use the Mustache:
        const htmlWOp = Mustache.render(this.mustacheTemplate, opinion);

        //delete the createdDate item as we created it only for the template rendering:
        delete opinion.createdDate;

        //return the rendered HTML:
        return htmlWOp;
    }
}
