# Ticket Hub API 测试报告

## 测试概览

- **测试时间**: 2025-12-05 19:55:57
- **总测试数**: 47
- **通过测试**: 24
- **失败测试**: 23
- **通过率**: 51.06%

## 响应时间统计

- **平均响应时间**: 2.759s
- **最大响应时间**: 4.156s
- **最小响应时间**: 0.000s

## 状态码分布

- **200**: 16 次
- **307**: 8 次
- **404**: 15 次
- **422**: 2 次
- **500**: 3 次

## 测试类型分布

- **健康检查**: 2/2 (100.00%)
- **标签API**: 8/13 (61.54%)
- **票据API**: 14/32 (43.75%)

## 详细测试结果

### 健康检查

| 测试编号 | 测试名称 | 方法 | URL | 状态码 | 响应时间 | 结果 |
|---------|---------|------|-----|--------|----------|------|
| 2 | 根路径 | GET | http://localhost:8000/ | 200 | 2.062s | ✅ 通过 |
| 3 | 健康检查 | GET | http://localhost:8000/health | 200 | 2.036s | ✅ 通过 |

### 标签API

| 测试编号 | 测试名称 | 方法 | URL | 状态码 | 响应时间 | 结果 |
|---------|---------|------|-----|--------|----------|------|
| 6 | ⭐ 推荐先运行这个，获取实际的 label IDs | GET | http://localhost:8000/api/v1/labels?with_count=true&sort_by=created_at | 200 | 4.156s | ✅ 通过 |
| 7 | 获取所有标签（不带统计） | GET | http://localhost:8000/api/v1/labels?with_count=false | 200 | 4.098s | ✅ 通过 |
| 8 | 按名称排序获取标签 | GET | http://localhost:8000/api/v1/labels?with_count=true&sort_by=name | 200 | 4.089s | ✅ 通过 |
| 12 | 则在文件顶部设置: @labelId = 550e8400-e29b-41d4-a716-446655440000 | GET | http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000 | 404 | 2.057s | ❌ 失败 |
| 14 | 运行此请求后，从响应中复制 id，然后更新文件顶部的 @labelId 变量 | GET | http://localhost:8000/api/v1/labels?with_count=true&sort_by=created_at | 200 | 4.120s | ✅ 通过 |
| 18 | 示例：将 "测试标签" 改为 "测试标签-20241204-001" 或 "测试标签-随机数" | POST | http://localhost:8000/api/v1/labels | 307 | 2.056s | ✅ 通过 |
| 20 | ⚠️ 注意：使用唯一的名称避免 409 冲突错误 | POST | http://localhost:8000/api/v1/labels | 307 | 2.080s | ✅ 通过 |
| 21 | 更新标签（部分字段） | PUT | http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000 | 404 | 2.045s | ❌ 失败 |
| 22 | 更新标签（只更新颜色） | PUT | http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000 | 404 | 2.051s | ❌ 失败 |
| 23 | 删除标签 | DELETE | http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000 | 404 | 2.049s | ❌ 失败 |
| 9 | 测试：创建重复名称的标签（应该返回 409） | POST | http://localhost:8000/api/v1/labels | 0 | N/A | ❌ 失败 |
| 10 | 测试：获取不存在的标签（应该返回 404） | GET | http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000 | 404 | 2.041s | ✅ 通过 |
| 12 | 建议使用时间戳：工作流测试标签-20241204-001 | POST | http://localhost:8000/api/v1/labels | 307 | 2.081s | ✅ 通过 |

### 票据API

