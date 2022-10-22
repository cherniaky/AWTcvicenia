export default class commentFormsHandler {
    /**
     * @param commentServerUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api
     */
    constructor(commentServerUrl) {
        this.serverUrl = commentServerUrl;
    }

    /**
     * assigns a matching form and article parameters to the handler
     * @param formElementId - id of the html element with the form, i.e.  "articleForm".
     * @param cssClass2hideElement - name of the css class setting display to none, i.e. "hiddenElm".
     * @param articleId - id of the article to be updated.  Value <0 means that the form is for adding a new article (this functionality is not implemented)
     * @param offset - current offset of the article list display to which the user should return
     * @param totalCount - total number of the articles on the server
     */
    assignFormAndComment(
        formElementId,
        cssClass2hideElement,
        articleId,
        offset,
        totalCount
    ) {
        this.cssCl2hideElm = cssClass2hideElement;
        const artForm = document.getElementById(formElementId);
        this.formElements = artForm.elements;
        this.articleId = articleId;
        this.offset = offset;
        this.totalCount = totalCount;
        artForm.onsubmit = (event) => this.processArtAddFrmData(event);
    }

    processArtAddFrmData(event) {
        event.preventDefault();

        //1. Gather and check the form data
        const articleData = {
            author: this.formElements.namedItem("author").value.trim(),
            text: this.formElements.namedItem("comment").value.trim(),
        };
        //2. Set up the request

        const postReqSettings =
            //an object wih settings of the request
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8",
                },
                body: JSON.stringify(articleData),
            };

        //3. Execute the request

        fetch(
            `${this.serverUrl}/article/${this.articleId}/comment`,
            postReqSettings
        ) //now we need the second parameter, an object wih settings of the request.
            .then((response) => {
                //fetch promise fullfilled (operation completed successfully)
                if (response.ok) {
                    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                    return response.json(); //we return a new promise with the response data in JSON to be processed
                } else {
                    //if we get server error
                    return Promise.reject(
                        new Error(
                            `Server answered with ${response.status}: ${response.statusText}.`
                        )
                    ); //we return a rejected promise to be catched later
                }
            })
            .then((responseJSON) => {
                //here we process the returned response data in JSON ...
                window.alert("Added comment successfully saved on server");
                // window.location.hash = `#article/${responseJSON.id}`;
            })
            .catch((error) => {
                ////here we process all the failed promises
                window.alert(
                    `Failed to save the new comment on server. ${error}`
                );
                // window.location.hash = `#articles/1`;
            })
            .finally(
                () =>
                    (window.location.hash = `#article/${this.articleId}/${this.offset}/${this.totalCount}/1`)
            );
    }
}
