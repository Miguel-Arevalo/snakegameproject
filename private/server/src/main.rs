#[macro_use] extern crate rocket;

use std::env;
use std::fs::File;
use std::io::Read;

const webroot: &str = "../../public";

#[get("/")]
fn index() -> String {

    if let Ok(mut f) = File::open(format!("{}/{}", webroot, "index.html")) {
        let mut index_contents = String::new();

        f.read_to_string(&mut index_contents);

        return index_contents;
    }

    return "hello world!".to_string();
}

#[get("/world")]
fn world() -> &'static str {
    "Hello, world!"
}

#[launch]
fn rocket() -> _ {
    rocket::build().mount("/", routes![index, world])
}
