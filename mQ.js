// Qlick: URL query clipper
// 2020-02-07
// Copyright (C) <2019>  Nafiur Rahman

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published
// by the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.



// Qlick (shortened form of "Query-full Link Clipping Kit") is a URL clipper
// used to trim long URLs full of annoying (to many) queries,
// especially those found on Facebook (like `facebook.com/posts/12341234?fb_click_id=xxxx`).

// Facebook puts an awful lot of queries in its links. From notifications
// to outgoing URLs, they are everywhere. The outgoing ones are especially
// atrocious because of their `l.facebook.com/l.php?u=http://...` form.
// So, here is a little attempt to trim the extra queries and keep only the
// group names and post IDs.

// This way, `facebook.com/groups/myGroup/?multi_permalinks=xxxx&click_id=xxxx`
// becomes just `facebook.com/groups/myGroup/`.

// Source: https://github.com/nr072/Qlick

// How to use it
// =============

// If you want to use the source code directly, copy and paste the code in
// your browser console. You might want to go through the code before doing
// it, since pasting unknown stuff in a browser console is highly dangerous.
// Or, if you are using the browser bookmarklet (the `mQ.txt` file), just
// click to activate.

// Now, middle-click on any link, and a shortened version of that link will
// be opened in a new tab (default browser action).

// Once Qlick is activated, a small box will appear at the bottom left
// corner. This is just an indicator. It will go away once Qlick is
// deactivated.

"use strict";

const qlick = {

    // The number of times special characters need to be converted
    conv_count: 1,

    delimiter: {

        // For "www.google.com"
        google: [
            ["url?q=", "&sa="]
        ],

        // For "www.facebook.com"
        facebook: [
            ["multi_permalinks=", "%"],
            ["multi_permalinks=", "&"],
            ["/permalink/",       "/"],
            ["/groups/",          "/"],
            ["/posts/",           "?"],
            ["/media/set/",       "&"],
            ["/photo.php?",       "&"],
            [".php?story_fbid=",  "&notif"],
            ["/login_alerts/",    "&"],
            ["onthisday/message", "&creator"],
            ["pages/?category=",  "&"],
            [".php?id=",          "&"],
            ["stories/",          "?"],
            ["groupslanding/",    "&"],
            [".com/",             "?"]
        ],

        // For "l.facebook.com"
        l_facebook: [
            ["l.php?u=", "?from"],
            ["l.php?u=", "?fbclid"],
            ["l.php?u=", "&fbclid"],
            ["l.php?u=", "?"]
        ],

        // Same as Facebook for now. Needs more research.
        // workplace: this.delimiter.facebook,

        // For "www.youtube.com"
        youtube: [
            ["?q=", "&redir_token"]
        ],

        // For "m.youtube.com"
        m_youtube: [],

        // For "external-content.duckduckgo.com"
        excon_ddg: [
            ["/?u=", "&"]
        ],

        // General
        default: [
            ["", "?fbclid"],
            ["", "?"]
        ]
    },

    // Sites for which it is necessary to exclude the starting delimiter
    // (and everything before that) in the clipped URL.
    // For example, links obtained from a Gmail email usually contains
    // "google.com/url?q=" at the beginning. These, as delimiters, are to
    // be discarded, whereas delimiters like "/groups/" (and the preceding
    // domain name) in links like "facebook.com/groups/xxxxxx?fbclid=..."
    // must not be removed:
    //
    //   google.com/url?q=https://duckduckgo.com/ -> https://duckduckgo.com/
    //              ------
    //
    //   facebook.com/groups/xxxxxx?fbclid=xxxxxx -> facebook.com/groups/xxxxxx
    //               --------                                    --------
    //
    exclusives: [
        "l.facebook.com",
        "l.workplace.com",
        "www.google.com",
        "www.youtube.com",
        "m.youtube.com",
        "external-content.duckduckgo.com"
    ],

    set_conv_count: function (count) {
        if (2 < count && count < 6) {
            this.conv_count = count;
        }
    },

    get_conv_count: function () {
        return this.conv_count;
    },

    get_delimiters: function (dom) {
        let p;
        let is_exclusive;
        let is_listed = true;

        switch (dom) {
            case "www.google.com":
                p = "google";
                is_exclusive = true;
                break;
            case "www.facebook.com":
                p = "facebook";
                break;
            case "l.facebook.com":
                p = "l_facebook";
                is_exclusive = true;
                break;
            case "www.workplace.com":
                p = "workplace";
                break;
            case "www.youtube.com":
                p = "youtube";
                is_exclusive = true;
                break;
            case "m.youtube.com":
                p = "m_youtube";
                break;
            case "external-content.duckduckgo.com":
                p = "excon_ddg";
                is_exclusive = true;
                break;
            default:
                p = "default";
                is_listed = false;
        }

        return [this.delimiter[p], is_exclusive, is_listed];
    }
};

// Keep track if link clipping is turned on or off.
let is_Qlick_on;

// If turned off, create a sign to show it, after turning on.
// Otherwise, remove existing sign.
(function () {
    const sign = document.getElementById("qlick_sign");
    if (sign) {
        document.body.removeChild(sign);
        is_Qlick_on = false;
    } else {
        document.body.appendChild(
            create_sign({
                id: "qlick_sign",
                text: "Qlick"
            })
        );
        is_Qlick_on = true;
    }
})();

