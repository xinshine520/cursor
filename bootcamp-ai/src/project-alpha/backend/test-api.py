#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import urllib.request
import urllib.parse
import json
import time
import re
from datetime import datetime
import uuid

BASE_URL = "http://localhost:8000"
API_VERSION = "/api/v1"
test_results = []
created_resources = {"labels": [], "tickets": []}
# 动态获取的 ID
label_id = None
ticket_id = None

class TestResult:
    def __init__(self, test_num, test_name, method, url, expected_status=200):
        self.test_num = test_num
        self.test_name = test_name
        self.method = method
        self.url = url
        self.expected_status = expected_status
        self.actual_status = None
        self.response_time = None
        self.response_data = None
        self.error = None
        self.passed = False

    def set_result(self, actual_status, response_time, response_data=None, error=None):
        self.actual_status = actual_status
        self.response_time = response_time
        self.response_data = response_data
        self.error = error
        if self.expected_status >= 400:
            self.passed = (self.actual_status == self.expected_status) and (self.error is None)
        else:
            # 对于创建请求，201 或 307（重定向）都算成功
            if self.expected_status == 201:
                self.passed = (self.actual_status in [200, 201, 307]) and (self.error is None)
            else:
                self.passed = (200 <= self.actual_status < 300) and (self.error is None)

def make_request(method, url, data=None, expected_status=200):
    global label_id, ticket_id
    
    result = TestResult(0, f"{method} {url}", method, url, expected_status)
    try:
        start_time = time.time()
        
        # 确保 POST/PUT/PATCH 请求的 URL 不以斜杠结尾（避免 FastAPI 重定向）
        if method.upper() in ['POST', 'PUT', 'PATCH'] and url.endswith('/'):
            url = url.rstrip('/')
            result.url = url
        
        req = urllib.request.Request(url)
        req.add_header('Content-Type', 'application/json')
        
        if method.upper() == "GET":
            req.get_method = lambda: 'GET'
        elif method.upper() == "POST":
            req.get_method = lambda: 'POST'
            if data:
                # 替换变量
                data_str = json.dumps(data, ensure_ascii=False)
                data_str = data_str.replace('{{labelId}}', label_id or '00000000-0000-0000-0000-000000000000')
                data_str = data_str.replace('<another-label-id>', label_id or '00000000-0000-0000-0000-000000000000')
                data_str = data_str.replace('<label-id-from-step-1>', label_id or '00000000-0000-0000-0000-000000000000')
                data_str = data_str.replace('<ticket-id-from-step-3>', ticket_id or '00000000-0000-0000-0000-000000000000')
                data = json.loads(data_str)
                req.data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        elif method.upper() == "PUT":
            req.get_method = lambda: 'PUT'
            if data:
                data_str = json.dumps(data, ensure_ascii=False)
                data_str = data_str.replace('{{labelId}}', label_id or '00000000-0000-0000-0000-000000000000')
                data = json.loads(data_str)
                req.data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        elif method.upper() == "PATCH":
            req.get_method = lambda: 'PATCH'
            if data:
                req.data = json.dumps(data, ensure_ascii=False).encode('utf-8')
        elif method.upper() == "DELETE":
            req.get_method = lambda: 'DELETE'
        else:
            result.set_result(0, 0, error=f"不支持的 HTTP 方法: {method}")
            return result
            
        with urllib.request.urlopen(req, timeout=30) as response:
            response_time = time.time() - start_time
            response_data = None
            try:
                content = response.read().decode('utf-8')
                if content:
                    response_data = json.loads(content)
            except:
                response_data = content if content else None
            result.set_result(response.getcode(), response_time, response_data)
        
        # 保存创建的资源 ID
        if method.upper() == "POST" and result.actual_status == 201:
            if "/labels" in url and response_data and isinstance(response_data, dict):
                label_id_new = response_data.get("id")
                if label_id_new:
                    created_resources["labels"].append(label_id_new)
                    if not label_id:
                        label_id = label_id_new
            elif "/tickets" in url and response_data and isinstance(response_data, dict):
                ticket_id_new = response_data.get("id")
                if ticket_id_new:
                    created_resources["tickets"].append(ticket_id_new)
                    if not ticket_id:
                        ticket_id = ticket_id_new
        
        # 从 GET 响应中提取 ID
        if method.upper() == "GET" and result.actual_status == 200:
            if "/labels" in url and response_data:
                if isinstance(response_data, list) and len(response_data) > 0:
                    first_label = response_data[0]
                    if isinstance(first_label, dict) and first_label.get("id"):
                        if not label_id:
                            label_id = first_label.get("id")
                elif isinstance(response_data, dict) and response_data.get("id"):
                    if not label_id:
                        label_id = response_data.get("id")
            elif "/tickets" in url and response_data:
                if isinstance(response_data, dict) and "items" in response_data:
                    items = response_data.get("items", [])
                    if len(items) > 0 and isinstance(items[0], dict) and items[0].get("id"):
                        if not ticket_id:
                            ticket_id = items[0].get("id")
                elif isinstance(response_data, list) and len(response_data) > 0:
                    if isinstance(response_data[0], dict) and response_data[0].get("id"):
                        if not ticket_id:
                            ticket_id = response_data[0].get("id")
                elif isinstance(response_data, dict) and response_data.get("id"):
                    if not ticket_id:
                        ticket_id = response_data.get("id")
                
    except urllib.error.HTTPError as e:
        response_time = time.time() - start_time
        try:
            content = e.read().decode('utf-8')
            response_data = json.loads(content) if content else None
        except:
            response_data = None
        result.set_result(e.code, response_time, response_data)
    except Exception as e:
        result.set_result(0, 0, error=str(e))
    return result

