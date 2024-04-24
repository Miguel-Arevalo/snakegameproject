
import {run_game} from "./snake_game.js";
import * as comm from "./server_communication.js";

function game_wrapper() {

    document.addEventListener("game_over", comm.game_over);
    run_game();

}

document.getElementById("start button").addEventListener("click", game_wrapper);