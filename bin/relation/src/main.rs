use async_graphql::{
    http::GraphiQLSource, EmptyMutation, EmptySubscription, Object, Schema, SimpleObject, ID,
};
use async_graphql_axum::GraphQL;
use axum::{
    response::{self, IntoResponse},
    routing::get,
    Router,
};
use tokio::net::TcpListener;

async fn graphiql() -> impl IntoResponse {
    response::Html(GraphiQLSource::build().endpoint("/").finish())
}

#[derive(SimpleObject)]
pub struct Content {
    id: ID,
    relation_content: Vec<Content>,
}

struct Query;

#[Object]
impl Query {
    #[graphql(entity)]
    async fn find_content_by_id(&self, id: ID) -> Content {
        println!("ai id: {id:?}");
        if id == "1234" {
            Content {
                id: "1234".into(),
                relation_content: Vec::new(),
            }
        } else {
            Content {
                id: "1234".into(),
                relation_content: Vec::new(),
            }
        }
    }
}

#[tokio::main]
async fn main() {
    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        .directive(directives::lowercase)
        .directive(directives::is_admin)
        .finish();

    let app = Router::new().route("/", get(graphiql).post_service(GraphQL::new(schema)));

    println!("ai server run: http://localhost:4004");

    axum::serve(TcpListener::bind("127.0.0.1:4004").await.unwrap(), app)
        .await
        .unwrap();
}
