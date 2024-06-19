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
pub struct Account {
    id: ID,
    name: String,
    desc: String,
    roles: Vec<String>,       // "admin" "subscriber"
    permissions: Vec<String>, // "read:any_account", "read:own_account"
}

struct Query;

#[Object]
impl Query {
    async fn account(&self, id: ID) -> Account {
        Account {
            id,
            name: "Alice".to_string(),
            desc: "admin".to_string(),
            roles: vec!["admin".to_string()],
            permissions: vec![
                "read:any_account".to_string(),
                "read:own_account".to_string(),
            ],
        }
    }

    async fn accounts(&self) -> Vec<Account> {
        Vec::new()
    }

    #[graphql(entity)]
    async fn find_account_by_id(&self, id: ID) -> Account {
        Account {
            id,
            name: "Alice".to_string(),
            desc: "admin".to_string(),
            roles: vec!["admin".to_string()],
            permissions: vec![
                "read:any_account".to_string(),
                "read:own_account".to_string(),
            ],
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

    println!("ai server run: http://localhost:4005");

    axum::serve(TcpListener::bind("127.0.0.1:4005").await.unwrap(), app)
        .await
        .unwrap();
}
