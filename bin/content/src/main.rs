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
    name: Option<String>,
    review_count: u32,
}

impl Content {
    fn me() -> Content {
        Content {
            id: "1234".into(),
            name: Some("Test.mp4".to_string()),
            review_count: 0,
        }
    }
}

struct Query;

#[Object]
impl Query {
    async fn find_content_by_id(&self, id: ID) -> Content {
        Content {
            id,
            name: Some("Test.mp4".to_string()),
            review_count: 0,
        }
    }

    #[graphql(entity)]
    async fn find_user_by_id(&self, id: ID) -> Content {
        println!("content id: {id:?}");
        if id == "1234" {
            Content::me()
        } else {
            Content::me()
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

    println!("content server run: http://localhost:4001");

    axum::serve(TcpListener::bind("127.0.0.1:4001").await.unwrap(), app)
        .await
        .unwrap();
}
