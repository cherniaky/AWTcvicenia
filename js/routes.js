/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";

//an array, defining the routes
export default [
    {
        //the part after '#' in the url (so-called fragment):
        hash: "welcome",
        ///id of the target html element:
        target: "router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) =>
            (document.getElementById(targetElm).innerHTML =
                document.getElementById("template-welcome").innerHTML),
    },
    {
        hash: "articles",
        target: "router-view",
        getTemplate: fetchAndDisplayArticles,
    },
    {
        hash: "opinions",
        target: "router-view",
        getTemplate: createHtml4opinions,
    },
    {
        hash: "addOpinion",
        target: "router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML =
                document.getElementById("template-addOpinion").innerHTML;
            document.getElementById("opnFrm").onsubmit = processOpnFrmData;
        },
    },
];

function createHtml4opinions(targetElm) {
    const opinionsFromStorage = localStorage.opinions;
    let opinions = [];

    if (opinionsFromStorage) {
        opinions = JSON.parse(opinionsFromStorage);
        opinions.forEach((opinion) => {
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
        });
    }

    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-opinions").innerHTML,
        opinions
    );
}

function fetchAndDisplayArticles(targetElm) {
    const url = "https://wt.kpi.fei.tuke.sk/api/article";

    function reqListener() {
        // stiahnuty text
        console.log(this.responseText);
        if (this.status == 200) {
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles").innerHTML,
                JSON.parse(this.responseText)
            );
        } else {
            alert("Došlo k chybe: " + this.statusText);
        }
    }
    console.log(url);
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
    console.log("send");
}
