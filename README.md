# Qlick

Qlick (shortened form of "Query-full Link Clipping Kit") is a URL clipper used to trim long URLs full of annoying (to many) queries, especially those found on Facebook (like `facebook.com/posts/12341234?fb_click_id=xxxx`).

Facebook puts an awful lot of queries in its links. From notifications to outgoing URLs, they are everywhere. The outgoing ones are especially atrocious because of their `l.facebook.com/l.php?u=http://...` form. So, here is a little attempt to trim the extra queries and keep only the group names and post IDs.

This way, `facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx` becomes just `facebook.com/groups/myGroup/`.

### How It Works

First, copy and paste the code in your browser console. You might want to go through the code before doing it, since pasting unknown stuff in a browser console is highly dangerous.

Middle-click on any link, and a very shortened version of that link will be opened in a new tab (default browser action).

What actually happens is, when you middle-click on a link, its nearest ancestor HTML `<a>` tag is found, and its URL is trimmed and then written to the tag's `href` attribute instantly. So, when the browser starts opening the click's target link, it finds the trimmed down URL instead of the original long one and opens _that_. Half a second after the click, the original URL (stored beforehand) is again written to the target. So, the content of the page stays the same. To the human eye, it appears as if just a trimmed down version of the URL has been opened in a new tab – nothing else has happened.

Once the code is pasted in the browser console, a small box will appear at the bottom left corner. This is just an indicator that the clipping has been turned on. If you paste the code in the console once again, clipping will be turned off, and the box will disappear. This portion of the code has future plans to becoming a browser extension.

### Upside

Easy and quick. If Facebook link structures are changed, just modify the `args` variable in the JS file. Or add more delimiters as new link formats are noticed.

### Downside

The content of a page is modified, although temporarily (until reload). This should be resolved.

### Miscellaneous

#### Is "URL clipper" a term?

Not as far as I know. The term "link shortener" would have felt more natural here, but these days it has this pretty-established preconception of using a _separate_ short link that _redirects_ to the original link. But Qlick just trims a link down and opens that, there is no redirecting. So, used "clipper" instead.

#### Is "query-full" a valid English word?

No idea. I made that up. "Query-riddled" seemed a bit too long and dramatic.

Maybe something better in the future – keeping the "query" part unchanged, obviously. But this will do for now.

#### Why the "kit" in Qlick?

A few more types of clipping facilities are planned. "Qlick" is actually the name of the entire... pack?