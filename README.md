# qfls

QFLS (quite amateurishly, "Query-Full Link Shortener") is a link shortener used to prune long URLs full of annoying (to many) queries, especially those found on Facebook (like `facebook.com/posts/12341234?fb_click_id=xxxx`). 

Facebook puts an awful lot of queries in its links. From notifications to outgoing URLs, they are everywhere. The outgoing ones are especially atrocious because of their `l.facebook.com/l.php?u=http://...` form. So, here is a little attempt to trim the extra queries and keep only the group names and post IDs.

This way, `facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx` becomes just `facebook.com/groups/myGroup/`.

### How This Works

First, copy and paste the code in your browser terminal. You might want to go through the code before doing it, since pasting unknown stuff in a browser console is highly dangerous.

Middle-click on an HTML `<a>` tag and the shortened link opens in a new tab. Make sure to click directly on an `<a>` tag. Otherwise, it will not work – not even clicking on a descendant of an `<a>` tag. A trick to successfully target an `<a>` tag is to click on either of the white (bluish for unread) margin spaces on both the left and the right sides of a notification.

What actually happens is, when you middle-click on an `<a>` tag, the target's URL is trimmed and then written to the tag's `href` attribute. And then it opens in a new tab. But the original (long) URL is saved in JS, and half a second after the click, the original URL is again written to the target. So, it appears as if just a trimmed down version of the URL has been opened in a new tab, nothing more.

### Upside

Easy and quick. If Facebook link structures are changed, just modify the `args` variable in the JS file. Or add more as new link formats that have been missed before are found.

### Downside

The content of a page is modified, although temporarily (until reload). This should be resolved.
