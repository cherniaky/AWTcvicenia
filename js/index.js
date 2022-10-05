import OpinionsHandlerMustache from "./opinionsHandlerMustache.js";

window.opnsHndlr = new OpinionsHandlerMustache(
    "opnFrm",
    "opinionsContainer",
    "mTmplOneOpinion"
);
window.opnsHndlr.init();
