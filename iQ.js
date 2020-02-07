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
            ["multi_permalinks=", "&"],
            ["multi_permalinks=", "%"],
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
        workplace: this.facebook,

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



clear_input("clip_in");
clear_input("ch_conv_in");
clear_input("conv_count_in");
clear_options();

// Always focus the clipping input field when focus shifts to current tab.
window.onfocus = function () {
    focus_input("clip_in");
};

(function () {

    // Based on user interaction, toggle special character conversion
    // features, adjust output area height, and focus input field
    // accordingly.
    let ch_conv_op = document.getElementById("ch_conv_op");
    ch_conv_op.addEventListener("input", function (e) {
        const is_ch_conv_on = e.target.checked;
        toggle_ch_conv_input(is_ch_conv_on);
        adjust_out_area_height(!is_ch_conv_on);
        clear_input("conv_count_in");
        setTimeout(function () {
            focus_input(is_ch_conv_on ? "ch_conv_in" : "clip_in");
        }, 1500);
    });

    // When link is pasted in the clipping field, clip and show result.
    let clip_in_field = document.getElementById("clip_in");
    clip_in_field.addEventListener("input", function (e) {
        const input = e.target.value.trim();
        const clipped = clip(input);
        show_link(clipped, input);
        clear_input("clip_in");
    });

    // When link is pasted in the conversion field, convert and show result.
    let conv_in_field = document.getElementById("ch_conv_in");
    conv_in_field.addEventListener("input", function (e) {
        const input = e.target.value.trim();
        const count = qlick.conv_count;
        const converted = replace_sp_chars(input, count);
        show_link(converted, input);
        clear_input("ch_conv_in");
    });

    // Set how many times special character conversion should be done.
    let conv_count_in_field = document.getElementById("conv_count_in");
    conv_count_in_field.addEventListener("input", function (e) {
        qlick.set_conv_count(e.target.value);
    });

})();



function toggle_ch_conv_input(show) {
    const inp_wrap = document.querySelector(".input-wrap:nth-child(2)");
    inp_wrap.style.setProperty("max-height", (show ? "50px" : "0px"));
}



function adjust_out_area_height(incH) {
    const out = document.getElementById("out");
    const h = "var(--height-" + (incH ? "single" : "double") + "-input)";
    out.style.setProperty("height", h);
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
            .replace(/%24/g,"$")
            .replace(/%25/g,"%")
            .replace(/%26/g,"&")
            .replace(/%27/g,"\"")
            .replace(/%28/g,"(")
            .replace(/%29/g,")")
            .replace(/%2B/g,"+")
            .replace(/%2C/g,",")
            .replace(/%2D/g,"-")
            .replace(/%2E/g,".")
            .replace(/%2F/g,"/")
            .replace(/%3A/g,":")
            .replace(/%3B/g,";")
            .replace(/%3C/g,"<")
            .replace(/%3D/g,"=")
            .replace(/%3E/g,">")
            .replace(/%3F/g,"?")
            .replace(/%40/g,"@")
            .replace(/%60/g,"`")
            .replace(/%7B/g,"{")
            .replace(/%7C/g,"|")
            .replace(/%7D/g,"}")
            .replace(/%7E/g,"~");
        c += 1;
    }

    return url;
}



function focus_input(id) {
    document.getElementById(id).focus();
}



function createElement(conf) {
    const el = document.createElement(conf.name);
    if (conf.text) {
        el.innerText = conf.text;
    }
    if (conf.title) {
        el.title = conf.title;
    }
    if (conf.class_list) {
        conf.class_list.forEach(function (class_name) {
            el.classList.add(class_name);
        });
    }
    return el;
}



// Show clipped link as output, with old URL in `title` attribute.
function show_link(url, old_url) {
    const out_area = document.getElementById("out");

    out_area.appendChild(
        createElement({
            name: "code",
            text: url,
            title: "Original URL: \n" + old_url,
            class_list: [ "out", "link" ]
        })
    );

    out_area.scrollTop = out_area.scrollHeight;
}



function clear_input(id) {
    setTimeout(function () {
        document.getElementById(id).value = "";
    }, 1500);
}



function clear_options() {
    const ch_conv_op = document.getElementById("ch_conv_op");
    ch_conv_op.checked = false;
}



function clearOut() {
    document.getElementById("out").innerHTML = "";
}