| 测试编号 | 测试名称 | 方法 | URL | 状态码 | 响应时间 | 结果 |
|---------|---------|------|-----|--------|----------|------|
| 6 | ⭐ 推荐先运行这个，获取实际的 ticket IDs | GET | http://localhost:8000/api/v1/tickets | 200 | 4.128s | ✅ 通过 |
| 7 | 获取 Tickets（指定分页） | GET | http://localhost:8000/api/v1/tickets?page=1&page_size=10 | 200 | 4.109s | ✅ 通过 |
| 8 | 按标题搜索 Tickets | GET | http://localhost:8000/api/v1/tickets?title=bug | 200 | 4.146s | ✅ 通过 |
| 9 | 筛选：只显示打开的 Tickets | GET | http://localhost:8000/api/v1/tickets?status=open | 200 | 4.122s | ✅ 通过 |
| 10 | 筛选：只显示已完成的 Tickets | GET | http://localhost:8000/api/v1/tickets?status=completed | 200 | 4.114s | ✅ 通过 |
| 11 | 筛选：按优先级 | GET | http://localhost:8000/api/v1/tickets?priority=high | 200 | 4.103s | ✅ 通过 |
| 12 | 筛选：按多个标签（逗号分隔的 UUID） | GET | http://localhost:8000/api/v1/tickets?label_ids=00000000-0000-0000-0000-000000000000,<another-label-id> | 500 | 4.117s | ❌ 失败 |
| 13 | 筛选：只显示无标签的 Tickets | GET | http://localhost:8000/api/v1/tickets?no_label=true | 200 | 4.128s | ✅ 通过 |
| 14 | 排序：按更新时间降序 | GET | http://localhost:8000/api/v1/tickets?sort_by=updated_at&sort_order=desc | 200 | 4.107s | ✅ 通过 |
| 15 | 排序：按优先级升序 | GET | http://localhost:8000/api/v1/tickets?sort_by=priority&sort_order=asc | 200 | 4.095s | ✅ 通过 |
| 16 | 组合查询：搜索 + 筛选 + 排序 + 分页 | GET | http://localhost:8000/api/v1/tickets?title=test&status=open&priority=high&sort_by=created_at&sort_order=desc&page=1&page_size=20 | 200 | 4.113s | ✅ 通过 |
| 20 | 则在文件顶部设置: @ticketId = 550e8400-e29b-41d4-a716-446655440000 | GET | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.063s | ❌ 失败 |
| 5 | 创建 Ticket（完整字段） | POST | http://localhost:8000/api/v1/tickets | 307 | 2.062s | ✅ 通过 |
| 6 | 创建 Ticket（最小字段） | POST | http://localhost:8000/api/v1/tickets | 307 | 2.053s | ✅ 通过 |
| 7 | 创建 Ticket（带多个标签） | POST | http://localhost:8000/api/v1/tickets | 0 | N/A | ❌ 失败 |
| 8 | 创建 Ticket（无标签） | POST | http://localhost:8000/api/v1/tickets | 307 | 2.047s | ✅ 通过 |
| 6 | 更新 Ticket（完整字段） | PUT | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.041s | ❌ 失败 |
| 7 | 更新 Ticket（只更新标题） | PUT | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.065s | ❌ 失败 |
| 8 | 更新 Ticket（只更新优先级） | PUT | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.070s | ❌ 失败 |
| 9 | 更新 Ticket（只更新标签） | PUT | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.044s | ❌ 失败 |
| 10 | 更新 Ticket（移除所有标签） | PUT | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.071s | ❌ 失败 |
| 7 | 完成 Ticket | PATCH | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000/complete | 404 | 2.086s | ❌ 失败 |
| 8 | 重新打开 Ticket | PATCH | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000/reopen | 404 | 2.072s | ❌ 失败 |
| 8 | 删除 Ticket | DELETE | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.074s | ❌ 失败 |
| 11 | 测试：获取不存在的 Ticket（应该返回 404） | GET | http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000 | 404 | 2.049s | ✅ 通过 |
| 12 | 测试：创建 Ticket 时使用无效的标签 ID（应该返回 404） | POST | http://localhost:8000/api/v1/tickets | 307 | 2.037s | ❌ 失败 |
| 13 | 测试：无效的分页参数（应该返回 422） | GET | http://localhost:8000/api/v1/tickets?page=0 | 422 | 4.140s | ❌ 失败 |
| 14 | 测试：无效的 page_size（应该返回 422） | GET | http://localhost:8000/api/v1/tickets?page_size=200 | 422 | 4.105s | ❌ 失败 |
| 15 | 测试：无效的优先级（应该返回 422） | POST | http://localhost:8000/api/v1/tickets | 307 | 2.072s | ❌ 失败 |
| 16 | 测试：无效的状态（应该返回 422） | GET | http://localhost:8000/api/v1/tickets?status=invalid | 500 | 4.116s | ❌ 失败 |
| 17 | 测试：无效的 UUID 格式（应该返回 400） | GET | http://localhost:8000/api/v1/tickets?label_ids=invalid-uuid | 500 | 4.107s | ❌ 失败 |
| 14 | 步骤 3: 创建 Ticket 并关联标签（替换 <label-id-from-step-1>） | POST | http://localhost:8000/api/v1/tickets | 0 | N/A | ❌ 失败 |

## 失败测试详情

### 测试 12: 则在文件顶部设置: @labelId = 550e8400-e29b-41d4-a716-446655440000

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Label not found"
}

### 测试 21: 更新标签（部分字段）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Label not found"
}

### 测试 22: 更新标签（只更新颜色）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Label not found"
}

### 测试 23: 删除标签

- **方法**: DELETE
- **URL**: http://localhost:8000/api/v1/labels/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Label not found"
}

### 测试 12: 筛选：按多个标签（逗号分隔的 UUID）

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets?label_ids=00000000-0000-0000-0000-000000000000,<another-label-id>
- **期望状态码**: 200
- **实际状态码**: 500

