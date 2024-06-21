use anyhow::Ok;
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
use serde_json::json;
use tokio::net::TcpListener;

use qdrant_client::prelude::*;
use qdrant_client::qdrant::vectors_config::Config;
use qdrant_client::qdrant::{
    Condition, CreateCollection, Filter, SearchPoints, VectorParams, VectorsConfig,
};

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

    async fn search(
        &self,
        ctx: &Context<'_>,
        prompt: String,
        limit: Option<u64>,
        offset: Option<u64>,
    ) -> Result<Vec<Content>, anyhow::Error> {
        let client = ctx.data_unchecked::<QdrantClient>();

        let collections_list = client.list_collections().await?;
        println!("collections_list2: {collections_list:#?}");

        // 将查询描述转化为向量
        let query_vector = get_query_vector(prompt).await;
        let search_result = client
            .search_points(&SearchPoints {
                collection_name: "image_collection".to_string(),
                vector: query_vector,
                limit: limit.unwrap_or(10),
                offset,
                ..Default::default()
            })
            .await?;

        Ok(search_result
            .result
            .iter()
            .map(|hit| {
                println!("hit: {hit:?}");
                Content {
                    id: "123".into(),
                    tag: vec![],
                }
            })
            .collect())
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
async fn main() -> anyhow::Result<(), anyhow::Error> {
    let client = QdrantClient::from_url("http://localhost:6334").build()?;

    let collections_list = client.list_collections().await?;

    println!("collections_list: {collections_list:#?}");
    client.delete_collection("image_collection").await?;
    client
        .create_collection(&CreateCollection {
            collection_name: "image_collection".into(),
            vectors_config: Some(VectorsConfig {
                config: Some(Config::Params(VectorParams {
                    size: 10,
                    distance: Distance::Cosine.into(),
                    ..Default::default()
                })),
            }),
            ..Default::default()
        })
        .await?;

    let collection_info = client.collection_info("image_collection").await?;

    println!("collection_info: {collection_info:#?}");

    let payload: Payload = json!(
        {
            "id": "123",
            "desc": "人脸"
        }
    )
    .try_into()
    .unwrap();

    let points = vec![PointStruct::new(0, vec![12.; 10], payload)];
    client
        .upsert_points_blocking("image_collection", None, points, None)
        .await?;

    let schema = Schema::build(Query, EmptyMutation, EmptySubscription)
        .directive(directives::lowercase)
        .directive(directives::is_admin)
        .data(client)
        .finish();

    let app = Router::new().route("/", get(graphiql).post_service(GraphQL::new(schema)));

    println!("ai server run: http://localhost:4003");

    axum::serve(TcpListener::bind("127.0.0.1:4003").await.unwrap(), app).await?;
    Ok(())
}

async fn get_query_vector(prompt: String) -> Vec<f32> {
    // 使用预训练模型将描述转化为向量
    // 这里是一个示例，实际应该调用模型
    vec![11.; 10] // 示例向量
}
