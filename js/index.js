import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

window.router = new Router(Routes, window.location.hash);
