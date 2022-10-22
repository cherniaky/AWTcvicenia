/*
 * routes definition and handling for paramHashRouter
 */

import Mustache from "./mustache.js";
import processOpnFrmData from "./addOpinion.js";
import articleFormsHandler from "./articleFormsHandler.js";
import commentFormsHandler from "./commentFormsHandler.js";

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

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
    {
        hash: "article",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetail,
    },
    {
        hash: "artEdit",
        target: "router-view",
        getTemplate: editArticle,
    },
    {
        hash: "artDelete",
        target: "router-view",
        getTemplate: deleteArticle,
    },
    {
        hash: "artInsert",
        target: "router-view",
        getTemplate: addArticle,
    },
    {
        hash: "articleAddComment",
        target: "router-view",
        getTemplate: fetchAndDisplayArticleDetailWithComment,
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

function addArtDetailLink2ResponseJson(responseJSON) {
    // console.log(responseJSON.meta.offset + articlesPerPage);
    responseJSON.articles = responseJSON.articles.map((article) => ({
        ...article,
        // detailLink: `#article/${article.id}/${responseJSON.meta.offset}/${responseJSON.meta.totalCount}`,
        detailLink: `#article/${article.id}/${
            (Number(responseJSON.meta.offset) + articlesPerPage) /
            articlesPerPage
        }/${Math.ceil(responseJSON.meta.totalCount / articlesPerPage)}`,
    }));
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

    const url = `${urlBase}/article?max=${articlesPerPage}&offset=${
        articlesPerPage * (current - 1)
    }`;

    if (document.querySelector("#articles-container")) {
        document.querySelector("#articles-container").style.opacity = "50%";
    }

    function reqListener() {
        if (this.status == 200) {
            const data = JSON.parse(this.responseText);
            const maxPage = Math.ceil(data.meta.totalCount / articlesPerPage);

            if (!totalCount) {
                location.href = location.href + "/" + maxPage;
            }
            data.articles.map(async (article) => {
                await addContentToArticle(article);
            });

            addArtDetailLink2ResponseJson(data);

            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles").innerHTML,
                {
                    data,
                    ...data4rendering,
                }
            );
        } else {
            const errMsgObj = { errMessage: this.responseText };
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
        }
    }
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}

async function addContentToArticle(article) {
    const url = `${urlBase}/article/${article.id}`;

    function reqListener() {
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);

            article.content = responseJSON.content;
        }
    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, false);
    ajax.send();
}

function fetchAndDisplayArticleDetail(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    fetchAndProcessArticle(...arguments, false);
}

function editArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    fetchAndProcessArticle(...arguments, true);
}

function deleteArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    function reqListener() {
        // stiahnuty text
        console.log(this.responseText);
        if (this.status == 204) {
            alert("Deleting was successful");
        } else {
            alert("Deleting was failed");
        }
        window.location.hash = `#articles/${offsetFromHash}/${totalCountFromHash}`;
    }

    console.log(url);
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("DELETE", url, true);
    ajax.send();
}

function addArticle(targetElm, offsetFromHash, totalCountFromHash) {
    document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-article-form").innerHTML,
        { formTitle: "Article Add", submitBtTitle: "Save article" }
    );
    if (!window.artFrmHandler) {
        window.artFrmHandler = new articleFormsHandler(
            "https://wt.kpi.fei.tuke.sk/api"
        );
    }
    window.artFrmHandler.assignFormAndArticle(
        "articleForm",
        "hiddenElm",
        -1,
        "",
        ""
    );
}

function fetchAndDisplayArticleDetailWithComment(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash
) {
    fetchAndProcessArticle(...arguments, false, true);
}

/**
 * Gets an article record from a server and processes it to html according to
 * the value of the forEdit parameter. Assumes existence of the urlBase global variable
 * with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates )
 * with id="template-article" (if forEdit=false) and id="template-article-form" (if forEdit=true).
 * @param targetElm - id of the element to which the acquired article record
 *                    will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param forEdit - if false, the function renders the article to HTML using
 *                            the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
function fetchAndProcessArticle(
    targetElm,
    artIdFromHash,
    offsetFromHash,
    totalCountFromHash,
    forEdit,
    addComment
) {
    const url = `${urlBase}/article/${artIdFromHash}`;

    function reqListener() {
        // stiahnuty text
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);
            if (forEdit) {
                responseJSON.formTitle = "Article Edit";
                responseJSON.submitBtTitle = "Save article";
                responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}`;

                document.getElementById(targetElm).innerHTML = Mustache.render(
                    document.getElementById("template-article-form").innerHTML,
                    responseJSON
                );
                if (!window.artFrmHandler) {
                    window.artFrmHandler = new articleFormsHandler(
                        "https://wt.kpi.fei.tuke.sk/api"
                    );
                }
                window.artFrmHandler.assignFormAndArticle(
                    "articleForm",
                    "hiddenElm",
                    artIdFromHash,
                    offsetFromHash,
                    totalCountFromHash
                );
            } else {
                responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.editLink = `#artEdit/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.deleteLink = `#artDelete/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                responseJSON.addCommentLink = `#articleAddComment/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;

                addCommentsToArticle(responseJSON);

                if (addComment) {
                    responseJSON.addComment = true;
                    responseJSON.cancelLink = `#article/${responseJSON.id}/${offsetFromHash}/${totalCountFromHash}`;
                }
                document.getElementById(targetElm).innerHTML = Mustache.render(
                    document.getElementById("template-article").innerHTML,
                    responseJSON
                );

                if (addComment) {
                    if (!window.commentFrmHandler) {
                        window.commentFrmHandler = new commentFormsHandler(
                            "https://wt.kpi.fei.tuke.sk/api"
                        );
                    }
                    window.commentFrmHandler.assignFormAndComment(
                        "commentForm",
                        "hiddenElm",
                        artIdFromHash,
                        offsetFromHash,
                        totalCountFromHash
                    );
                }
            }
        } else {
            const errMsgObj = { errMessage: this.responseText };
            document.getElementById(targetElm).innerHTML = Mustache.render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
            );
        }
    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
}

async function addCommentsToArticle(article) {
    const url = `${urlBase}/article/${article.id}/comment`;

    function reqListener() {
        if (this.status == 200) {
            const responseJSON = JSON.parse(this.responseText);
            // console.log(responseJSON);
            article.comments = responseJSON.comments;
        }
    }

    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, false);
    ajax.send();
}
