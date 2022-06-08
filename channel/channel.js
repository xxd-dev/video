var global_api_key = "";
var videos_list = [];
var video_dict = {};

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
            window.open('../howto','_self');
            return;
        }
    }

    if (!urlParams.has("c")) {
        window.open('../howto','_self');
        return;
    }

    const channel = urlParams.get("c");

    fetch(`https://youtube.googleapis.com/youtube/v3/channels?part=snippet%2CcontentDetails%2Cstatistics&id=${channel}&key=${global_api_key}`)
    .then(response => response.json())
    .then(response => {
        let channel_response = response
        console.log(channel_response);
        document.getElementById("channel-avatar").src = channel_response.items[0].snippet.thumbnails.medium.url;
        document.getElementById("channel-name").innerHTML = channel_response.items[0].snippet.title;
        document.getElementById("channel-subscribers").innerHTML = `${formatNumber(channel_response.items[0].statistics.subscriberCount)} subs`;
        document.getElementById("channel-views").innerHTML = `${formatNumber(channel_response.items[0].statistics.viewCount)} channelviews`;
        
        let playlist = "UU" + channel.substring(2);

        return fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet%2Cstatus%2CcontentDetails&maxResults=50&playlistId=${playlist}&key=${global_api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        let raw_videos = response.items;
        videos_list = raw_videos.map(function(item) {
            return {
                videoId: item.snippet.resourceId.videoId,
                thumbnail: item.snippet.thumbnails.high.url,
                title: item.snippet.title,
                channelId: item.snippet.channelId,
                channelTitle: item.snippet.channelTitle,
                upload_date: formatDate(item.snippet.publishedAt),
                upload_date_millis: new Date(item.snippet.publishedAt).getTime()
            };
        });
        let concat = videos_list.map(item => item.videoId).join(",");
        return fetch(`https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails%2Cstatistics&id=${concat}&key=${global_api_key}`);
    })
    .then(response => response.json())
    .then(response => {
        let videos = response.items;
            for (let i in videos) {
                video_dict[videos[i].id] = videos[i];
            }

        for (let i in videos_list) {
            let video = videos_list[i];
            let html = `
            <div class="card">
                <a href="../watch/?api=${global_api_key}&v=${video.videoId}" target="_blank" rel="noopener">
                    <div class="video-container">
                        <div class="thumbnail-stack">
                            <img src="${video.thumbnail}" class="card__img" alt="thumbnail">
                            <p class="video-length">${toTime(video_dict[video.videoId].contentDetails.duration)}</p>
                        </div>
                        <div class="channel-info">
                            <div class="marked">
                                <h3 class="channel-name crop">${video.title}</h3>
                                <p class="subs2">${formatNumber(video_dict[video.videoId].statistics.viewCount)} views - ${formatDate(video_dict[video.videoId].snippet.publishedAt)}</p>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            `;
            document.getElementById("grid").innerHTML += html;
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

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
}

function tmp() {
    console.log("nice");
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
    window.open(`search/?api=${global_api_key}&search=${search}`, "_blank");
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