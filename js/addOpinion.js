/*
 * Created by Stefan Korecko, 2020-21
 * Opinions form processing functionality
 */

/*
This function works with the form:

<form id="opnFrm">
    <label for="nameElm">Your name:</label>
    <input type="text" name="login" id="nameElm" size="20" maxlength="50" placeholder="Enter your name here" required />
    <br><br>
    <label for="opnElm">Your opinion:</label>
    <textarea name="comment" id="opnElm" cols="50" rows="3" placeholder="Express your opinion here" required></textarea>
    <br><br>
    <input type="checkbox" id="willReturnElm" />
    <label for="willReturnElm">I will definitely return to this page.</label>
    <br><br>
    <button type="submit">Send</button>
</form>

 */
export default function processOpnFrmData(event) {
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
    const bestRecipInp = document.getElementById("bestRecipInp").value.trim();

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

    console.log("New opinion:\n " + JSON.stringify(newOpinion));

    const opinions = JSON.parse(localStorage.opinions || "[]");

    opinions.push(newOpinion);

    localStorage.opinions = JSON.stringify(opinions);

    //5. Go to the opinions
    window.location.hash = "#opinions";
}
