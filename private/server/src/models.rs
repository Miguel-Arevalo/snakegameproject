use crate::schema::*;

#[derive(Queryable, Insertable)]
#[diesel (table_name = users)]
pub struct User<'a> {
    pub username: &'a str
}