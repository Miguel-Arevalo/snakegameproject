#[macro_use] extern crate rocket;

use rocket::fs::{FileServer, relative};
use rocket::response::status;
use rocket::serde::{Deserialize, json::Json};

#[derive(Deserialize)]
struct Game {
    score: u8
}

#[post("/", format = "application/json", data="<game>")]
fn score(game: Json<Game>) -> status::Accepted<()> {
    println!("score: {}", game.score);
    status::Accepted(())
}


#[launch]
fn rocket() -> _ {
    rocket::build().mount("/",  FileServer::from(relative!("../../public")))
    .mount("/", routes![score])
}