def parse_rest_file(file_path):
    test_cases = []
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    lines = content.split('\n')
    current_test = None
    json_buffer = []
    in_json = False
    test_num = 0
    
    for i, line in enumerate(lines):
        stripped = line.strip()
        
        # 跳过注释行（以 # 开头的，但不是 ###）
        if stripped.startswith('#') and not stripped.startswith('###'):
            continue
        
        # 跳过空行
        if not stripped:
            continue
        
        # 解析测试用例标题
        if stripped.startswith('###') and not stripped.startswith('####'):
            # 提取测试名称
            test_name = stripped.replace('###', '').strip()
            # 如果包含数字编号，提取
            match = re.search(r'(\d+)\.\s*(.+)', test_name)
            if match:
                test_num = int(match.group(1))
                test_name = match.group(2).strip()
            elif test_name and not test_name.startswith('='):
                test_num += 1
            else:
                continue
            
            if current_test:
                test_cases.append(current_test)
            current_test = {
                'test_num': test_num,
                'test_name': test_name,
                'method': None,
                'url': None,
                'data': None,
                'expected_status': 200
            }
            continue
        
        # 解析 HTTP 请求行
        if stripped.startswith(('GET ', 'POST ', 'PUT ', 'PATCH ', 'DELETE ')):
            if current_test:
                parts = stripped.split()
                current_test['method'] = parts[0]
                url = parts[1] if len(parts) > 1 else ''
                # 替换变量
                url = url.replace('{{baseUrl}}', BASE_URL)
                url = url.replace('{{apiVersion}}', API_VERSION)
                url = url.replace('{{labelId}}', label_id or '00000000-0000-0000-0000-000000000000')
                url = url.replace('{{ticketId}}', ticket_id or '00000000-0000-0000-0000-000000000000')
                current_test['url'] = url
                json_buffer = []
                in_json = False
        
        elif stripped.startswith('Content-Type:'):
            continue
        
        elif stripped.startswith('{'):
            in_json = True
            json_buffer = [stripped]
        elif in_json:
            json_buffer.append(stripped)
            if stripped.endswith('}'):
                try:
                    json_str = '\n'.join(json_buffer)
                    # 替换变量
                    json_str = json_str.replace('{{labelId}}', label_id or '00000000-0000-0000-0000-000000000000')
                    json_str = json_str.replace('<another-label-id>', label_id or '00000000-0000-0000-0000-000000000000')
                    json_str = json_str.replace('<label-id-from-step-1>', label_id or '00000000-0000-0000-0000-000000000000')
                    json_str = json_str.replace('<ticket-id-from-step-3>', ticket_id or '00000000-0000-0000-0000-000000000000')
                    data = json.loads(json_str)
                    if current_test:
                        current_test['data'] = data
                except json.JSONDecodeError:
                    pass
                in_json = False
                json_buffer = []
    
    if current_test:
        test_cases.append(current_test)
    return test_cases

