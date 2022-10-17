/*
 * Created by Stefan Korecko, 2021
 * Functions to handle forms for article editing and inserting
 */


/**
 Handles the form from the template:

 <form id="articleForm">
 <label for="author">Author:</label>
 <input type="text" name="author" id="author" value="{{author}}" size="50" title="Article author, max. length 100 characters." maxlength="100" placeholder="napr. Ján Trieska" />
 <br>
 <label for="title">Title:</label>
 <input type="text" name="title" id="title" value="{{title}}" size="50"  maxlength="100" pattern="\S[\S\s]*" required title="Article title, mandatory item, max. length: 100 characters, the first character must not be a space." placeholder="napr. Môj prvý príbeh / e.g. My story." />
 <br>
 <label for="imageLink">Image (url):</label>
 <input type="url" name="imageLink" id="imageLink" value="{{imageLink}}" size="50" title="Image URL, max. length 100 characters." maxlength="100"/>
 <br>
 <label></label><button type="button" id="btShowFileUpload">Upload image</button>

 <fieldset class="added hiddenElm" id="fsetFileUpload">
 <legend>Image Upload</legend>
 <input type="file" id="flElm" name="file" accept="image/jpeg, image/png"/>
 <br />
 <button type="button" id="btFileUpload">Send image to server</button>
 <button type="button" id="btCancelFileUpload">Cancel uploading</button>
 </fieldset>


 <br>
 <label for="content">Article content:</label>
 <textarea
 name="content" id="content" spellcheck="true" lang="sk"
 cols="50" rows="20" required
 title="Article content, mandatory item, can be plain text or in HTML.">{{content}}</textarea>
 <br>
 <label for="tags">Keywords:</label>
 <input  type="text" name="tags" id="tags" value="{{tags}}" size="50"
 title="Keyword list, comma separated." placeholder="e.g. village, drama" />

 <br>
 <br>
 <button type="reset">
 Reset Form
 </button>
 <button type="submit">
 {{submitBtTitle}}
 </button>

 </form>

 which is processed by the function fetchAndProcessArticle() in routes.js
 */
export default class articleFormsHandler {

    /**
     * @param articlesServerUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api
     */
    constructor(articlesServerUrl) {
        this.serverUrl=articlesServerUrl;
    }

    /**
     * assigns a matching form and article parameters to the handler
     * @param formElementId - id of the html element with the form, i.e.  "articleForm".
     * @param cssClass2hideElement - name of the css class setting display to none, i.e. "hiddenElm".
     * @param articleId - id of the article to be updated.  Value <0 means that the form is for adding a new article (this functionality is not implemented)
     * @param offset - current offset of the article list display to which the user should return
     * @param totalCount - total number of the articles on the server
     */
    assignFormAndArticle(formElementId, cssClass2hideElement,articleId,offset,totalCount){
        this.cssCl2hideElm  = cssClass2hideElement;
        const artForm=document.getElementById(formElementId);
        this.formElements=artForm.elements;

        this.formElements.namedItem('btShowFileUpload').onclick= ()=>this.showFileUpload();
        this.formElements.namedItem('btFileUpload').onclick= ()=>this.uploadImg();
        this.formElements.namedItem('btCancelFileUpload').onclick= ()=>this.cancelFileUpload();


        if(articleId>=0){ //article edit (update)
            artForm.onsubmit= (event)=>this.processArtEditFrmData(event);
            this.articleId = articleId;
            this.offset = offset;
            this.totalCount = totalCount;
        }else{
            //functionality for adding a new article can go here
        }

    }

    /**
     *Pridanie funkcionality pre kliknutie na tlacidlo "Nahraj obrázok / Upload image"
     * Adding functionality for the button "Nahraj obrázok / Upload image"
     */
    showFileUpload(event) {
        this.formElements.namedItem('fsetFileUpload').classList.remove( this.cssCl2hideElm);
        this.formElements.namedItem('btShowFileUpload').classList.add( this.cssCl2hideElm);
    }

    /**
     *Pridanie funkcionality pre kliknutie na tlacidlo "Zruš nahrávanie / Cancel uploading"
     *Adding functionality for the button "Zruš nahrávanie / Cancel uploading"
     */
    cancelFileUpload() {
        this.formElements.namedItem('fsetFileUpload').classList.add( this.cssCl2hideElm);
        this.formElements.namedItem('btShowFileUpload').classList.remove( this.cssCl2hideElm);
    }

