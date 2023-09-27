---
layout: post
title: What is the Atlassian Connect licensing lifecycle?
date: 2023-09-27 12:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- atlassian
- confluence
- atlassian-connect
- note to self
author: David Simpson

---

*I'm writing this down here as I often question my knowledge of what is correct and I'd like to find this information 
in a single article. 
If you wish to comment to correct this, please do so and I'll update the post with the corrected information. 
This article was previously also posted 
[here](https://community.developer.atlassian.com/t/what-is-the-atlassian-connect-licensing-lifecycle/57067).*


In Atlassian Marketplace reports you can see various license statuses:

**Active**

* License is commercial
* License is evaluation
* License is developer (aka private listings)

**Expired**
* License has not been renewed

**Cancelled**
* License is cancelled before the renewal date
  * Can only find cancelled **commercial** licenses for this month, suggesting that the status changes to **expired** after a month
  * Cancelled **evaluation** licenses linger in this state

In a previous post I described [how to get the license status of an Atlassian Connect app](/2023/09/27/get-license-status-of-atlassian-connect-app/). 

None of these methods given in that post truly map to the available license statuses as shown in Atlassian Marketplace, so there is confusion as to what **active**, **expired** and **cancelled** means when applied to the logic within an app.

## Licensing request paramaters

I've asked various people in the developer community what their understanding of the license status is, and this is my exec summary of what I've learned:

`lic=active` for:

* **Active** evaluations (which can last for up to 59 days)
  * I believe that sometimes Atlassian will issue longer evaluation and they can also extend these.
* **Expired** evaluations (up to 15 days after the expiration date aka the *suspended state*)
* **Active** commercial licenses
* **Expired** commercial licenses (up to 15 days after the expiration date aka the *suspended state* )
* **Cancelled** commercial licenses up to the expiration date (cancelled licenses are assumed to not move into the *suspended state* - I'm guessing here)
* Any license in any state that has an active quote
  * Active quotes are generally 30 days, but can be extended up to 90 days by Atlassian. 
  * In some rare cases Atlassian will also issue 90 day valid quotes from the beginning.
* Any license in any state which is affected by [MC-1001](https://ecosystem.atlassian.net/browse/MC-1001).

`lic=none` for:

* **Expired** evaluations (over 15 days after the expiration date aka the *suspended state* )
* **Cancelled** commercial licenses after the expiration date (cancelled licenses are assumed to not move into the *suspended state* - I'm guessing here)
* **Cancelled annual licenses** -- Apparently when you cancel an **annual license** it stops working immediately, even when the license end date is not reached (added 2022-11-02).

…provided they are not affected by [MC-1001](https://ecosystem.atlassian.net/browse/MC-1001).

*Again, if you wish to comment to correct this, please do so and I’ll update the post with the corrected information*
