# CMS

## dev

rover dev --supergraph-config supergraph.yaml
or
./router --dev --config router.yaml --supergraph supergraph.graphql --log debug --anonymous-telemetry-disabled

## build

rover supergraph compose --config ./supergraph.yaml --output supergraph.graphql
./router --config router.yaml --supergraph supergraph.graphql

## bench
cargo install oha
oha -c 8 -z 10s -A 'content-type: application/json' -d '{"query":"query { accounts {id} }"}' 'http://127.0.0.1:4000/'

## Role and Permissions

### Super Admin

拥有所有的权限

### Org Admin

拥有对整个组织（包括其成员、图表和配置）的管理访问权限

### Documenter

记录员：拥有观察者角色的所有权限，以及编辑操作元数据的能力。

### Observer

仅查看访问权限

### Consumer

客户端查询

### Billing Manager

具有对组织级配置和计费的管理访问权限。还可以删除成员（但不能邀请他们）

## 对接口的权限，对字段的权限，对服务的权限