import json
import requests

def replace_selectors(json_data):
    # 替换选择器的函数
    def replace_selector(selector):
        if "." in selector and "@" in selector:
            parts = selector.split('.')
            tag = parts[0]
            selector_part = parts[1]
            if "@" in selector_part:
                num, at_text = selector_part.split('@', 1)
                if ":" in num:
                    num, tag_after_colon = num.split(':', 1)
                    num = f"{num}@{tag_after_colon}"
                if num.replace("-", "").replace(".", "").isdigit():
                    num = "1" if num == "0" else num  # 处理小数点后面是0的情况
                    if num.startswith("-"):
                        num = num[1:]
                        return f"{tag}:nth-last-child({num})@{at_text}"
                    else:
                        return f"{tag}:nth-child({num})@{at_text}"
        return selector

    # 处理列表类型的 JSON 数据
    if isinstance(json_data, list):
        for item in json_data:
            replace_selectors(item)
        return

    # 遍历字典类型的 JSON 数据，查找并替换选择器
    for key, value in json_data.items():
        if isinstance(value, str):
            if "@" in value:
                value = replace_selector(value)
            json_data[key] = value
        elif isinstance(value, dict):
            replace_selectors(value)
        elif isinstance(value, list):
            for item in value:
                if isinstance(item, dict):
                    replace_selectors(item)

    # 增加替换规则，当"ruleExplore": []时，替换为"ruleExplore": "##"
    if "ruleExplore" in json_data and not json_data["ruleExplore"]:
        json_data["ruleExplore"] = "##"

if __name__ == "__main__":
    # 用户输入 JSON 文件的 URL
    json_url = input("请输入 JSON 文件的 URL: ")

    # 下载 JSON 数据
    response = requests.get(json_url)
    json_data = response.json()

    # 替换选择器
    replace_selectors(json_data)

    # 提取文件名，并保存 JSON 内容到文件
    file_name = json_url.split('/')[-1]
    with open(file_name, 'w', encoding='utf-8') as file:
        json.dump(json_data, file, indent=4, ensure_ascii=False)

    print(f"JSON 内容已按照新的替换原则进行替换并保存为文件：{file_name}")
