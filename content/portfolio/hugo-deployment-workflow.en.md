---
title: Hugo Deployment Workflow
description: A deployment workflow for a personal Hugo site, covering local edits, Git commits, GitHub Actions, and GitHub Pages publishing.
date: 2026-04-04T19:00:00+08:00
lastmod: 2026-04-04T19:00:00+08:00
cover: "images/site-banner-aurora.svg"
banner: "images/site-banner-aurora.svg"
role: Debugging / Configuration / Deployment Workflow
period: 2026.04
featured: true
tech_stack:
  - Hugo
  - Git
  - GitHub Actions
  - GitHub Pages
  - YAML
highlights:
  - Fixed encoding, YAML formatting, workflow setup, and Hugo template scope problems that broke deployment
  - Built a stable workflow from local edits to automated publishing
  - Reduced the maintenance cost of future updates for both blog posts and portfolio content
links:
  demo: https://nideswshi.github.io/
  repo: https://github.com/Nideswshi/nideswshi.github.io
---

## Background

A personal site is not very useful if the design looks fine but the publishing workflow is unstable.

This project focused on making the full path reliable:

- edit content locally
- commit and push to `main`
- build through GitHub Actions
- publish through GitHub Pages

## Problems Solved

- broken YAML and encoding issues in configuration files
- GitHub Pages not being driven correctly by the Actions workflow
- Hugo template scope errors during portfolio rendering
- push conflicts caused by local and remote branch drift

## Result

The final result is a stable, low-friction workflow for updating the site: edit, commit, push, deploy, review.
