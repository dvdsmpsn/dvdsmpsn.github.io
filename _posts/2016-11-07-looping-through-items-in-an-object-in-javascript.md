---
layout: post
title: Looping  through items in an object in JavaScript
date: 2016-11-07 11:10:05.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- javascript
- note to self
author: David Simpson

---

Looping through arrays is easy:

{% highlight javascript %}
var images = [
  {
    src: '/zero.png',
    title: 'Zero'
  },
  {
    src: '/one.png',
    title: 'One'
  },
  {
    src: '/two.png',
    title: 'Two'
  }
];

images.forEach(function(element, index, array) {
  console.log(index, element);
});
{% endhighlight %}

But what if you have an object like this which really looks like it should have been an array?

{% highlight javascript %}
var images = {
  '0': {
    src: '/zero.png',
    title: 'Zero'
  },
  '1': {
    src: '/one.png',
    title: 'One'
  },
  '2': {
    src: '/two.png',
    title: 'Two'
  }
};
{% endhighlight %}

Easy too, just different:

{% highlight javascript %}
for (var key in images) {
  if (images.hasOwnProperty(key) === false) continue; // skip loop if the property is from prototype
  console.log(key, images[key]);
}
{% endhighlight %}