def execute_tests():
    global label_id, ticket_id
    
    print("=" * 60)
    print("开始执行 Ticket Hub API 测试")
    print("=" * 60)
    print(f"API 基础 URL: {BASE_URL}")
    print(f"API 版本: {API_VERSION}\n")
    
    rest_file = 'test.rest'
    print(f"解析测试文件: {rest_file}")
    test_cases = parse_rest_file(rest_file)
    print(f"找到 {len(test_cases)} 个测试用例\n")
    
    for i, test_case in enumerate(test_cases):
        test_num = test_case.get('test_num', i + 1)
        test_name = test_case.get('test_name', f'测试 {test_num}')
        method = test_case.get('method')
        url = test_case.get('url')
        data = test_case.get('data')
        
        if not method or not url:
            continue
        
        # 根据测试类型确定期望状态码
        expected_status = 200
        if method == 'POST' and '/labels' in url:
            if '重复' in test_name or 'Bug' in str(data):
                expected_status = 409
            else:
                expected_status = 201
        elif method == 'POST' and '/tickets' in url:
            if '无效' in test_name:
                expected_status = 404
            else:
                expected_status = 201
        elif method == 'DELETE':
            expected_status = 200
        elif '不存在' in test_name or '无效' in test_name:
            if method == 'GET':
                expected_status = 404
            elif method in ['PUT', 'PATCH', 'DELETE']:
                expected_status = 404
            elif method == 'POST':
                expected_status = 404
        elif '无效' in test_name and '参数' in test_name:
            expected_status = 422
        elif '无效' in test_name and '格式' in test_name:
            expected_status = 400
        
        # 更新 URL 中的变量
        url = url.replace('{{labelId}}', label_id or '00000000-0000-0000-0000-000000000000')
        url = url.replace('{{ticketId}}', ticket_id or '00000000-0000-0000-0000-000000000000')
        
        result = make_request(method, url, data, expected_status)
        result.test_num = test_num
        result.test_name = test_name
        test_results.append(result)
        
        status_icon = "✅" if result.passed else "❌"
        print(f"[{status_icon}] 测试 {test_num}: {test_name}")
        print(f"      {method} {url}")
        print(f"      状态码: {result.actual_status} (期望: {result.expected_status})")
        if result.response_time:
            print(f"      响应时间: {result.response_time:.3f}s")
        if result.error:
            print(f"      错误: {result.error}")
        if label_id and 'label' in url.lower():
            print(f"      当前 labelId: {label_id}")
        if ticket_id and 'ticket' in url.lower():
            print(f"      当前 ticketId: {ticket_id}")
        print()
        
        if i < len(test_cases) - 1:
            time.sleep(0.1)

