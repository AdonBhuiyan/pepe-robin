import "./modules/buy-tooltip.js";
import "./modules/story.js";
import "./modules/tokenomics.js";
import './modules/memes.js'
import './modules/footer.js'
import './modules/contact.js'

import contactHtml from "../../partials/contact.html?raw";
import footerHtml from "../../partials/footer.html?raw";
import heroHtml from "../../partials/hero.html?raw";
import memesHtml from "../../partials/memes.html?raw";
import navbarHtml from "../../partials/navbar.html?raw";
import storyHtml from "../../partials/story.html?raw";
import tokenomicsHtml from "../../partials/tokenomics.html?raw";

document.getElementById("navbar-root").innerHTML = navbarHtml;
await import("./navbar.jsx"); // must load AFTER the markup exists
document.getElementsByClassName("hero")[0].innerHTML = heroHtml;
document.getElementById("story").innerHTML = storyHtml;
document.getElementById("tokenomics").innerHTML = tokenomicsHtml;
document.getElementById("memes").innerHTML = memesHtml;
document.getElementById("footer").innerHTML = footerHtml;
document.getElementById("contact").innerHTML = contactHtml;
