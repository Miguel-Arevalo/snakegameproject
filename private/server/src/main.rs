#[macro_use] extern crate rocket;
#[macro_use] extern crate diesel;


// project imports
mod db;
mod schema;
mod models;

use db::GemuDB;

// client interaction
use rocket::fs::{FileServer, relative};
use rocket::response::status;
use rocket::serde::{Deserialize, json::Json};
use rocket::form::Form;

// database interaction

use rocket_db_pools::{Database, Connection};

use rocket_db_pools::diesel::{QueryResult};

use std::env;


// models used to parse incoming data from the client
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
async fn login(mut db: Connection<GemuDB>, login_info: Form<Login<'_>>) -> QueryResult<status::Accepted<()>> {
    println!("username: {}", login_info.username);

    use schema::users::dsl::*;
    use models::{User};
    use rocket_db_pools::diesel::RunQueryDsl;

    let new_user = User {
        username: &login_info.username
    };

    diesel::insert_into(users)
        .values(new_user)
        .execute(&mut db)
        .await?;

    Ok(status::Accepted(()))
}

#[launch]
fn rocket() -> _ {
    rocket::build()
    .attach(GemuDB::init())
    .mount("/",  FileServer::from(relative!("../../public")))
    .mount("/", routes![score, login]) // post requests
}