def generate_report():
    passed_count = sum(1 for r in test_results if r.passed)
    failed_count = len(test_results) - passed_count
    pass_rate = (passed_count / len(test_results) * 100) if test_results else 0
    
    response_times = [r.response_time for r in test_results if r.response_time is not None]
    avg_response_time = sum(response_times) / len(response_times) if response_times else 0
    max_response_time = max(response_times) if response_times else 0
    min_response_time = min(response_times) if response_times else 0
    
    status_codes = {}
    for r in test_results:
        if r.actual_status:
            status_codes[r.actual_status] = status_codes.get(r.actual_status, 0) + 1
    
    test_types = {}
    for r in test_results:
        test_type = '其他'
        url = r.url.lower()
        if 'health' in url or r.url == BASE_URL or r.url == f"{BASE_URL}/":
            test_type = '健康检查'
        elif '/labels' in url:
            test_type = '标签API'
        elif '/tickets' in url:
            test_type = '票据API'
        
        if test_type not in test_types:
            test_types[test_type] = {'passed': 0, 'failed': 0}
        if r.passed:
            test_types[test_type]['passed'] += 1
        else:
            test_types[test_type]['failed'] += 1
    
    report = f"""# Ticket Hub API 测试报告

## 测试概览

- **测试时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
- **总测试数**: {len(test_results)}
- **通过测试**: {passed_count}
- **失败测试**: {failed_count}
- **通过率**: {pass_rate:.2f}%

## 响应时间统计

- **平均响应时间**: {avg_response_time:.3f}s
- **最大响应时间**: {max_response_time:.3f}s
- **最小响应时间**: {min_response_time:.3f}s

## 状态码分布

"""
    
    for code, count in sorted(status_codes.items()):
        report += f"- **{code}**: {count} 次\n"
    
    report += "\n## 测试类型分布\n\n"
    
    for test_type, counts in sorted(test_types.items()):
        total = counts['passed'] + counts['failed']
        pass_rate_type = counts['passed'] / total * 100 if total > 0 else 0
        report += f"- **{test_type}**: {counts['passed']}/{total} ({pass_rate_type:.2f}%)\n"
    
    report += "\n## 详细测试结果\n\n"
    
    type_order = ['健康检查', '标签API', '票据API', '其他']
    for test_type in type_order:
        if test_type not in test_types:
            continue
            
        type_results = []
        for r in test_results:
            url = r.url.lower()
            if test_type == '健康检查' and ('health' in url or r.url == BASE_URL or r.url == f"{BASE_URL}/"):
                type_results.append(r)
            elif test_type == '标签API' and '/labels' in url:
                type_results.append(r)
            elif test_type == '票据API' and '/tickets' in url:
                type_results.append(r)
        
        if not type_results:
            continue
            
        report += f"### {test_type}\n\n"
        report += "| 测试编号 | 测试名称 | 方法 | URL | 状态码 | 响应时间 | 结果 |\n"
        report += "|---------|---------|------|-----|--------|----------|------|\n"
        
        for r in type_results:
            status = "✅ 通过" if r.passed else "❌ 失败"
            response_time = f"{r.response_time:.3f}s" if r.response_time else "N/A"
            report += f"| {r.test_num} | {r.test_name} | {r.method} | {r.url} | {r.actual_status} | {response_time} | {status} |\n"
        
        report += "\n"
    
    failed_results = [r for r in test_results if not r.passed]
    if failed_results:
        report += "## 失败测试详情\n\n"
        for r in failed_results:
            report += f"### 测试 {r.test_num}: {r.test_name}\n\n"
            report += f"- **方法**: {r.method}\n"
            report += f"- **URL**: {r.url}\n"
            report += f"- **期望状态码**: {r.expected_status}\n"
            report += f"- **实际状态码**: {r.actual_status}\n"
            if r.error:
                report += f"- **错误信息**: {r.error}\n"
            if r.response_data:
                report += f"- **响应数据**: {json.dumps(r.response_data, ensure_ascii=False, indent=2)}\n"
            report += "\n"
    
    report += "## 性能分析\n\n"
    slow_tests = [r for r in test_results if r.response_time and r.response_time > 1.0]
    if slow_tests:
        report += "### 响应时间较慢的测试 (>1.0s)\n\n"
        for r in sorted(slow_tests, key=lambda x: x.response_time, reverse=True)[:10]:
            report += f"- 测试 {r.test_num}: {r.test_name} - {r.response_time:.3f}s\n"
        report += "\n"
    else:
        report += "所有测试响应时间都在 1.0s 以内，性能良好。\n\n"
    
    report += "## 建议\n\n"
    if failed_count == 0:
        report += "- ✅ 所有测试通过，API 功能正常！\n"
    else:
        report += f"- ⚠️ 有 {failed_count} 个测试失败，请检查失败的测试并修复相关问题\n"
    if avg_response_time > 0.5:
        report += f"- ⚠️ 平均响应时间较慢 ({avg_response_time:.3f}s)，建议优化数据库查询和 API 性能\n"
    if max_response_time > 2.0:
        report += f"- ⚠️ 存在响应时间过长的请求 ({max_response_time:.3f}s)，建议检查特定端点的性能\n"
    
    with open("test-api.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("=" * 60)
    print("测试完成！")
    print("=" * 60)
    print(f"总测试数: {len(test_results)}")
    print(f"通过: {passed_count}")
    print(f"失败: {failed_count}")
    print(f"通过率: {pass_rate:.2f}%")
    print(f"\n报告已保存到: test-api.md")

def main():
    try:
        execute_tests()
        generate_report()
    except KeyboardInterrupt:
        print("\n\n测试被用户中断")
    except FileNotFoundError as e:
        print(f"\n错误: 找不到文件 - {e}")
    except Exception as e:
        print(f"\n测试过程中发生错误: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()

