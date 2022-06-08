<body>
<h1>xxd video</h1>
    <p>a minimal version of youtube, without any recommendations or ads
    </p>

<h2>quickstart</h3>
    <p><ul>
    <li>if you're here to replace your sub-box, go to <a href="https://xxd-dev.github.io/video/subbox-generator/" target="_blank" rel="noopener">this link</a> and follow the instructions.</li>
    <li>if you're here to watch one video free of ads and recommendations, get a <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">valid api key</a> and see <a href="#watch">watch</a> for reference.</li>
    <li>if you want to self-host this, get the <a href="https://github.com/xxd-dev/video" target="_blank" rel="noopener">sourcecode</a>.</li>
    </ul>
    </p>

<h2>components of the website</h2>
<h3 id="watch">watch</h3>
    <p>usage: <code>https://xxd-dev.github.io/video/watch/?api=[YOUR_API_KEY]&v=[VIDEO_ID]</code><br>
    <code>YOUR_API_KEY</code>: youtube enabled api key (look <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">here</a> for help)<br>
    <code>VIDEO_ID</code>: video-id (i.e. https://www.youtube.com/watch?v=<b>dQw4w9WgXcQ</b>)<br>
    quota cost: 3 points<br>
    An interface to view youtube videos. It comes with the usual information and includes the top few comments.
    </p>

<h3>search</h3>
    <p>usage: <code>https://xxd-dev.github.io/video/search/?api=[YOUR_API_KEY]&search=[SEARCH_QUERY]</code><br>
    <code>YOUR_API_KEY</code>: youtube enabled api key (look <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">here</a> for help)<br>
    <code>SEARCH_QUERY</code>: the search-query (URI-encoded, except that spaces become a '+')<br>
    quota cost: 102 points<br>
    <b>warning:</b> many searches will use up your daily quota quickly!<br>
    a youtube search, that will only return videos. a search can be triggered from the search bar present on all other pages.
    </p>

<h3>channel (not yet available)</h3>
    <p>Usage: <code>htttps://xxd-dev.github.io/video/channel/?api=[YOUR_API_KEY]&c=[CHANNEL_ID]</code><br>
    <code>YOUR_API_KEY</code>: youtube enabled api key (look <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">here</a> for help)<br>
    <code>CHANNEL_ID</code>: id of the youtube channel (i.e. https://www.youtube.com/channel/<b>UCuAXFkgsw1L7xaCfnd5JJOw</b>)<br>
    quota cost: 3 points<br>
    </p>

<h3>subscriptions</h3>
    <p>usage: <code>https://xxd-dev.github.io/video/?api=[YOUR_API_KEY]&subs=[CHANNEL_IDS]&maxv=[MAX_VIDEOS]</code><br>
    <code>YOUR_API_KEY</code>: youtube enabled api key (look <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank" rel="noopener">here</a> for help)<br>
    <code>CHANNEL_IDS</code>: comma-separated list of channel-IDs (use <a href="#subbox-gen">subbox generator</a> for help)<br>
    <code>MAX_VIDEOS</code>: (optional, default is 50) number of returned videos<br>
    quota cost: 1 point per channel + 1 point for each 50 channels + 1 point for each 50 returned videos<br>
    <b>warning:</b> many channels/refreshes can use your daily quota quickly!<br>
    similar to youtubes subscription page, this shows all recent uploads of your subscribed cannels. for each channel, only the newest 50 videos are reported, but in total you can get however many videos back as you specify in <code>MAX_VIDEOS</code>.<br>
    if possible, subscriptions and your api key is saved in local storage after opening the page with the correct parameters. this way, you don't need to pass all parameters to the page, but only open <code><a href="https://xxd-dev.github.io/video">xxd-dev.github.io/video</a></code> to access your subs.
    </p>

<h3 id="subbox-gen">subbox generator</h3>
    <p>usage: <code><a href="https://xxd-dev.github.io/video/subbox-generator">https://xxd-dev.github.io/video/subbox-generator</a></code><br>
    quota cost: 0 or 1 points per channel<br>
    guides you through transferring your youtube subscriptions onto this website.<br>
    <br>
    the parameters for your api key and subs are saved in local storage too. to be safe, the link returned still has all the parameters, but it is theoretically possible to just open <code><a href="https://xxd-dev.github.io/video">xxd-dev.github.io/video</a></code> directly and see all of your subscriptions.
    </p>
</body>