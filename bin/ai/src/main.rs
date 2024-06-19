use async_graphql::{
    http::GraphiQLSource, Context, EmptyMutation, EmptySubscription, Object, Schema, SimpleObject,
    ID,
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
    tag: Vec<String>,
}

struct Query;

#[Object]
impl Query {
    async fn find_tags(&self) -> Vec<String> {
        vec!["xx".to_string(), "test".to_string()]
    }

    #[graphql(entity)]
    async fn find_content_by_id(&self, id: ID) -> Content {
        println!("ai id: {id:?}");
        if id == "1234" {
            Content {
                id: "1234".into(),
                tag: vec!["xx".to_string(), "test".to_string()],
            }
        } else {
            Content {
                id: "1234".into(),
                tag: vec!["xx".to_string(), "test".to_string()],
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

    println!("ai server run: http://localhost:4003");

    axum::serve(TcpListener::bind("127.0.0.1:4003").await.unwrap(), app)
        .await
        .unwrap();
}
