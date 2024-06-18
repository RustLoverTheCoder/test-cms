use async_graphql::{Context, CustomDirective, Directive, ResolveFut, ServerResult, Value};

struct IsAdminDirective;

#[async_trait::async_trait]
impl CustomDirective for IsAdminDirective {
    async fn resolve_field(
        &self,
        ctx: &Context<'_>,
        resolve: ResolveFut<'_>,
    ) -> ServerResult<Option<Value>> {
        // ctx 判断是不是admin
        let mut ctx_user_is_admin = true;

        if ctx_user_is_admin {
            return resolve.await.map(|value| {
                value.map(|value| match value {
                    _ => value,
                })
            });
        } else {
            return Ok(None);
        }
    }
}

#[Directive(location = "Field")]
pub fn is_admin() -> impl CustomDirective {
    IsAdminDirective
}
