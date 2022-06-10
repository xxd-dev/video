var global_api_key = "";
var channel_concat = "";
var channel_dict = {};

function main() {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has("api")) {
        global_api_key = urlParams.get("api");
        try {
            localStorage.setItem("video/api", global_api_key);
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            global_api_key = localStorage.getItem("video/api");
        } catch (err) {
            window.open('howto/','_self');
            return;
        }
    }

    if (urlParams.has("subs")) {
        channel_concat = urlParams.get("subs");
        try {
            localStorage.setItem("video/subs", channel_concat);
        } catch (err) {
            console.log(err);
        }
    } else {
        try {
            channel_concat = localStorage.getItem("video/subs");
        } catch (err) {
            let e = document.getElementById("progress-bar");
            e.parentNode.removeChild(e);
            return;
        }
    }

    var channels = [];
    var channel_rules = {};
    
    const regexp = /([a-zA-Z0-9-_]{24})(\[(([0-9:]*)?-([0-9:]*)?)?;([a-zA-Z,]*)?;([a-zA-Z,]*)?\])?/g;
    const matches = channel_concat.matchAll(regexp);

    for (const match of matches) {
        channels.push(match[1])
        channel_rules[match[1]] = {
            "min": match[4],
            "max": match[5],
            "need": match[6],
            "avoid": match[7]
        }
    }

    channel_promises = [];
    let channels_chunked = sliceIntoChunks(channels, 50);
    for (let a in channels_chunked) {
        let sublist = channels_chunked[a];
        let concat = sublist.join(",")
        channel_promises.push(
            fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${concat}&key=${global_api_key}`)
            .then(response => {
                return response.json();
            })
        );
    }
    Promise.all(channel_promises)
    .then((values) => {
        for (let i in values) {
            response = values [i];
            let channels = response.items
            for (let i in channels) {
                channel_dict[channels[i].id] = channels[i];
            }
        }

        for (let i in channels) {
            let channel = channels[i];
            let min = (channel_rules[channel].min)? channel_rules[channel].min : "";
            let max = (channel_rules[channel].max)? channel_rules[channel].max : "";
            let need = (channel_rules[channel].need)? channel_rules[channel].need : "";
            let avoid = (channel_rules[channel].avoid)? channel_rules[channel].avoid : "";
            let html = `
            <div class="channel-list-item">
                <div class="avatar-container">
                    <img class="avatar" src="${channel_dict[channel].snippet.thumbnails.default.url}" alt="avatar">
                    <button class="delete-side unsub" onclick="unsub('${channel}')">subbed</button>
                </div>
                <div class="channel-list-divider">
                    <div class="channel-list-divider-top">
                        <p>${channel_dict[channel].snippet.title}</p>
                        <button class="delete-main unsub" onclick="unsub('${channel}')">subbed</button>
                    </div>
                    <p class="channel-list-divider-bottom">${channel}</p>
                </div>
                <div class="channel-list-divider spacer">
                    <p class="channel-list-divider-top"></p>
                    <p class="channel-list-divider-bottom">[</p>
                </div>
                <div class="channel-list-divider">
                    <p class="channel-list-divider-top">minimum</p>
                    <input class="channel-list-divider-bottom duration" value="${min}">
                </div>
                <div class="channel-list-divider spacer">
                    <p class="channel-list-divider-top"></p>
                    <p class="channel-list-divider-bottom">-</p>
                </div>
                <div class="channel-list-divider">
                    <p class="channel-list-divider-top">maximum</p>
                    <input class="channel-list-divider-bottom duration" value="${max}">
                </div>
                <div class="channel-list-divider spacer">
                    <p class="channel-list-divider-top"></p>
                    <p class="channel-list-divider-bottom">,</p>
                </div>
                <div class="channel-list-divider">
                    <p class="channel-list-divider-top">need</p>
                    <input class="channel-list-divider-bottom listing" value="${need}">
                </div>
                <div class="channel-list-divider spacer">
                    <p class="channel-list-divider-top"></p>
                    <p class="channel-list-divider-bottom">,</p>
                </div>
                <div class="channel-list-divider">
                    <p class="channel-list-divider-top">avoid</p>
                    <input class="channel-list-divider-bottom listing" value="${avoid}">
                </div>
                <div class="channel-list-divider spacer">
                    <p class="channel-list-divider-top"></p>
                    <p class="channel-list-divider-bottom">]</p>
                </div>
            </div>
            `;
            document.getElementById("channel-list").innerHTML += html;
        }

    })
}

function sliceIntoChunks(arr, chunkSize) {
    const res = [];
    for (let i = 0; i < arr.length; i += chunkSize) {
        const chunk = arr.slice(i, i + chunkSize);
        res.push(chunk);
    }
    return res;
}

function unsub(channelid) {
    if (!confirm("remove channel?")) {
        return;
    }
    let channels = document.getElementsByClassName("channel-list-item");
    for (let i in channels) {
        let channel = channels[i];
        if (channel.children[1].children[1].innerHTML === channelid) {
            channel.parentElement.removeChild(channel);
            return;
        }
    }
}

function delay(milliseconds){
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


async function save() {
    document.getElementById("save-result").innerHTML = "";

    await delay(250);

    try {
        var result = save_throwing();
        document.getElementById("save-result").innerHTML = result;
    } catch(err) {
        document.getElementById("save-result").innerHTML = `error occured: ${err}`;
    }
    window.scrollTo(0, document.body.scrollHeight);
}

function save_throwing() {
    let channels = document.getElementById("channel-list").children;
    var channels_out = [];
    for (let i=0;i<channels.length;i++) {
        let channel_elem = channels[i];
        let id = channel_elem.children[1].children[1].innerHTML;
        let min = channel_elem.children[3].children[1].value;
        let max = channel_elem.children[5].children[1].value;
        let need = channel_elem.children[7].children[1].value;
        let avoid = channel_elem.children[9].children[1].value;
        
        let rules = {};
        rules["minmax"] = "";
        if (min !== "" || max !== "") {
            regex = /(([0-9]+)*:)?([0-5][0-9]?):[0-5][0-9]/g;
            if (min !== "") {
                if (!regex.test(min)) {
                    throw new Error(`invalid number detected for channel ${id}`);
                }
            } else {
                if (!regex.test(max)) {
                    throw new Error(`invalid number detected for channel ${id}`);
                }
            }
            rules["minmax"] = min + "-" + max;
        }
        rules["need"] = need;
        rules["avoid"] = avoid;
        rules = `[${rules["minmax"]};${rules["need"]};${rules["avoid"]}]`;
        if (rules === "[;;]") {
            channels_out.push(id);
        } else {
            channels_out.push(`${id}${rules}`);
        }
    }
    channel_concat = channels_out.join(",");
    try {
        localStorage.setItem("video/subs", channel_concat);
    } catch(err) {
        console.log(err);
    }
    link = `http://xxd-dev.github.io/video/?api=${global_api_key}&subs=${channel_concat}`;
    text = `successful! bookmark <a href="${link}">this link</a> to access your new subbox`;
    return text;
}
