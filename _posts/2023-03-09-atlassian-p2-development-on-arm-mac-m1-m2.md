---
layout: post
title: Hints for Atlassian Server/Data Center development on ARM based Macs – M1/M2
date: 2023-03-09 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- apple
- macos
- arm
- m1
- m2
- atlassian
- atlassian-sdk
- confluence
- note to self
author: David Simpson

---

I saw this in a Slack channel, so wanted to preserve it before it vanishes forever.

## Question

> After switching to a M1 Mac, sometimes my atlas-debug doesnt get synchrony running and the Quick-Reload plugin is disabled, did anybody already seen this issue?

## Answers

- Make sure you are using the latest quickreload version (4.x)
- Synchrony is only supported on ARM from Confluence 7.18 onward: [CONFSERVER-78580](https://jira.atlassian.com/browse/CONFSERVER-78580)

---

Remember, if you're using a free plan for Slack, your knowledge is never safe unless you save it elsewhere. It's like Snapchat for business.

<img src="/wp-content/uploads/2023/where-knowledge-goes-to-die.png" alt="Slack where information goes to die">
