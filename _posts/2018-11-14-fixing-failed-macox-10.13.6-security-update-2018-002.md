---
layout: post
title: Fixing a failed macOS 10.13.6 Security Update 2018-002
date: 2018-11-14 10:10:00.000000000 +00:00
type: post
published: true
status: publish
categories: []
tags:
- apple
- macos
- os x
- software update
- terminal
author: David Simpson

---

On updating my macOS 10.13.6, I just got a black screen with the mouse visible. No amount of restarting and retrying would fix it.

Spotlight wasn't working properly either, so more Googling suggested [this post in the Apple forums](https://discussions.apple.com/thread/8609245?answerId=34119281022#34119281022) 

Unfortunately it doesn't discuss what each part of the fix actually does, so I've commented the code in each step below.

Pull up a terminal and run the following commands...

## 1. Delete the current user's caches

Run this:
```
rm -rf ~/Library/Caches/*
```

- [Is it safe to delete library caches](https://apple.stackexchange.com/questions/118941/is-it-safe-to-delete-library-caches)

## 2.  Tell launch services to kill the old database and create a new one from scratch

Run this:
```
sudo /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -seed -lint -r -f -v -dump -domain local -domain system -domain user -domain network
```

Here's what each parameter does:
```
-kill             Reset the Launch Services database before doing anything else
-seed             If database isn't seeded, scan default locations for applications and libraries to register
-lint             Print information about plist errors while registering bundles
-r                Recursive directory scan, do not recurse into packages or invisible directories
-f                force-update registration even if mod date is unchanged
-v                Display progress information
-dump             Display full database contents after registration
-domain local      Clear out the database in the local domain
-domain system     Clear out the database in the system domain    
-domain user       Clear out the database in each user's domain    
-domain network    Clear out the database in the network domain 
```

## 3. Restart the Dock

Run this:
```
killall Dock
```

## 4. Reindex Spotlight

Run this:
```
sudo mdutil -E /
```

## 5. Reboot

## 6. Run software update

Run this:
```
sudo softwareupdate -i -a --verbose
```

## 6.  Reboot when prompted

The Mac will now appear to completely reinstall macOS, but really, t's just jumping through a few extra hoops. It took about 10-15 minutes on my late 2013 model MacBook Pro, but the update has now been applied.


