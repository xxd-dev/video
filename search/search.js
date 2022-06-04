var global_api_key = "";

function main() {
    const urlParams = new URLSearchParams(window.location.search);
    if (!urlParams.has("api")) {
        window.open('../howto','_self');
        return;
    }

    const api_key = urlParams.get("api");
    global_api_key = api_key;

    if (!urlParams.has("search")) {
        return;
    }
    
    const search_query = urlParams.get("search");
    var videoIDs = new Set();
    var channelIDs = new Set();
    var search;
    var video_dict = {};
    var channel_dict = {};
    //return;
    //fetch("../query.json") //TODO fetch actual search
    let maxResults = 25;
    fetch(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${search_query}&key=${api_key}`)
    .then(response => response.json())
    .then(response => {
        search = response;
        for (let i in response.items) {
            result = response.items[i];
            if (result.id.kind === "youtube#video") {
                videoIDs.add(result.id.videoId);
            }
            channelIDs.add(result.snippet.channelId);
        }
        video_concat = Array.from(videoIDs).join(",");
        console.log(video_concat);
        return fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${video_concat}&key=${api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        let videos = response.items;
        for (let i in videos) {
            video_dict[videos[i].id] = videos[i];
        }

        channel_concat = Array.from(channelIDs).join(",");
        return fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channel_concat}&key=${api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        let channels = response.items
        for (let i in channels) {
            channel_dict[channels[i].id] = channels[i];
        }

        for (let i in search.items) {
            video = search.items[i];
            if (!(video.id.kind === "youtube#video")) {
                continue;
            }
            let video_url = `../watch/?api=${global_api_key}&v=${video.id.videoId}`;
            let channel_url = `../`;
            let a = '';
            let sub_count = "";
            if (!channel_dict[video.snippet.channelId].statistics.hiddenSubscriberCount) {
                sub_count = formatNumber(channel_dict[video.snippet.channelId].statistics.subscriberCount) + " subs";
            }
            let html = `
            <div class="search-video-container">
                <div class="search-video-left-container">
                    <a href="${video_url}" target="_blank" rel="noopener">
                        <div class="search-video-thumbnail-container">
                            <div class="search-video-thumbnail-wrapper">
                                <img src="${video.snippet.thumbnails.high.url}" class="search-video-thumbnail">
                            </div>
                            <div class="search-video-length-wrapper">
                                <p class="search-video-length">${toTime(video_dict[video.id.videoId].contentDetails.duration)}</p>
                            </div>
                        </div>
                    </a>
                </div>
                <div class="search-video-right-container">
                    <div class="video-info-container">
                        <a href="${video_url}" target="_blank" rel="noopener">
                            <h3 class="search-video-title">${video.snippet.title}</h3>
                            <p class="search-video-info">${formatNumber(video_dict[video.id.videoId].statistics.viewCount)} views</p>
                        </a>
                        <a href="${channel_url}" target="_blank" rel="noopener">
                            <div class="search-channel-info">
                                <img class="search-video-avatar" src="${channel_dict[video.snippet.channelId].snippet.thumbnails.high.url}" alt="avatar">
                                <div>
                                    <h3>${video.snippet.channelTitle}</h3>
                                    <p>${sub_count}</p>
                                </div>
                            </div>
                        </a>
                        <p class="search-video-description">${escapeHTML(video_dict[video.id.videoId].snippet.description)}</p>
                    </div>
                </div>
            </div>
            `;
            document.getElementById("search-videos-container").innerHTML += html;
        }
        return 0;
    })
    
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

function toTime(t){ 
	//https://stackoverflow.com/questions/14934089/convert-iso-8601-duration-with-javascript
		//dividing period from time
		var	x = t.split('T'),
			duration = '',
			time = {},
			period = {},
			//just shortcuts
			s = 'string',
			v = 'variables',
			l = 'letters',
			// store the information about ISO8601 duration format and the divided strings
			d = {
				period: {
					string: x[0].substring(1,x[0].length),
					len: 4,
					// years, months, weeks, days
					letters: ['Y', 'M', 'W', 'D'],
					variables: {}
				},
				time: {
					string: x[1],
					len: 3,
					// hours, minutes, seconds
					letters: ['H', 'M', 'S'],
					variables: {}
				}
			};
		//in case the duration is a multiple of one day
		if (!d.time.string) {
			d.time.string = '';
		}

		for (var i in d) {
			var len = d[i].len;
			for (var j = 0; j < len; j++) {
				d[i][s] = d[i][s].split(d[i][l][j]);
				if (d[i][s].length>1) {
					d[i][v][d[i][l][j]] = parseInt(d[i][s][0], 10);
					d[i][s] = d[i][s][1];
				} else {
					d[i][v][d[i][l][j]] = 0;
					d[i][s] = d[i][s][0];
				}
			}
		} 
		period = d.period.variables;
		time = d.time.variables;
		time.H += 	24 * period.D + 
								24 * 7 * period.W +
								24 * 7 * 4 * period.M + 
								24 * 7 * 4 * 12 * period.Y;
		
		if (time.H) {
			duration = time.H + ':';
			if (time.M < 10) {
				time.M = '0' + time.M;
			}
		}

		if (time.S < 10) {
			time.S = '0' + time.S;
		}

		duration += time.M + ':' + time.S;
	return duration;
}