var timeout_seconds = 10;

function main() {
    console.log("wrong developer console, do it on youtube instead!")
}

function return_message(message) {
    document.getElementById("button").disabled = false;
    document.getElementById("progress").style = "opacity: 0;";
    document.getElementById("subbox").style = "opacity: 1;";
    document.getElementById("subbox").innerHTML = message;
    window.scrollTo(0, document.body.scrollHeight);
}

function generate_url() {
    document.getElementById("button").disabled = true;
    document.getElementById("progress").style = "opacity: 1;";
    document.getElementById("subbox").style = "opacity: 0;"
    let promise = generate_url_async();
    let timeout = new Promise(function(resolve, reject){
        setTimeout(function() { 
            reject('request timed out. retry or try to improve your connection');
        }, timeout_seconds * 1000);
    });

    Promise.race([promise, timeout])
    .then(result => {
        return_message(result);
    })
    .catch(error => {
        if ((""+error).includes("request timed out")) {
            timeout_seconds *= 2;
        }
        return_message(error);
    });
}

async function generate_url_async() {
    let api_key = document.getElementById("api-key").value;
    let channels = document.getElementById("channels").value.split("\n");
    if (api_key === "" || channels === "") {
        throw new Error("make sure not to leave any fields blank!");
    }
    let channel_ids = [];
    let tmp = []
    for (let i in channels) {
        let channel = channels[i];
        let res = channel.match("youtube\.com\/channel\/(UC[A-Za-z0-9\-\_]{22})");
        if (res) {
            channel_ids.push(res[1]);
            continue;
        } 
        res = channel.match("youtube\.com\/user\/(.*)");
        if (res) {
            tmp.push(res[1]);
            continue;
        }
        throw new Error(`invalid link detected! (${channel}) this channel can not be added to the list`);
    }
    channels = tmp;

    channel_promises = []
    for (let i in channels) {
        let channel = channels[i];
        channel_promises.push(
            fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=id&forUsername=${encodeURIComponent(channel)}&key=${api_key}`)
            .then(response => response.json())
        );
    }

    return Promise.all(channel_promises)
    .then((values) => {
        for (let i in values) {
            if ('error' in values[i]) {
                throw new Error(`error response from api: ${values[i].error.message}`)
            }
            if (values[i].pageInfo.totalResults === 0) {
                throw new Error(`couldn't find channel: ${channels[i]}`);
            }
            channel_ids.push(values[i].items[0].id);
        }
    })
    .then(response => {
        link = `http://xxd-dev.github.io/video/?api=${api_key}&subs=${channel_ids.join(',')}`;
        text = `successful! bookmark <a href="${link}">this link</a> to access your new subbox`;
        try {
            localStorage.setItem("video/api", api_key);
            localStorage.setItem("video/subs", channel_ids.join(','));
        } catch (err) {
            console.log(err);
        }

        return text;
    });
}