### 测试 20: 则在文件顶部设置: @ticketId = 550e8400-e29b-41d4-a716-446655440000

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 7: 创建 Ticket（带多个标签）

- **方法**: POST
- **URL**: http://localhost:8000/api/v1/tickets
- **期望状态码**: 201
- **实际状态码**: 0
- **错误信息**: [WinError 10054] 远程主机强迫关闭了一个现有的连接。

### 测试 6: 更新 Ticket（完整字段）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 7: 更新 Ticket（只更新标题）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 8: 更新 Ticket（只更新优先级）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 9: 更新 Ticket（只更新标签）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 10: 更新 Ticket（移除所有标签）

- **方法**: PUT
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 7: 完成 Ticket

- **方法**: PATCH
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000/complete
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 8: 重新打开 Ticket

- **方法**: PATCH
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000/reopen
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 8: 删除 Ticket

- **方法**: DELETE
- **URL**: http://localhost:8000/api/v1/tickets/00000000-0000-0000-0000-000000000000
- **期望状态码**: 200
- **实际状态码**: 404
- **响应数据**: {
  "detail": "Ticket not found"
}

### 测试 9: 测试：创建重复名称的标签（应该返回 409）

- **方法**: POST
- **URL**: http://localhost:8000/api/v1/labels
- **期望状态码**: 409
- **实际状态码**: 0
- **错误信息**: [WinError 10054] 远程主机强迫关闭了一个现有的连接。

### 测试 12: 测试：创建 Ticket 时使用无效的标签 ID（应该返回 404）

- **方法**: POST
- **URL**: http://localhost:8000/api/v1/tickets
- **期望状态码**: 404
- **实际状态码**: 307

### 测试 13: 测试：无效的分页参数（应该返回 422）

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets?page=0
- **期望状态码**: 404
- **实际状态码**: 422
- **响应数据**: {
  "detail": [
    {
      "type": "greater_than_equal",
      "loc": [
        "query",
        "page"
      ],
      "msg": "Input should be greater than or equal to 1",
      "input": "0",
      "ctx": {
        "ge": 1
      }
    }
  ]
}

### 测试 14: 测试：无效的 page_size（应该返回 422）

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets?page_size=200
- **期望状态码**: 404
- **实际状态码**: 422
- **响应数据**: {
  "detail": [
    {
      "type": "less_than_equal",
      "loc": [
        "query",
        "page_size"
      ],
      "msg": "Input should be less than or equal to 100",
      "input": "200",
      "ctx": {
        "le": 100
      }
    }
  ]
}

### 测试 15: 测试：无效的优先级（应该返回 422）

- **方法**: POST
- **URL**: http://localhost:8000/api/v1/tickets
- **期望状态码**: 404
- **实际状态码**: 307

### 测试 16: 测试：无效的状态（应该返回 422）

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets?status=invalid
- **期望状态码**: 404
- **实际状态码**: 500

### 测试 17: 测试：无效的 UUID 格式（应该返回 400）

- **方法**: GET
- **URL**: http://localhost:8000/api/v1/tickets?label_ids=invalid-uuid
- **期望状态码**: 404
- **实际状态码**: 500

### 测试 14: 步骤 3: 创建 Ticket 并关联标签（替换 <label-id-from-step-1>）

- **方法**: POST
- **URL**: http://localhost:8000/api/v1/tickets
- **期望状态码**: 201
- **实际状态码**: 0
- **错误信息**: [WinError 10054] 远程主机强迫关闭了一个现有的连接。

## 性能分析

### 响应时间较慢的测试 (>1.0s)

- 测试 6: ⭐ 推荐先运行这个，获取实际的 label IDs - 4.156s
- 测试 8: 按标题搜索 Tickets - 4.146s
- 测试 13: 测试：无效的分页参数（应该返回 422） - 4.140s
- 测试 13: 筛选：只显示无标签的 Tickets - 4.128s
- 测试 6: ⭐ 推荐先运行这个，获取实际的 ticket IDs - 4.128s
- 测试 9: 筛选：只显示打开的 Tickets - 4.122s
- 测试 14: 运行此请求后，从响应中复制 id，然后更新文件顶部的 @labelId 变量 - 4.120s
- 测试 12: 筛选：按多个标签（逗号分隔的 UUID） - 4.117s
- 测试 16: 测试：无效的状态（应该返回 422） - 4.116s
- 测试 10: 筛选：只显示已完成的 Tickets - 4.114s

## 建议

- ⚠️ 有 23 个测试失败，请检查失败的测试并修复相关问题
- ⚠️ 平均响应时间较慢 (2.759s)，建议优化数据库查询和 API 性能
- ⚠️ 存在响应时间过长的请求 (4.156s)，建议检查特定端点的性能
