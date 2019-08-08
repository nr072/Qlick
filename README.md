# qfls

QFLS (quite amateurishly, "Query-Full Link Shortener") is a link shortener used to prune long URLs full of annoying (to many) queries, especially those found on Facebook (like `facebook.com/posts/12341234?fb_click_id=xxxx`). 

Facebook puts an awful lot of queries in its links. From notifications to outgoing URLs, they are everywhere. The outgoing ones are especially atrocious because of their `l.facebook.com/l.php?u=http://...` form. So, here is a little attempt to trim the extra queries and keep only the group names and post IDs.

This way, `facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx` becomes just `facebook.com/groups/myGroup/`.

### How This Works

First, copy and paste the code in your browser terminal. You might want to go through the code, since pasting unknown stuff in a broswer console is highly dangerous.

Then, right-click on a link from the dropdown notificatons box. You actually do not even need to click the "copy link location" option from the contextmenu. But make sure to click on an HTML `<a>` tag, otherwise nothing happens. A trick to successfully target an `<a>` tag is to click on either of the white margin spaces on both the left and the right sides of a notification.

If you right-click on the tag successfully, you will have a nice and slim version of the long query-riddled URL automatically copied on your clipboard, without even having to actually copy anything yourself! Now, just paste and go.