// ============================================================================
//
// The following are to be used for development and debugging.
//
// ============================================================================

const dev = {

    // Add URLs to this array for testing.
    // A few basic forms are already provided. These have been randomly
    // collected, and then have had their values replaced with dummies.
    sample_inputs: [
        "www.google.com/url?q=https%3A%2F%2Fsecond.top%2F&sa=D&sntz=1&usg=abc123-abc123",
        "l.facebook.com/l.php?u=http%3A%2F%2Fsecond.top%2F%3Ffrom%3Dgroupmessage%26isappinstalled%3D0%26fbclid%3Dabc123_abc123_abc123-abc123-abc123&h=abc123_abc123-abc123_abc123_abc123",
        "thi-rd.second.top/?from=groupmessage&isappinstalled=0&fbclid=abc123_abc123",
        "www.youtube.com/redirect?event=video_description&v=abc123&redir_token=abc123-abc123-abc123-abc123&q=http://second.top/path/to/some-asset",
        "https://third.second.top/path/to/some-asset?fbclid=abc123-abc123-abc123_abc123#.abc123.facebook",
        "https://m.youtube.com/watch?v=abc123&fbclid=abc123-abc123",
        "www.facebook.com/permalink.php?story_fbid=abc123&id=abc123&notif_id=abc123&notif_t=notify_me&ref=notif",
        "www.facebook.com/login_alerts/start/?fbid=abc123&s=j&notif_id=abc123&notif_t=login_alerts_new_device&ref=notif",
        "facebook.com/login_alerts/start/?fbid=abc123&s=j&notif_id=abc123&notif_t=login_alerts_new_device&ref=notif",
        "www.facebook.com/media/set/?set=abc123.abc123&type=abc123&notif_id=abc123&notif_t=notify_me&ref=notif",
        "www.facebook.com/pages/?category=invites&notif_id=abc123&notif_t=page_invite&ref=notif",
        "www.facebook.com/pages/?category=liked&notif_page_id=abc123&notif_id=abc123&notif_t=page_name_change&ref=notif",
        "www.facebook.com/onthisday/message/?cid=abc123&creator_id=abc123&source=message",
        "www.facebook.com/groups/abc123/?multi_permalinks=abc123&notif_id=abc123&notif_t=feedback_reaction_generic&ref=notif",
        "www.facebook.com/photo.php?fbid=abc123&set=abc123.abc123.abc123&type=abc123&notif_id=abc123&notif_t=notify_me&ref=notif",
        "www.facebook.com/photo.php?fbid=abc123&set=abc123.abc123&type=abc123&eid=abc123_abc123_abc123-abc123&ifg=abc123",
        "l.facebook.com/l.php?u=https://www.youtube.com/playlist?list=abc123_abc123-abc123&fbclid=abc123_abc123&h=abc123_abc123-abc123-abc123_abc123",
        "en.wikipedia.org/wiki/Ne_me_quitte_pas?fbclid=abc123_abc123",
        "l.facebook.com/l.php?u=https://www.third.second.top/path/to/some-asset?cx_cid=abc123:abc123:abc123:abc123:abc123:abc123:abc123??&fbclid=abc123_abc123&h=abc123_abc123_abc123",
        "www.facebook.com/groups/abc123/permalink/abc123/",
        "www.facebook.com/profile.php?id=abc123&ref=br_rs",
        "www.facebook.com/stories/abc123/abc123=/?source=notification&notif_id=abc123&notif_t=camera_post_user_tagged&ref=notif",
        "www.facebook.com/profile.php?sk=approve&highlight=abc123&log_filter=review&queue_type=friends&notif_id=abc123&notif_t=mention&ref=notif#abc123",
        "www.facebook.com/groupslanding/?group_id=abc123&notif_id=abc123&notif_t=group_invited_to_group&ref=notif",
        "www.second.top/?gclid=abc123_abc123_abc123-abc123-abc123-abc123_abc123",
        "external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.second.top%2Fpath%2Fto%2Fsome-asset.ext&f=1&nofb=1",
        "m.youtube.com/watch?feature=youtu.be&v=abc123&fbclid=abc123_abc123-abc123",
        "www.youtube.com/redirect?redir_token=abc123&event=video_description&v=abc123-abc123-abc123&q=https%3A%2F%2Fwww.second.top%2Fpath%2Fto%2Fsome%2520asset%2520with%2520space%2520in%2520name.ext",
        "www.youtube.com/redirect?v=abc123&event=video_description&q=https%3A%2F%2Fwww.second.top%2Fpath%2Fto%2Fsome%2520asset%2520with%2520space%2520in%2520name.ext&redir_token=abc123",
        "second.top/path/to/some-asset?utm_source=abc123-abc123?utm_source=abc123&fbclid=abc123",
        "https://www.facebook.com/groups/rxhelpcenter/?notif_id=abc123&notif_t=group_r2j_approved&ref=notif",

        // "www.google.com/url?q=https%3A%2F%2Fid.atlassian.com%2Fsignup%2Finvite%3Fapplication%3Dbitbucket%26continue%3Dhttps%253A%2F%2Fbitbucket.org%2Fsocialauth%2Flogin%2Fatlassianid%2F%3Fchosen_aid%253Dnafiur.rahman.072%252540gmail.com%2526next%253Dhttps%25253A%25252F%25252Fbitbucket.org%25252Finvitations%25252Frepository%25252FJGra47HDYMyHSIsbxTgGz0ZGYsOO4hHT%26signature%3DeyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhY2NvdW50IiwiaWF0IjoxNTc0MzMzNDc0LCJleHAiOjE1NzQ5MzgyNzQsInNjb3BlIjoiaW52aXRlIiwic3ViIjoibmFmaXVyLnJhaG1hbi4wNzJAZ21haWwuY29tIn0.0Tkaj1DPQngAd6TBl_rx26R0DlO48-dRbNzUw9v68I0%26infoCode%3DinvitedUser%26source%3Da1ece0d337deaac61592478f9b0ab9a7&sa=D&sntz=1&usg=AFQjCNEFOg4Nq77Dd-em2tt64BO7nZz2og",
        // "www.google.com/url?q=http%3A%2F%2Ftwb.translationcenter.org%2Fworkspace%2Fjob-postings%2Fview%2Fid%2F1524743%2Finvite%2F9a34ec0c9521a926c3ea16ddb59763ae&sa=D&sntz=1&usg=AFQjCNG1_61v93ENMOlDv56iKiuwslufSg",
        // "l.facebook.com/l.php?u=http%3A%2F%2Fsh-meet.bigpixel.cn%2F%3Ffrom%3Dgroupmessage%26isappinstalled%3D0%26fbclid%3DIwAR2kGz55Pl_B0ZuKoF4Qp1HcJ_MoLns-04ZYuKMPRoISK-XJzbAnyQRVpG0&h=AT1ynD8hZk4QAHjr7uTxFQkL1QCnBrEP2_yqWDWpyi1J1zsMgGS5udaIHZoEl3b-KZUUk23SPW6IxVW76fDQrV05eKCLELNs4_QF7V5rjA7nqI3Ws89c4_ZhOtir",
        // "sh-meet.bigpixel.cn/?from=groupmessage&isappinstalled=0&fbclid=IwAR3Ip_qP13XxvJP82VraWk8LdTLiczlAHhBZSWCFUz3Evo177JQaytOsqv0",
        // "www.youtube.com/redirect?event=video_description&v=reftYMyjoI8&redir_token=avMIN-nWcgm65YwcIot1W-n9r-98MTU1NDIyODUyMUAxNTU0MTQyMTIx&q=http://blogs.agu.org/geospace/2016/05/24/watch-underwater-canyons-take-shape-real-time",
        // "https://www.mentalfloss.com/article/616293/geoffrey-chaucer-canterbury-tales-app?fbclid=IwAR3IkdD9Zz3jpO50fWGGNIPg29f6-Jib-IH1pzrUdKZZjfi_sXuVQ4T1v8E#.XjpQK5Yut84.facebook",
        // "https://m.youtube.com/watch?v=5RIYGhIH9rU&fbclid=IwAR0FCIMBf2MOGnLjsISpPQeOsXYPc-GJQv2s7WTxERjITyWmnI9GdXmOn3E",
        // "https://www.facebook.com/groups/rxhelpcenter/?notif_id=1581058955848896&notif_t=group_r2j_approved&ref=notif",
        // "www.facebook.com/permalink.php?story_fbid=1197604823759643&id=100005304103501&notif_id=1566055811509351&notif_t=notify_me&ref=notif",
        // "www.facebook.com/login_alerts/start/?fbid=2391592507778029&s=j&notif_id=1566056371987130&notif_t=login_alerts_new_device&ref=notif",
        // "facebook.com/login_alerts/start/?fbid=2545609215709690&s=j&notif_id=1580705636295528&notif_t=login_alerts_new_device&ref=notif",
        // "www.facebook.com/media/set/?set=a.2007998039474646&type=3&notif_id=1566057633261600&notif_t=notify_me&ref=notif",
        // "www.facebook.com/pages/?category=invites&notif_id=1567025495221942&notif_t=page_invite&ref=notif",
        // "www.facebook.com/pages/?category=invites&notif_id=1575955186681152&notif_t=page_invite&ref=notif",
        // "facebook.com/pages/?category=liked&notif_page_id=439090602926011&notif_id=1580676983403069&notif_t=page_name_change&ref=notif",
        // "www.facebook.com/onthisday/message/?cid=2155712897828620&creator_id=100001697913410&source=message",
        // "www.facebook.com/groups/180140278855159/?multi_permalinks=1209684289234081&notif_id=1572521448498279&notif_t=feedback_reaction_generic&ref=notif",
        // "www.facebook.com/photo.php?fbid=3071457369561584&set=np.1566919826912913.100007819085561&type=3&notif_id=1566919826912913&notif_t=notify_me&ref=notif",
        // "www.facebook.com/photo.php?fbid=10214724155043151&set=np.1566916654453376.100007819085561&type=3&notif_id=1566916654453376&notif_t=notify_me&ref=notif",
        // "www.facebook.com/photo.php?fbid=2622258741140360&set=np.1566916641017490.100007819085561&type=3&notif_id=1566916641017490&notif_t=notify_me&ref=notif",
        // "www.facebook.com/photo.php?fbid=2352002981503410&set=gm.10157456621849666&type=3&eid=ARBG4srzvgt6jtNvRGMNmnkbchNzeO4eN0gb_iCMy2FdmSBUDnkkxfC_bpbpJmfaia6Y0ZsMLAhn-ocv&ifg=1",
        // "www.facebook.com/media/set/?set=a.1200144173351542&type=3&notif_id=1566916964700926&notif_t=notify_me&ref=notif",
        // "www.facebook.com/media/set/?set=a.1171433829544895&type=3&notif_id=1566914191412693&notif_t=notify_me&ref=notif",
        // "www.facebook.com/media/set/?set=a.882066138539575&type=3&notif_id=1566913611024094&notif_t=notify_me&ref=notif",
        // "www.facebook.com/permalink.php?story_fbid=932389873777627&id=100010198691104&notif_id=1566911010912628&notif_t=notify_me&ref=notif",
        // "www.facebook.com/permalink.php?story_fbid=932383287111619&id=100010198691104&notif_id=1566910238131666&notif_t=notify_me&ref=notif",
        // "www.facebook.com/permalink.php?story_fbid=1204492166404242&id=100005304103501&notif_id=1566907187511065&notif_t=notify_me&ref=notif",
        // "l.facebook.com/l.php?u=https://www.youtube.com/playlist?list=PLH0c9bU3dUW0nXvv_zNqN7NqMm21lQZ-r&fbclid=IwAR1SP5pm9WUAMtuy5hbvkQagbdAzxUenJhYIt7A9IVO9o_k2OBOo1nOiqvw&h=AT3r3qDCEi9pjXtbKXJPpjA0_umlk856pH-wCvu0K1rQAhCZ9r2g5QJv6T8HXQUYHNRAgqcXCGTbNYAqwRrauTdzaXrGictf8xAhymxDk-lJYQ6a_qHQ7QdIR5qDOi266drDJgtE",
        // "l.facebook.com/l.php?u=https://en.wikipedia.org/wiki/Ne_me_quitte_pas?fbclid=IwAR1xUwsd5wvlTI8tgyMwcPLKE8dOLJPMlh2IbKKISPDreEd2A76QMnfwidU&h=AT0ynmlVBLcuvKzTI8sQbiWmk59pXftT9tJY272XXKskSXAk7ugtDv9dX3W63mpcZiCpsjFfGN2bhLYByPLzpeHUxG5uRNGLOOTzljCaJsNEUGvLXmb_xQBNOJDBVOp0w0O7VoV4",
        // "en.wikipedia.org/wiki/Ne_me_quitte_pas?fbclid=IwAR2IbfUK3W9cfddxqcZgUf02SyHd1sb3DQWa1XjsJCPiGdHCt08_r9Rvefw",
        // "www.youtube.com/playlist?list=PLH0c9bU3dUW0nXvv_zNqN7NqMm21lQZ-r&fbclid=IwAR1SP5pm9WUAMtuy5hbvkQagbdAzxUenJhYIt7A9IVO9o_k2OBOo1nOiqvw",
        // "l.facebook.com/l.php?u=https://english.stackexchange.com/questions/295581/why-is-saturday-day-of-saturn?fbclid=IwAR25dx52NgiCm-nxMBTIFbiHyNx5U5xKKRrXH1-W6shZg_gCFyNMYNiotSg&h=AT1tPhK2laQwLi-Mwfe-vc1SbaZyi0slU9W-RijgUDuNq3W4xEv1y-rPBjxLcqMtu_RbFvPUeEDzEHa42ymh7wJbUz9MjaxSxr7nG-rgCH46DpWw26SX2B3VaYS2RypuQmySefFSjQg38An9HtljF3M",
        // "l.facebook.com/l.php?u=https://www.sbs.com.au/language/english/meet-bella-a-seven-year-old-from-russia-who-speaks-eight-languages?cx_cid=alc:soc:fb:en:nlc19:editorial:na??&fbclid=IwAR2eoZCjwkuSdeR3fyJFuzNGowq94wghrz5hSeYujM2r5v_yfreeJCfUp9U&h=AT0zyY08Yc3Wwi0qree64x4uyon0RpeMI6tsF6h70rWq3GxlNjBCFskar8CEGuaQU43CEl1XaZBGYHobnn9m9m3hDrmsEOr6j3wcfMynOcdHaH3Gp_JWq_8dvQY5tuRczn4wwla6EuraQWXjqJi8JBbwYg",
        // "www.facebook.com/groups/300432120041516/permalink/2573344212750284/",
        // "www.facebook.com/profile.php?id=100000707617541&ref=br_rs",
        // "www.facebook.com/profile.php?id=101361116869880&ref=br_rs",
        // "www.facebook.com/stories/2064393983814349/UzpfSVNDOjE4MTQ5MTUxMTUzMjAyMjE=/?source=notification&notif_id=1570645823351781&notif_t=camera_post_user_tagged&ref=notif",
        // "www.facebook.com/profile.php?sk=approve&highlight=1814915068653559&log_filter=review&queue_type=friends&notif_id=1570645819883343&notif_t=mention&ref=notif#1814915068653559",
        // "www.facebook.com/pages/?category=liked&notif_id=1571063991036185&notif_t=page_name_change&ref=notif",
        // "www.facebook.com/pages/?category=invites&notif_id=1571049329555385&notif_t=page_invite&ref=notif",
        // "www.facebook.com/groupslanding/?group_id=402408590690810&notif_id=1571329607489724&notif_t=group_invited_to_group&ref=notif",
        // "www.ijsr.net/?gclid=CjwKCAjw9L_tBRBXEiwAOWVVCcHng3EySedJtsAXcHfLSl_gRu5Lf-o-36gIJu3tQ-DSzlU7gOidYBoCpowQAvD_BwE",
        // "www.google.com/url?q=https%3A%2F%2Ftrello.com%2Fconfirm%3FconfirmationToken%3D%26idMember%3D58f6402d46711e01726e7aa9%26returnUrl%3D%252Fb%252F79NPHkJp%252Fboil-bhoot-todos&sa=D&sntz=1&usg=AFQjCNGRh6JPQGkGCo3esEbzcOCkoHtBfQ",
        // "external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fwww.mobilebaynep.com%2Fassets%2Flanding%2FFish_Icon_trans.png&f=1&nofb=1",
        // "m.youtube.com/watch?feature=youtu.be&v=tSbt0GFSdIg&fbclid=IwAR1SRHFVe8zc9wOC03klnWQcHah6F_obZYmoCycGhqjU8aF3dui-Umizne4",
        // "translatorswithoutborders-dot-yamm-track.appspot.com/Redirect?ukey=1HZTY8flqWJ3lHpWB_PQUBLACmRProoRmeUhzMJFmROk-792380802&key=YAMMID-32373458&link=https%3A%2F%2Fdocs.google.com%2Fforms%2Fd%2Fe%2F1FAIpQLSc4YYxKerh5DKvXTuXrSdQDRLSVI5Yn5jckTRl6C9lXMx-yxQ%2Fviewform",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fr-labelgroup.bandcamp.com%2Falbum%2Frik1&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fhardwax.com%2F31982%2Frikhter%2Frik1%2F&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fwww.facebook.com%2Ftttlllbbb%2F&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fwww.facebook.com%2Fhatecollective%2F&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fsoundcloud.com%2Fhate_music&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?q=https%3A%2F%2Fwww.instagram.com%2Fhate_collective&redir_token=cJJZHhNAZChXTlzVrbpwApL7I3l8MTU3OTI1NjAzOEAxNTc5MTY5NjM4&event=video_description&v=HqewhcsjRDQ",
        // "www.youtube.com/redirect?redir_token=G2YC1Uwa3Vcw0VPdniLTjAfPTDd8MTU4MDE1OTEyOUAxNTgwMDcyNzI5&event=video_description&v=Dfb9-ZTCA-E&q=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fxh3jjxt0ijmepsb%2F01%2520La%2520llegada%2520de%2520Sam.doc",
        // "www.youtube.com/redirect?redir_token=po9eUrOgpFHj2RCueIIhdIicWlN8MTU4MDE2MDIzMkAxNTgwMDczODMy&event=video_description&v=SnN8VroqOfI&q=https%3A%2F%2Fwww.dropbox.com%2Fs%2Fuah40240xw7fxnr%2F04%2520Sam%2520busca%2520un%2520trabajo.doc",
        // "www.youtube.com/redirect?v=SJHsaX6D6zk&event=video_description&q=https%3A%2F%2Fwww.dropbox.com%2Fs%2Ffzf6avuqttlj5kr%2F03%2520Sam%2520aprende%2520a%2520ligar.doc&redir_token=uzVNGQ8ioK2GmPKjU2oTNWROEq18MTU4MDE2MDM0NEAxNTgwMDczOTQ0",
        // "www.youtube.com/redirect?redir_token=1l86tvkdEHixlmxNK7QPDCsAyOt8MTU4MDMyOTY4OUAxNTgwMjQzMjg5&q=https%3A%2F%2Fgoo.gl%2F8dU21t&event=video_description&v=VTyA64LpYpc",
        // "www.youtube.com/redirect?redir_token=1l86tvkdEHixlmxNK7QPDCsAyOt8MTU4MDMyOTY4OUAxNTgwMjQzMjg5&q=https%3A%2F%2Fgoo.gl%2FnTEu7T&event=video_description&v=VTyA64LpYpc",
        // "www.youtube.com/redirect?redir_token=1l86tvkdEHixlmxNK7QPDCsAyOt8MTU4MDMyOTY4OUAxNTgwMjQzMjg5&q=http%3A%2F%2Fwww.epidemicsound.com%2F&event=video_description&v=VTyA64LpYpc",
        // "magnet:?xt=urn:btih:babce7443f7a4352115b4a4e6b4be58023ffe62a&dn=Minecraft+1.12.2+Cracked+%5BFull+Installer%5D+%5BOnline%5D+%5BServer+List%5D&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80&tr=udp%3A%2F%2Fopen.demonii.com%3A1337&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Fexodus.desync.com%3A6969",
        // "getpocket.com/explore/item/english-is-not-normal?utm_source=pocket-newtab?utm_source=fbsynd&fbclid=IwAR06huw49GAWqWr5LbYrY60FIboi8O8jlIXRzSTGJzyvESljqmT9eGQdiF8",
    ],

    test_clipping: function (inputs) {
        let i = 0;
        inputs = inputs || this.sample_inputs;

        const interval = setInterval(function () {
            if (i === inputs.length) {
                clearInterval(interval);
            }
            else {
                const input = inputs[i];
                const clipped = clip(input);
                show_link(clipped, input);
                clear_input("clip_in");
                i += 1;
            }
        }, 100);
    },

    test_chConv: function (inputs, conv_count) {
        let i = 0;
        inputs = inputs || this.sample_inputs;

        const interval = setInterval(function () {
            if (i === inputs.length) {
                clearInterval(interval);
            }
            else {
                const input = inputs[i];
                const converted = replace_sp_chars(input, conv_count);
                show_link(converted, input);
                clear_input("ch_conv_in");
                i += 1;
            }
        }, 100);
    },

};
