---
title: Hugo 自动部署与发布工作流
description: 面向个人博客与作品集场景，梳理从本地修改、Git 提交到 GitHub Pages 自动发布的完整链路。
date: 2026-04-04T19:00:00+08:00
lastmod: 2026-04-04T19:00:00+08:00
cover: "images/site-banner-aurora.svg"
banner: "images/site-banner-aurora.svg"
role: 调试 / 配置 / 发布流程
period: 2026.04
featured: true
tech_stack:
  - Hugo
  - Git
  - GitHub Actions
  - GitHub Pages
  - YAML
highlights:
  - 修复配置文件编码、模板作用域与工作流冲突导致的发布失败问题
  - 建立本地提交后自动触发构建与部署的稳定更新流程
  - 为后续日常写作与作品维护准备了更低成本的发布方式
links:
  demo: https://nideswshi.github.io/
  repo: https://github.com/Nideswshi/nideswshi.github.io
---

## 项目背景

个人站点如果只有页面设计而没有稳定发布链路，后续维护成本会非常高。

这个项目的重点并不是新增某个单一页面，而是确保网站在以下流程中都能稳定运行：

- 本地修改配置与内容
- 提交到 `main`
- 由 GitHub Actions 自动构建
- 自动发布到 GitHub Pages

## 处理过的问题

- 配置文件编码与 YAML 格式错误
- GitHub Actions 工作流未正确接管 Pages 构建
- 模板作用域问题导致 Hugo 在渲染作品详情页时报错
- 本地仓库与远端分支不同步导致的推送冲突

## 结果

最终形成了一条更适合个人博客长期使用的发布流程：修改内容、提交代码、自动部署、上线预览。

这让网站后续可以更专注于“持续更新”，而不是反复处理环境和配置问题。
