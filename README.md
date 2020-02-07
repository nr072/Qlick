# QLiCK

Qlick (shortened form of "Query-full Link Clipping Kit") is a URL clipper
used to trim long URLs full of annoying (to many) queries,
especially those found on Facebook (like "`facebook.com/posts/12341234?fb_click_id=xxxx`").

Facebook puts an awful lot of queries in its links.
From notifications to outgoing URLs, they are everywhere.
The outgoing ones are especially atrocious because of
their "`l.facebook.com/l.php?u=http://...`" form.
So, here is a little attempt to trim the extra queries
and keep only the group names and post IDs.

This way,
"`facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx`" becomes just "`facebook.com/groups/myGroup/`".

### Why Use It

Sometimes the queries in links annoy people.
But they can be easily left out
if you are just willing to deal with a few inconveniences,
such as losing the exact comment ID from a notification.
(That is one of the plans for the future though.)

### How to Use It

If you want to use the source code directly,
copy and paste the code in your browser console.
You might want to go through the code before doing it,
since pasting unknown stuff in a browser console is highly dangerous.
Or, if you are using the browser bookmarklet (the "`mQ.txt`" file),
just click to activate.

Now, middle-click on any link,
and a shortened version of that link will be opened in a new tab (default browser action).

Once Qlick is activated,
a small box will appear at the bottom left corner.
This is just an indicator.
It will go away once Qlick is deactivated.

#### Using the bookmarklet

Create a new bookmark in your browser,
and copy and paste the content of "`mQ.txt`"
in the "Location" (for Mozilla Firefox)
or the "URL" (for Google Chrome) field.

You are expected to use "Qlick" as the bookmarklet name.

### How It Works

What actually happens behind the scene is,
when you middle-click on a link,
its nearest ancestor HTML `<a>` tag is found,
and its URL is trimmed and then written to the tag's "`href`" attribute instantly.
So, when the browser starts opening the click's target link,
it finds the trimmed down URL instead of the original long one and opens _that_.
Half a second after the click,
the original URL (stored beforehand) is again written to the target.
So, the content of the page, technically, stays the same.
To the human eye, it appears as if
just a trimmed down version of the URL has been opened in a new tab.

### Upside

- If you want just the link to a group or a user,
but no additional parameter to indicate something more specific
– for example, a comment ID –
Qlick is a very helpful, fast, and easy way to get it.
Just turn it on and (middle-)click.

- Adding or modifying delimiters is pretty easy.
Just modify or add values for proper sites
to "`delimiter`" in the "`qlick`" JS object.

### Downside

- The delimiters for Qlick need to be updated manually
(by the developer, or yourself if you want)
if Facebook code structure changes.
There is no automatic way for it.

- A clipped link is not necessarily better.
In case of Facebook, on the contrary, it is often _pretty_ bad.
For example, if you clip a link from a notification of a comment,
you will get the link of the parent post,
not the comment (nicely highlighted and scrolled to).
If there are a few hundred comments in that post,
it will be tough luck finding what you got the notification for.

- The middle button is occupied.
You can not use the button to open a link normally if Qlick is turned on.
Although it can be toggled at will, this is a liability.
Also, toggling Qlick takes time,
even if it is just one click somewhere on the bookmark bar.
If you want to open both clipped and unclipped links fast using middle-click,
you will find it quite difficult,
and probably miss some links.

- There is a fallback, default delimiter which discards everything after the first `?`.
Unless already covered,
new structures like `facebook.com/php?SOME_PARAM=xxxx` will be reduced to just `facebook.com/php`,
which is not desired.

### Credit

- [JSMin](https://www.crockford.com/jsmin.html)
by Douglas Crockford has been used to minify the code while creating the provided bookmarklet.

- And
[JSLint](https://jslint.com/)
by same has been used as well.

### License

[AGPL-3.0](https://www.gnu.org/licenses/#AGPL)

### Miscellaneous

#### Is "URL clipper" a term?

Maybe.
Not to the developer's knowledge.
The term "link shortener" would have felt more natural here,
but these days it has this pretty-established preconception:
of using a _separate_ short link that _redirects_ to the original link.
Qlick just trims a link down and opens that
– there is no redirecting.

So, "clipper" was used instead.

#### Is "query-full" a valid English word?

Most likely not.
It was made up
because it sounded both shorter and simpler than the other considered alternatives.

#### Why the "kit" in Qlick?

A few more types of clipping features are planned.
"Qlick" is actually the name of the entire, say, "pack".

#### How to make a bookmarklet?

Qlick is already provided in bookmarklet form (the "`mQ.txt`" file).

If you still want to make it yourself:

1. Create a new bookmark in your browser.

2. Take the content of "`Qlick.js`" and remove all the comments.
Even better if you could
[minify](##)
the code.

3. Put this code in the "Location" (for Mozilla Firefox) or the "URL" (for Google Chrome) field,
between "`javascript:(function(){`" and "`})()`".

4. That is basically it.
You are expected to use "Qlick" as the name of bookmarklet.
