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

function fetchAndDisplayArticles(targetElm, current, totalCount) {
    current = parseInt(current);
    totalCount = parseInt(totalCount);
    const data4rendering = {
        currPage: current,
        pageCount: totalCount,
    };

    if (current > 1) {
        data4rendering.prevPage = current - 1;
    }

    if (totalCount && current < totalCount) {
        data4rendering.nextPage = current + 1;
    }

    const url = `https://wt.kpi.fei.tuke.sk/api/article?max=20&offset=${
        20 * (current - 1)
    }`;
    
    if (document.querySelector("#articles-container")) {
        document.querySelector("#articles-container").style.opacity = "50%";
    }

    function reqListener() {
        if (this.status == 200) {
            const data = JSON.parse(this.responseText);
            const maxPage = Math.ceil(data.meta.totalCount / 20);

            if (!totalCount) {
                location.href = location.href + "/" + maxPage;
            }

            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles").innerHTML,
                {
                    data,
                    ...data4rendering,
                }
            );
        } else {
            alert("Došlo k chybe: " + this.statusText);
        }
    }
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}
