#[macro_use] extern crate rocket;

use rocket::fs::{FileServer, relative};
use rocket::response::status;

#[post("/")]
fn score() -> status::Accepted<()> {
    status::Accepted(())
}


#[launch]
fn rocket() -> _ {
    rocket::build().mount("/",  FileServer::from(relative!("../../public")))
    .mount("/", routes![score])
}
