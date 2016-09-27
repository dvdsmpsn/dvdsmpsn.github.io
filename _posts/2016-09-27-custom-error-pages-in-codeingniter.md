---
layout: post
title: Custom error pages in CodeIgniter
date: 2016-09-27 10:10:05.000000000 +01:00
type: post
published: true
status: publish
categories: []
tags:
- codeigniter
- note to self
author: David Simpson

---

The simplest way to create custom error pages is to edit the files at `/application/views/errors/html/error_*.php` such as `error_404.php` (for 404s), `error_db.php` (for database errors) and `error_general.php` (for most other errors). 

As these pages are within your `application` directory, you are free to customise them to your needs.

If your normal view template looks something like this:


    <?php $this->load->view('includes/header'); ?>
    ...
    ...
    <?php $this->load->view('includes/footer'); ?>

You can adapt this in your `/application/views/errors/html/error_*.php` files like so:


    <?php
      $page_title = $heading;
      include VIEWPATH.'includes'.DIRECTORY_SEPARATOR.'header.php';
    ?>
	<div class="well">
	  <h1><?php echo $heading; ?></h1>
	  <?php echo $message; ?>
	</div>
    <?php include VIEWPATH.'includes'.DIRECTORY_SEPARATOR.'footer.php'; ?>

Notice that we're no longer using views, but instead including the view files for the `header` & `footer`.

Another thing to note:

In the `header` view, I'm passing a `$data` object which includes `$data['page_title']`. As the error pages don't use views, you have to add any variables that you'd normally pass into the view, hence the presence of `$page_title`.
