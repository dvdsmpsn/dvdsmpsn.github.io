---
layout: post
title: How to reverse the order of comments on Confluence pages
date: 2012-01-24 14:15:56.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- atlassian
- confluence
- javascript
- jQuery
meta:
  tmac_last_id: '618797364006883328'
  _edit_last: '1'
  _syntaxhighlighter_encoded: '1'
author: David Simpson
excerpt_separator: <!--more-->
---

From a recent comment on [Atlassian Answers](https://answers.atlassian.com/), Norman Hills asked "[Is it possible to reverse the order in which comments appear?](https://answers.atlassian.com/questions/28999/is-it-possible-to-reverse-the-order-in-which-comments-appear)"

This is straightforward if done client-side, so I've written it up here.
<!--more-->

If you just want to reverse the order for good, browse to <b>Confluence Admin | Look & Feel | Custom HTML</b>

Add this to **At the end of the HEAD**:

    &lt;script&gt;
      AJS.toInit(function($){
        $comments = $('#page-comments');
        $comments.children().each(function(i,li){$comments.prepend(li)});
      });
    &lt;/script&gt;

Job done.

## For extra points

If you want to be able to reverse the order, then it's slightly more effort.

Browse to **Confluence Admin | Look & Feel | Custom HTML**

Add this to **At the end of the HEAD**:


    &lt;script&gt;
      function reverseCommentOrder() {
       $comments = AJS.$('#page-comments');
       $comments.children().each(function(i,li){$comments.prepend(li)});
      }
     AJS.toInit(function ($) {
       // reverse the comment order
       reverseCommentOrder();
       // add a link to reverse the order
        $('#comments-section-title').append('&lt;a id=&quot;page-comments-reverse&quot; href=&quot;#&quot;&gt;(Reverse Order)&lt;/a&gt;');
        $('#page-comments-reverse')
         .css({ 'color':'#999','font-size':'0.65em'})
         .click(function (e) {
           reverseCommentOrder();
           e.preventDefault();
         });
     });
    &lt;/script&gt;
              
That's all. Have fun.
