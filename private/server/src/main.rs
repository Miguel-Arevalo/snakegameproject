#[macro_use] extern crate rocket;

use rocket::fs::{FileServer, relative};
use rocket::response::status;
use rocket::serde::{Deserialize, json::Json};
use rocket::form::Form;

#[derive(Deserialize)]
struct Game {
    score: u8
}

#[derive(FromForm)]
struct Login<'r> {
    username: &'r str
}

#[post("/", format = "application/json", data = "<game>")]
fn score(game: Json<Game>) -> status::Accepted<()> {
    println!("score: {}", game.score);
    status::Accepted(())
}

#[post("/", format = "application/x-www-form-urlencoded", data = "<login_info>")]
fn login(login_info: Form<Login<'_>>) -> status::Accepted<()> {
    println!("username: {}", login_info.username);
    status::Accepted(())
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/",  FileServer::from(relative!("../../public")))
    .mount("/", routes![score, login]) // post requests
}