    /**
     * uploads a new image to the server , closes the corresponding part of the form and adds the url of the image to the form.
     */
    uploadImg() {

        const files = this.formElements.namedItem("flElm").files;

        if (files.length > 0) {
            const imgLinkElement = this.formElements.namedItem("imageLink");
            const fieldsetElement = this.formElements.namedItem("fsetFileUpload");
            const btShowFileUploadElement = this.formElements.namedItem("btShowFileUpload");

            //1. Gather  the image file data

            let imgData = new FormData();     //obrazok su binarne udaje, preto FormData (pouzitelne aj pri upload-e viac suborov naraz)
                                              //and image is binary data, that's why we use FormData (it works for multiple file upload, too)
            imgData.append("file", files[0]); //beriem len prvy obrazok, ved prvok formulara by mal povolit len jeden
                                              //takes only the first file (image)

            //2. Set up the request


            const postReqSettings = //an object wih settings of the request
                {
                    method: 'POST',
                    body: imgData //FormData object, not JSON this time.
                    //pozor:nezadavat content-type. potom to nepojde.
                    //Beware: It doesn't work correctly if the content-type is set.
                };


            //3. Execute the request

            fetch(`${this.serverUrl}/fileUpload`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
                .then(response => {      //fetch promise fullfilled (operation completed successfully)
                    if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                        return response.json(); //we return a new promise with the response data in JSON to be processed
                    } else { //if we get server error
                        return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
                    }
                })
                .then(responseJSON => { //here we process the returned response data in JSON ...
                    imgLinkElement.value = responseJSON.fullFileUrl;
                    btShowFileUploadElement.classList.remove( this.cssCl2hideElm);
                    fieldsetElement.classList.add( this.cssCl2hideElm);
                })
                .catch(error => { ////here we process all the failed promises
                    window.alert(`Image uploading failed. ${error}.`);
                });
        } else {
            window.alert("Please, choose an image file.");
        }


    }

    /**
     * Process form data and sends the article to server
     * @param event - event object, to prevent default processing
     */
    processArtEditFrmData(event) {
        event.preventDefault();

        //1. Gather and check the form data
        const articleData = {
            title: this.formElements.namedItem("title").value.trim(),
            content: this.formElements.namedItem("content").value.trim(),
            author: this.formElements.namedItem("author").value.trim(),

            imageLink: this.formElements.namedItem("imageLink").value.trim(),
            tags: this.formElements.namedItem("tags").value.trim()
        };

        if (!(articleData.title && articleData.content)) {
            window.alert("Please, enter article title and content");
            return;
        }

        if (!articleData.author) {
            articleData.author = "Anonymous";
        }

        if (!articleData.imageLink) {
            delete articleData.imageLink;
        }

        if (!articleData.tags) {
            delete articleData.tags;
        } else {
            articleData.tags = articleData.tags.split(","); //zmeni retazec s tagmi na pole. Oddelovac poloziek je ciarka.
            //changes the string with tags to array. Comma is the separator
            articleData.tags = articleData.tags.map(tag => tag.trim()); //odstráni prázdne znaky na začiatku a konci každého kľúčového slova
            //deletes white spaces from the beginning and the end of each tag string

            //newArtData.tags=newArtData.tags.map(function(tag) {return tag.trim()}); //alternativny sposob zapisu predch. prikazu
            //an alternative way of writing the previous command

            articleData.tags = articleData.tags.filter(tag => tag); //odstráni tie tagy, ktoré sú teraz len prázdne reťazce
            //removes those tags that are now just empty strings
            if (articleData.tags.length == 0) {
                delete articleData.tags;
            }
        }

        //2. Set up the request


        const postReqSettings = //an object wih settings of the request
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8',
                },
                body: JSON.stringify(articleData)
            };


        //3. Execute the request


        fetch(`${this.serverUrl}/article/${this.articleId}`, postReqSettings)  //now we need the second parameter, an object wih settings of the request.
            .then(response => {      //fetch promise fullfilled (operation completed successfully)
                if (response.ok) {    //successful execution includes an error response from the server. So we have to check the return status of the response here.
                    return response.json(); //we return a new promise with the response data in JSON to be processed
                } else { //if we get server error
                    return Promise.reject(new Error(`Server answered with ${response.status}: ${response.statusText}.`)); //we return a rejected promise to be catched later
                }
            })
            .then(responseJSON => { //here we process the returned response data in JSON ...
                window.alert("Updated article successfully saved on server");
            })
            .catch(error => { ////here we process all the failed promises
                window.alert(`Failed to save the updated article on server. ${error}`);

            })
            .finally(() => window.location.hash = `#article/${ this.articleId}/${ this.offset}/${ this.totalCount}`);

    }
}

