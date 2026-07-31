import os
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.utils import ImageReader


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = Path(os.environ.get("RESUME_OUTPUT", ROOT / "public/docs/libonan-resume.pdf"))
PORTRAIT = ROOT / "public/assets/about/portrait.webp"

NAVY = HexColor("#1D2440")
INK = HexColor("#292929")
PAPER = HexColor("#F7F5EF")
ORANGE = HexColor("#FF5A1F")
BLUE = HexColor("#4D78FF")
MUTED = HexColor("#6F6F6B")
LINE = HexColor("#D8D4CA")

pdfmetrics.registerFont(TTFont("Heiti", "/System/Library/Fonts/STHeiti Medium.ttc", subfontIndex=1))
CN = "Heiti"
LATIN = "Helvetica"
LATIN_BOLD = "Helvetica-Bold"


def set_cn(c, size, color=INK):
    c.setFont(CN, size)
    c.setFillColor(color)


def wrap_cn(text, font, size, width):
    lines, current = [], ""
    for char in text:
        trial = current + char
        if pdfmetrics.stringWidth(trial, font, size) <= width or not current:
            current = trial
        else:
            lines.append(current)
            current = char
    if current:
        lines.append(current)
    return lines


def paragraph(c, text, x, y, width, size=9.2, leading=15, color=INK, max_lines=None):
    set_cn(c, size, color)
    lines = wrap_cn(text, CN, size, width)
    if max_lines:
        lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def label(c, text, x, y, color=ORANGE):
    c.setFillColor(color)
    c.setFont(LATIN_BOLD, 7)
    c.drawString(x, y, text)


def section_title(c, number, title, x, y, width):
    c.setStrokeColor(INK)
    c.setLineWidth(0.8)
    c.line(x, y + 8, x + width, y + 8)
    c.setFillColor(ORANGE)
    c.setFont(LATIN_BOLD, 7)
    c.drawString(x, y - 4, number)
    set_cn(c, 13, INK)
    c.drawString(x + 32, y - 6, title)
    return y - 30


def footer(c, page):
    w, _ = A4
    c.setStrokeColor(LINE)
    c.line(42, 31, w - 42, 31)
    c.setFillColor(MUTED)
    c.setFont(LATIN, 6.5)
    c.drawString(42, 19, "LIBONAN · AI VIDEO DIRECTOR · PUBLIC EDITION")
    c.drawRightString(w - 42, 19, f"0{page} / 02")


