use async_graphql::{
    http::GraphiQLSource, EmptyMutation, EmptySubscription, InputObject, Object, Schema,
    SimpleObject, ID,
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
    crop_url: Option<String>,
}

struct Query;

#[derive(InputObject)]
struct Size {
    w: i32,
    h: i32,
}

#[Object]
impl Query {
    async fn get_crop_url(&self, #[graphql(key)] id: ID, size: Size) -> Content {
        Content {
            id,
            crop_url: Some(format!("oss?w={}&h={}", size.w, size.h)),
        }
    }

    #[graphql(entity)]
    async fn find_content_by_id(&self, #[graphql(key)] id: ID) -> Content {
        println!("transform id: {id:?}");
        if id == "1234" {
            Content {
                id: "1234".into(),
                crop_url: Some(format!("oss")),
            }
        } else {
            Content {
                id: "1234".into(),
                crop_url: Some(format!("oss")),
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

    println!("crop server run: http://localhost:4002");

    axum::serve(TcpListener::bind("127.0.0.1:4002").await.unwrap(), app)
        .await
        .unwrap();
}
