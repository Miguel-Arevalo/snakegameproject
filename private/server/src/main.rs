#[macro_use] extern crate rocket;

use std::env;

#[get("/")]
fn index() -> &'static str {

    if let Ok(curr_dir) = env::current_dir() {
        println!("current directory: {:?}", curr_dir);
    }

    return "hello world!";
}

#[get("/world")]
fn world() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, world])
}
