use rocket_db_pools::{Database};
use rocket_db_pools::diesel::{MysqlPool};

#[derive(Database)]
#[database("gemu")]
pub struct GemuDB(MysqlPool);