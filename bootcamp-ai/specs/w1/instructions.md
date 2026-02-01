# Instructions

## Project Alpha 项目需求和设计文档

构建一个简单的，使用 标签分类 和 管理ticket 的工具；项目基于 postgres 18.x 数据库，使用 FastApi 0.123.x 作为后端，使用 Typescript/ React 19.x/Vite 7.x/Tailwind 4.x/Shadcn 作为前端；不需要用户权限系统，默认当前用户就可以。

- 创建/编辑/删除/完成/取消完成 ticket
- 添加/删除 ticket 的标签
- 按不同标签查看 ticket 列表
- 按 title 查询 ticket

按以上想法，生成详细的需求和设计文档，存放在 ./specs/w1/v1-spec-composer.md 文件中，输出为中文。


## Implementation plan

按 ./specs/w1/v1-spec-sonnet.md 文件需求和设计文档，生成一个详细的实现计划，存放在 ./specs/w1/v1-plan-sonnet.md 文件中，输出为中文。

## Phased Implementation

按 ./specs/w1/v1-plan-sonnet.md 完整实现项目 Phase 1 代码