---
title: "Demo Blog Post"
date: 2015-04-10
draft: true
template: post.hbt

intro: This is a demo blog post. Bro ipsum dolor sit amet afterbang death cookies 180 gorby. Mute yard sale hot dogging, crunchy nose stomp heli north shore ACL daffy epic chillax bro dirtbag.
---

This is a **demo** blog post that tests various *different* styles.

## Paragraphs

Bro ipsum dolor sit amet afterbang death cookies 180 gorby. Mute yard sale hot dogging, crunchy nose stomp heli north shore ACL daffy epic chillax bro dirtbag. Pillow popping yard sale backside, bowl death cookies ollie pow spin. Yard sale rip Snowboard park pillow popping free ride mute. Huck park piste, glades backside gondy hellflip epic bomb ski bum death cookies BB. Bike free ride carbon, euro yard sale drop beater ski bum ride rip sucker hole taco glove ride around. Air Snowboard titanium BB frozen chicken heads stoked bump T-bar line grip tape laps sketching misty gnar method.

> Giblets cork skid first tracks. Face shots manny gnar, gondy hardtail gaper cork whip death cookies huck hero huckfest epic pipe gapers. Grunt booter stoked reverse camber. Stoked lid 180 line bail. Stoked japan air over the bars first tracks flow.

Road rash flow clipless, frontside free ride gapers smear heli deck. Bonk park titanium giblets face shots granny gear, first tracks air taco glove white room euro. Park rat hardtail first tracks tele. Ride around bro corn berm first tracks yard sale road rash bowl moguls liftie snake bite air rock roll.

Thanks to [Bro Ipsum](http://www.broipsum.com/) for generating this content.

## Code Blocks

This is a `inline code` block.

	var frontMatter = require('gulp-front-matter');

	gulp.task('blog-posts', function() {
	  gulp.src('./posts/*.md')
	    .pipe(frontMatter({ // optional configuration
	      property: 'frontMatter', // property added to file object
	      remove: true // should we remove front-matter header?
	    }))
	    .pipe(…) // you may want to take a look at gulp-marked at this point
	});

## Lists

### Ordered Lists

1. Item 1
1. Item 2
1. Item 3

### Unordered Lists

* Item 1
* Item 2
* Item 3