def page_one(c):
    w, h = A4
    c.setFillColor(PAPER)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, h - 238, w, 238, fill=1, stroke=0)
    c.setFillColor(ORANGE)
    c.rect(42, h - 56, 66, 5, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 8)
    c.drawString(42, h - 78, "AI VIDEO DIRECTOR / PORTFOLIO RESUME")
    set_cn(c, 38, PAPER)
    c.drawString(42, h - 132, "李博楠")
    c.setFillColor(ORANGE)
    c.setFont(LATIN_BOLD, 19)
    c.drawString(42, h - 160, "AI VIDEO DIRECTOR")
    set_cn(c, 10.5, PAPER)
    c.drawString(42, h - 187, "让工具服务于故事，而不是让故事迁就工具。")
    c.setFillColor(HexColor("#B8BECE"))
    c.setFont(LATIN, 8)
    c.drawString(42, h - 213, "530081825@qq.com")
    c.linkURL("mailto:530081825@qq.com", (42, h - 218, 150, h - 205), relative=0)

    # Portrait with a crisp orange rule.
    c.setFillColor(ORANGE)
    c.rect(w - 182, h - 220, 128, 166, fill=1, stroke=0)
    try:
        c.drawImage(ImageReader(str(PORTRAIT)), w - 187, h - 215, 128, 166, mask="auto", preserveAspectRatio=True, anchor="c")
    except Exception:
        pass

    x = 42
    body_w = w - 84
    y = h - 274
    y = section_title(c, "01", "职业概述", x, y, body_w)
    y = paragraph(c, "AI 视频编导，具备从传播洞察、创意概念、脚本分镜、角色设定到 AI 生成、剪辑与发布的独立闭环能力。持续探索 AIGC 工具、智能体与工作流，将重复判断沉淀为可复用 Skill，让创意生产更稳定、更高效。", x + 32, y, body_w - 32, 9.3, 15.5)

    y -= 17
    y = section_title(c, "02", "关键成果", x, y, body_w)
    metric_y = y - 3
    metric_w = body_w / 3
    metrics = [("245%", "文心快码视频号粉丝增长"), ("105万", "B站原创视频播放"), ("10万+", "MrBeast 联合营销曝光")]
    for i, (value, desc) in enumerate(metrics):
        mx = x + i * metric_w
        if i:
            c.setStrokeColor(LINE)
            c.line(mx, metric_y + 7, mx, metric_y - 54)
        c.setFillColor(i == 1 and BLUE or ORANGE)
        c.setFont(CN, 22)
        c.drawString(mx + 10, metric_y - 15, value)
        set_cn(c, 8, MUTED)
        c.drawString(mx + 10, metric_y - 36, desc)
    y = metric_y - 77

    y = section_title(c, "03", "工作经历", x, y, body_w)
    jobs = [
        ("2023.04 — PRESENT", "百度", "集团公关 · 视频编导", "负责品牌传播与 AI 内容创作，独立完成选题、策划、脚本、制作、剪辑和发布；持续探索 AIGC 创作流程与智能体协作。"),
        ("2021.08 — 2022.08", "深圳千里骏马", "视频编导", "承担创意策划、拍摄执行与后期剪辑，完成从需求理解到视频交付的全流程工作。"),
    ]
    for date, company, role, desc in jobs:
        label(c, date, x + 32, y + 1, BLUE)
        set_cn(c, 13, INK)
        c.drawString(x + 145, y - 1, company)
        set_cn(c, 8.5, MUTED)
        c.drawString(x + 265, y, role)
        y = paragraph(c, desc, x + 145, y - 21, body_w - 145, 8.4, 13.5, MUTED)
        y -= 14

    y -= 2
    y = section_title(c, "04", "教育背景", x, y, body_w)
    label(c, "2017.09 — 2021.07", x + 32, y, BLUE)
    set_cn(c, 12, INK)
    c.drawString(x + 145, y - 2, "四川音乐学院")
    set_cn(c, 8.5, MUTED)
    c.drawString(x + 265, y - 1, "戏剧影视文学 · 本科")
    footer(c, 1)


def project_card(c, x, y, width, number, title, category, description, accent):
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    c.rect(x, y - 95, width, 95, fill=0, stroke=1)
    c.setFillColor(accent)
    c.rect(x, y - 95, 6, 95, fill=1, stroke=0)
    c.setFillColor(accent)
    c.setFont(LATIN_BOLD, 7)
    c.drawString(x + 17, y - 18, number)
    set_cn(c, 13, INK)
    c.drawString(x + 17, y - 39, title)
    set_cn(c, 7.4, MUTED)
    c.drawString(x + 17, y - 56, category)
    paragraph(c, description, x + 17, y - 72, width - 30, 7.5, 11, INK, 2)