// Clip target <a> tag"s link if directly middle-clicked when turned on.
document.onmousedown = function(e) {

    if (is_Qlick_on && e.which === 2) {

        let target;

        // Detect if click target is an eligible (has `href` attribute) HTML
        // <a> tag, and set it as target.
        // Otherwise, set nearest eligible ancestor <a> tag as target.
        if (e.target.tagName === "A" && e.target.href) {
            target = e.target;
        } else {
            let ancestor = e.target.closest("a[href]");
            if (ancestor.href) {
                target = ancestor;
            }
        }

        // Put clipped link in target"s `href`, and replace with old link
        // again after delay.
        if (target) {

            // Store original URL to put back in target later.
            const old_url = target.href;

            // Put clipped link in target, to open it as a result of the
            // middle-click.
            target.href = clip(old_url);

            // Restore original link after delay (presumably, after target
            // has been clicked).
            setTimeout(function() {
                target.href = old_url;
            }, 500);

        }

    }

};



// Show a sign at lower left, saying "Qlick", indicating Qlick is turned
// on.
function create_sign(conf) {
    let sign = document.createElement("div");
    sign.id                 = conf.id;
    sign.innerText          = conf.text;
    sign.style.position     = "fixed";
    sign.style.bottom       = "15px";
    sign.style.left         = "15px";
    sign.style.color        = "#666";
    sign.style.border       = "1px solid #aaa";
    sign.style.borderRadius = "5px";
    sign.style.padding      = "3px 7px";
    sign.style.zIndex       = 9999;
    return sign;
}



// In case of "www.google.com/url?q=https%3A%2F%2Fduckduckgo.com%2F&sa=...",
// "www.google.com" is the wrapper domain.
// Since currently the pattern "something.something.something" is being
// used, no wrap will be detected for links like "google.com/...". (Two
// dots are necessary.)
function get_wrapper(url) {
    const wraps = url.match(/[a-z\-]+\.[a-z]+\.[a-z]+/g);
    return (wraps ? wraps[0] : "");
}



// Clip link based on delimiter sets for detected wrapper domain. Try each
// set until one applies.
function clip(url) {

    // Replace twice by default, because of characters like:
    //   "%2540" -> "%40" -> "@"
    // (Seen in Bitbucket invitation link.)
    url = replace_sp_chars(url, 2);

    const wrap = get_wrapper(url);
    if (!wrap) {
        return url;
    }

    const old_length = url.length;
    let d_list;
    let is_listed;
    let is_exclusive;

    [d_list, is_exclusive, is_listed] = qlick.get_delimiters(wrap);

    // If not a listed domain, clip using default delimiter sets.
    if (!is_listed) {
        for (let c = 0; c < d_list.length; c += 1) {
            const d_set = d_list[c];

            if (url.split(d_set[1]).length > 1) {
                url = url.split(d_set[1])[0];
                if (url.length < old_length) {
                    return url.trim();
                }
            }
        }
    }

    // Loop until link is successfully clipped using suitable set of
    // delimiters.
    // Split URL using each delimiter set, and construct clipped URL by
    // taking up the content between the two delimiters, including them.
    // If link length decreases, link was clipped successfully. If not,
    // apply next set.
    for (let c = 0; c < d_list.length; c += 1) {
        const d_set = d_list[c];

        const has_start_delim = url.split(d_set[0]).length > 1;
        const has_end_delim = url.split(d_set[1]).length > 1;

        if (has_start_delim && has_end_delim) {
            const upto_start_del = (
                is_exclusive
                ? ""
                : url.split(d_set[0])[0] + d_set[0]
            );

            url = upto_start_del + url.split(d_set[0])[1].split(d_set[1])[0];

            if (url.length < old_length) {
                break;
            }
        }
    }

    return url;
}



function replace_sp_chars(url, iter) {
    iter = parseInt(iter);
    if (!iter) {
        iter = 1;
    }

    let c = 0;
    while (c < iter) {
        url = url
            .replace(/%20/g," ")
            .replace(/%21/g,"!")
            .replace(/%22/g,"\"")
            .replace(/%23/g,"#")
            // .replace(/%24/g,"$")
            .replace(/%25/g,"%")
            .replace(/%26/g,"&")
            .replace(/%27/g,"'")
            // .replace(/%28/g,"(")
            // .replace(/%29/g,")")
            // .replace(/%2B/g,"+")
            .replace(/%2C/g,",")
            .replace(/%2D/g,"-")
            // .replace(/%2E/g,".")
            // .replace(/%2F/g,"/")
            .replace(/%3A/g,":")
            .replace(/%3B/g,";")
            .replace(/%3C/g,"<")
            .replace(/%3D/g,"=")
            .replace(/%3E/g,">")
            // .replace(/%3F/g,"?")
            .replace(/%40/g,"@")
            .replace(/%60/g,"`")
            // .replace(/%7B/g,"{")
            // .replace(/%7C/g,"|")
            // .replace(/%7D/g,"}")
            .replace(/%7E/g,"~");
        c += 1;
    }

    return url;
}
