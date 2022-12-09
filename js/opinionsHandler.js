export default class OpinionsHandler {
    /**
     * constructor
     * @param opinionsFormElmId - id of a form element where a new visitor opinion is entered
     * @param opinionsListElmId - id of a html element to which the list of visitor opinions is rendered
     */
    constructor(opinionsFormElmId, opinionsListElmId) {
        //("opnFrm","opinionsContainer")
        this.opinions = [];

        this.opinionsElm = document.getElementById(opinionsListElmId);
        this.opinionsFrmElm = document.getElementById(opinionsFormElmId);
    }

    /**
     * initialisation of the list of visitor opinions and form submit setup
     */
    init() {
        if (localStorage.opinions) {
            this.opinions = JSON.parse(localStorage.opinions);
        }

        this.opinionsElm.innerHTML = this.opinionArray2html(this.opinions);

        this.opinionsFrmElm.addEventListener("submit", (event) =>
            this.processOpnFrmData(event)
        );
    }

    /**
     * Processing of the form data with a new visitor opinion
     * @param event - event object, used to prevent normal event (form sending) processing
     */
    processOpnFrmData(event) {
        //1.prevent normal event (form sending) processing
        event.preventDefault();

        //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
        const nameInp = document.getElementById("nameInp").value.trim();
        const emailInp = document.getElementById("emailInp").value.trim();
        const imgInp = document.getElementById("imgInp").value.trim();
        let reccomendInp;
        if (document.getElementById("yes").checked) {
            reccomendInp = document.getElementById("yes").value;
        } else if (document.getElementById("no").checked) {
            reccomendInp = document.getElementById("no").value;
        }
        const willTryInp = document.getElementById("willTryInp").checked;
        const commentInp = document.getElementById("commentInp").value.trim();
        const bestRecipInp = document
            .getElementById("bestRecipInp")
            .value.trim();

        //3. Verify the data
        if (nameInp == "" || emailInp == "" || commentInp == "") {
            window.alert("Please, enter your name, email and comment");
            return;
        }

        //3. Add the data to the array opinions and local storage
        const newOpinion = {
            name: nameInp,
            email: emailInp,
            comment: commentInp,
            ...(imgInp && { imgUrl: imgInp }),
            ...(reccomendInp && { willRecomend: reccomendInp }),
            ...(willTryInp !== undefined && { willTry: willTryInp }),
            ...(bestRecipInp && { bestRecip: bestRecipInp }),
            created: new Date(),
        };

        const bestRecipes = JSON.parse(localStorage.getItem("bestRecipes"));

        if (bestRecipInp && !bestRecipes.include(bestRecipInp)) {
            bestRecipes.push(bestRecipInp);
            localStorage.setItem("bestRecipes", JSON.stringify(bestRecipes));
        }
        console.log("New opinion:\n " + JSON.stringify(newOpinion));

        this.opinions.push(newOpinion);

        localStorage.opinions = JSON.stringify(this.opinions);

        //4. Update HTML
        this.opinionsElm.innerHTML += this.opinion2html(newOpinion);

        //5. Reset the form
        this.opinionsFrmElm.reset(); //resets the form
    }

    /**
     * creates html code for one opinion using a template literal
     * @param opinion - object with the opinion
     * @returns {string} - html code with the opinion
     */
    opinion2html(opinion) {
        //TODO finish opinion2html
        const opinionTemplate = `
			<section>
			   <h3>${opinion.name} <i>(${new Date(opinion.created).toDateString()})</i></h3>

			   <p>${opinion.comment}</p>
			   <p>${
                   opinion.willReturn
                       ? "I will return to this page."
                       : "Sorry, one visit was enough."
               }</p>
			</section>`;
        return opinionTemplate;
    }

    /**
     * creates html code for all opinions in an array using the opinion2html method
     * @param sourceData -  an array of visitor opinions
     * @returns {string} - html code with all the opinions
     */
    opinionArray2html(sourceData) {
        return sourceData.reduce(
            (htmlWithOpinions, opn) =>
                htmlWithOpinions + this.opinion2html(opn),
            ""
        );
    }
}
