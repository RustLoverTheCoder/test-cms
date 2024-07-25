# CMS

## dev

rover dev --supergraph-config supergraph.yaml
or
./router --dev --config router.yaml --supergraph supergraph.graphql --log debug --anonymous-telemetry-disabled

## build

rover supergraph compose --config ./supergraph.yaml --output supergraph.graphql
./router --config router.yaml --supergraph supergraph.graphql --log info --anonymous-telemetry-disabled

## bench
cargo install oha
oha -m POST -c 8 -z 10s -A 'content-type: application/json' -d '{"query":"query { accounts {id} }"}' 'http://127.0.0.1:4000/'



## crop

### 基础图片处理

1. 格式转化
2. 自适应格式
3. 压缩
4. 裁剪
5. 旋转/翻转
6. 负片
7. 缩放
8. 锐化
9. 调色
10. 图文水印
11. 圆角矩形
12. 高斯模糊

### 智能图片处理

1. 画质评分
2. 画质增强
3. 智能裁剪
4. 多图合成
5. 智能抠图
6. 集智瘦身
7. 盲水印
8. 智能审核
9. 图片修复

