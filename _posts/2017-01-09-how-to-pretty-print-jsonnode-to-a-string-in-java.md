---
layout: post
title: How to pretty print a JsonNode to a String in Java
date: 2017-01-09 16:10:05.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- java
- json
- note to self
author: David Simpson

---

Filed under *note to self* as I keep forgetting this. Here's a very simple way to pretty print a `com.fasterxml.jackson.databind.JsonNode`:

{% highlight java %} 
    public String prettyPrintJsonString(JsonNode jsonNode) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Object json = mapper.readValue(jsonNode.toString(), Object.class);
            return mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json);
        } catch (Exception e) {
            return "Sorry, pretty print didn't work";
        }
    }
{% endhighlight %}

The `prettyPrintJsonString(...)` method above would print out `example` JsonNode here...

{% highlight java %} 
    JsonNode example = Json.newObject().put("name", "Example").set("obj", Json.newObject());
{% endhighlight %}

...as this:

{% highlight  %} 
    {
        "name": "Example",
        "obj": {}
    }  
{% endhighlight %}

This a simple trick, but I forget things.
