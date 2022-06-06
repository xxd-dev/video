var global_api_key = "";

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

    if (!urlParams.has("v")) {
        return;
    }

    const video_id = urlParams.get("v");
    const thumbnail_url = `https://i3.ytimg.com/vi/${video_id}/hqdefault.jpg`;

    document.getElementById("main-player").src = `https://www.youtube-nocookie.com/embed/${video_id}?playlist=${video_id}&vq=hd1080&autoplay=1&modestbranding=1&rel=0`;
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${video_id}&part=snippet%2CcontentDetails%2Cstatistics &key=${global_api_key}`)
    .then(response => response.json())
    .then(response => {
        const title = response.items[0].snippet.title;
        const upload_date = response.items[0].snippet.publishedAt;
        const channel_id = response.items[0].snippet.channelId;
        const description = response.items[0].snippet.description;
        const channel_title = response.items[0].snippet.channelTitle;
        const views = response.items[0].statistics.viewCount;
        const likes = response.items[0].statistics.likeCount;
        const comments = response.items[0].statistics.commentCount;
        document.getElementById("video-title").innerHTML = title;
        document.getElementById("main-video-info").innerHTML = `${Number(views).toLocaleString('en-US')} views - ${formatDate(upload_date)}`;
        document.getElementById("likes").innerHTML = formatNumber(likes);
        document.getElementById("video-description").innerHTML = escapeHTML(description);
        document.getElementById("main-channel-name").innerHTML = channel_title;
        document.getElementById("number-comments").innerHTML = `${comments} Comments`;
        console.log(Number(views).toLocaleString('en-US'));
        //todo set values
        return fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channel_id}&key=${global_api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        const channel_description = response.items[0].snippet.description;
        const channel_views = response.items[0].statistics.viewCount;
        let channel_subscribers_tmp = -1
        if (!response.items[0].statistics.hiddenSubscriberCount) {
            channel_subscribers_tmp = response.items[0].statistics.subscriberCount;
        }
        const channel_subscribers = channel_subscribers_tmp;
        const channel_avatar = response.items[0].snippet.thumbnails.medium.url;
        //todo set values
        document.getElementById("subscribers").innerHTML = `${formatNumber(channel_subscribers)} subscribers`;
        document.getElementById("channel-avatar").src = channel_avatar;
        const max_comments = 10;
        return fetch(`https://youtube.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=${max_comments}&order=relevance&videoId=${video_id}&key=${global_api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        const comments = response.items;
        for (let i in comments) {
            let comment_avatar = comments[i].snippet.topLevelComment.snippet.authorProfileImageUrl;
            let comment_name = comments[i].snippet.topLevelComment.snippet.authorDisplayName;
            let comment_text = comments[i].snippet.topLevelComment.snippet.textDisplay;
            let comment_likes = comments[i].snippet.topLevelComment.snippet.likeCount;
            let html = `
            <div class="comment">
                <img class="avatar" src="${comment_avatar}" alt="avatar">
                <div>
                    <h3>${comment_name}</h3>
                    <p>${comment_text}</p>
                    <div class="comment-like-container">
                        <img src="../like.png">
                        <p>${formatNumber(comment_likes)}</p>
                    </div>
                </div>
            </div>
            `;
            document.getElementById("comment-section").innerHTML += html;
        }
        return response;
    })
    .then(response => console.log(JSON.stringify(response)));
}
  
function escapeHTML(str){
    var p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML.replaceAll("\n", "<br>");
}
  
function formatNumber(m) {
    return nFormatter(Number(m), 1);
}

function nFormatter(num, digits) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function(item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
}

function formatDate(dateString) {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	date = dateString.split("T")[0].split('-').reverse();
    date[1] = months[Number(date[1])-1];
    return date.join(' ');
}

function keydownSearch(event) {
    if (event.keyCode == 13) {
        search();
    }
}

function search() {
    var search = encodeURIComponent(document.getElementById("search-field").value).replaceAll("%20", "+");
    window.open(`../search/?api=${global_api_key}&search=${search}`, "_blank");
    document.getElementById("search-field").value = "";
}