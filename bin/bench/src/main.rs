use anyhow::Result;
use async_trait::async_trait;
use clap::Parser;
use reqwest::{Client, Url};
use rlt::{
    cli::BenchCli,
    IterReport, {BenchSuite, IterInfo},
};
use tokio::time::Instant;

#[derive(Parser, Clone)]
pub struct HttpBench {
    /// Target URL.
    pub url: Url,

    /// Embed BenchCli into this Opts.
    #[command(flatten)]
    pub bench_opts: BenchCli,
}

#[async_trait]
impl BenchSuite for HttpBench {
    type WorkerState = Client;

    async fn state(&self, _: u32) -> Result<Self::WorkerState> {
        Ok(Client::new())
    }

    async fn bench(&mut self, client: &mut Self::WorkerState, _: &IterInfo) -> Result<IterReport> {
        let t = Instant::now();
        let request_body = serde_json::json!({
            "query": "query { accounts {id} }"
        });
        let resp = client
            .post(self.url.clone())
            .json(&request_body)
            .header("Content-Type", "application/json")
            .send()
            .await?;
        let status = resp.status().into();
        let bytes = resp.bytes().await?.len() as u64;
        let duration = t.elapsed();
        let iter_report = IterReport {
            duration,
            status,
            bytes,
            items: 1,
        };
        println!("{iter_report:?}");
        Ok(iter_report)
    }
}

///
/// cargo run -q --release -- http://127.0.0.1:4005/ -c 8 -d 5s
/// 
#[tokio::main]
async fn main() -> Result<()> {
    tracing_subscriber::fmt::init();
    let bs = HttpBench::parse();
    rlt::cli::run(bs.bench_opts, bs).await
}
