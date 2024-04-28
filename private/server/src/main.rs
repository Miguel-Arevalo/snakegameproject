#[macro_use] extern crate rocket;


// client interaction
use rocket::fs::{FileServer, relative};
use rocket::response::status;
use rocket::serde::{Deserialize, json::Json};
use rocket::form::Form;

// database interaction

use rocket_db_pools::{Database, Connection};
use rocket_db_pools::diesel::{QueryResult, MysqlPool, prelude::*};

use std::env;

const databaseurl = 

// database definitions

#[derive(Database)]
#[database("diesel_mysql")]
struct Db(MysqlPool);

//client definitions

#[derive(Queryable, Insertable)]
#[diesel(table_name = users)]
struct User {
    user: String
}


diesel::table! {
    users (user) {
        user -> VarChar
    }
}



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
    let database_url = env::var("mysql").expect("umu");
    rocket::build().mount("/",  FileServer::from(relative!("../../public")))
    .mount("/", routes![score, login]) // post requests
}
