# qfls

QFLS (quite amateurishly, "Query-Full Link Shortener") is a link shortener used to prune long URLs full of annoying (to many) queries, especially those found on Facebook (like `facebook.com/posts/12341234?fb_click_id=xxxx`). 

Facebook puts an awful lot of queries in its links. From notifications to outgoing URLs, they are everywhere. The outgoing ones are especially atrocious because of their `l.facebook.com/l.php?u=http://...` form. So, here is a little attempt to trim the extra queries and keep only the group names and post IDs.

This way, `facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx` becomes just `facebook.com/groups/myGroup/`.

### How This Works

First, copy and paste the code in your browser terminal. You might want to go through the code before doing it, since pasting unknown stuff in a broswer console is highly dangerous.

Now, there are two ways to do this:

1. Right-click on a link from the dropdown notificatons box. Make sure to click on an HTML `<a>` tag, otherwise it will not work. Even clicking on a descendent of an `<a>` tag does not work. A trick to successfully target an `<a>` tag is to click on either of the white (bluish for unread) margin spaces on both the left and the right sides of a notification.

2. Middle-click on an `<a>` tag and the shortened link opens in a new tab.

What actually happens is, when you middle- or right-click on an `<a>` tag, the target's URL is trimmed and then written to the tag's `href` attribute. So, after if you have clicked once, the link is already changed. Until the page is reloaded, all the clicked links will stay short.

### Upside

Easy and quick. If Facebook link structures are changed, just modify the `args` variable in the JS file. Or add more as new link formats that have been missed before are found.

### Downside

The content of a page is modified, although temporarily (until reload). This should be resolved.