def page_two(c):
    w, h = A4
    c.setFillColor(PAPER)
    c.rect(0, 0, w, h, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, h - 94, w, 94, fill=1, stroke=0)
    c.setFillColor(PAPER)
    c.setFont(LATIN_BOLD, 8)
    c.drawString(42, h - 35, "SELECTED WORK / FULL-LOOP PRODUCTION")
    set_cn(c, 20, PAPER)
    c.drawString(42, h - 65, "独立闭环作品")
    c.setFillColor(ORANGE)
    c.rect(w - 108, h - 51, 66, 5, fill=1, stroke=0)

    x = 42
    body_w = w - 84
    gap = 12
    card_w = (body_w - gap) / 2
    top = h - 125
    project_card(c, x, top, card_w, "01", "端午粽子", "品牌动画 · 角色喜剧", "让粽子进入职场，把健康选择变成一场有角色、有冲突、有笑点的 C 位评选。", ORANGE)
    project_card(c, x + card_w + gap, top, card_w, "02", "过年有事找文心", "AI × 真人 MV · 新春传播", "把春节里的真实问题写进 MV，用真人表演与 AI 场景共同制造年味。", BLUE)
    project_card(c, x, top - 108, card_w, "03", "唐风浩荡", "历史叙事 · AI 影像", "让一位唐代人物跨越千年，从自己的视角回答一道高考历史题。", HexColor("#D69B2D"))
    project_card(c, x + card_w + gap, top - 108, card_w, "04", "选择你的文心英雄", "产品传播 · 英雄世界观", "把抽象的 AI 能力变成可以选择、可以理解、也可以记住的英雄角色。", HexColor("#2FA978"))

    y = top - 236
    y = section_title(c, "05", "AI 工作台", x, y, body_w)
    tool_rows = [
        ("叙事与推演", "ChatGPT · Gemini"),
        ("图像生成", "Image 2 · Nano Banana · Midjourney"),
        ("视频生成", "可灵 · 即梦"),
        ("智能体", "Codex · OpenClaw · Dodo"),
        ("剪辑后期", "剪映 · Final Cut Pro · DaVinci Resolve"),
        ("Skill 与插件", "开发者案例制作（自建）· 小红书自媒体制作（自建）· humanizer-zh · Remotion"),
    ]
    for i, (name, tools) in enumerate(tool_rows):
        row_x = x + (i % 2) * (body_w / 2)
        row_y = y - (i // 2) * 35
        set_cn(c, 8.5, INK)
        c.drawString(row_x + 32, row_y, name)
        set_cn(c, 6.6, MUTED)
        for j, line in enumerate(wrap_cn(tools, CN, 6.6, 154)[:3]):
            c.drawString(row_x + 102, row_y - j * 9, line)
    y -= 118

    y = section_title(c, "06", "能力沉淀与探索", x, y, body_w)
    items = [
        ("IN USE", "开发者案例制作 Skill / 小红书自媒体制作 Skill", "把内容经验封装成可被智能体重复调用、持续迭代的工作方法。"),
        ("PROTOTYPE COMPLETE", "Codex × Remotion 自动剪辑", "以时间码规划动态图形，由多个智能体完成生成、合成和规格验证。"),
        ("PROTOTYPING", "数字人口播工作流", "探索教程类内容从脚本、数字人到自动化剪辑与发布的完整链路。"),
    ]
    for status, title, desc in items:
        c.setFillColor(ORANGE if status == "IN USE" else BLUE)
        c.setFont(LATIN_BOLD, 6.2)
        c.drawString(x + 32, y, status)
        set_cn(c, 9, INK)
        c.drawString(x + 145, y - 1, title)
        set_cn(c, 7.4, MUTED)
        c.drawString(x + 145, y - 15, desc)
        y -= 38

    y -= 4
    y = section_title(c, "07", "作品链接", x, y, body_w)
    links = [
        ("AIGC 作品集（提取码 rm1r）", "https://pan.baidu.com/s/1yQVr5mlaC4LsoinExjw_Iw?pwd=rm1r"),
        ("开发者案例作品（提取码 1212）", "https://pan.baidu.com/s/1CQys26jGebZvIir-qlEU7A?pwd=1212"),
    ]
    for title, url in links:
        set_cn(c, 8.6, INK)
        c.drawString(x + 32, y, title)
        c.setFillColor(BLUE)
        c.setFont(LATIN, 6.4)
        c.drawString(x + 205, y, url)
        c.linkURL(url, (x + 200, y - 4, x + body_w, y + 8), relative=0)
        y -= 23

    c.setFillColor(NAVY)
    c.rect(x, 54, body_w, 48, fill=1, stroke=0)
    set_cn(c, 9.5, PAPER)
    c.drawString(x + 18, 77, "四个项目均独立完成从洞察到发布的全流程闭环。")
    c.setFillColor(ORANGE)
    c.setFont(LATIN_BOLD, 7)
    c.drawRightString(x + body_w - 18, 77, "STORY FIRST · AI NATIVE · FULL LOOP")
    footer(c, 2)


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=A4, pageCompression=1)
    c.setTitle("李博楠｜AI 视频编导｜公开简历")
    c.setAuthor("李博楠")
    c.setSubject("AI 视频编导公开求职简历")
    page_one(c)
    c.showPage()
    page_two(c)
    c.showPage()
    c.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
