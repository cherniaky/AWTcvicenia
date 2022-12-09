/*
 * Created by Stefan Korecko, 2021
 */

import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

// import DropdownMenuControl from "./dropdownMenuControl.js";

// window.drMenuCntrl = new DropdownMenuControl("menuIts", "menuTitle", "mnShow");

window.router = new Router(Routes, window.location.hash);

document.body.classList.add("stop-scrolling");

setTimeout(() => {
    document.body.classList.remove("stop-scrolling");
}, 2500);
