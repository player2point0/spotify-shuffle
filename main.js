var player;
//REDUCE API CALLS
function onYouTubeIframeAPIReady() 
{
    player = new YT.Player('player', {
        events: {
          'onReady': onPlayerReady
        }
      }); 
}

function onPlayerReady(event) 
{
    Main();
    event.target.playVideo();
}

function Main()
{
$(document).ready(function() {

    $("#btn-login").click(GetAuth);
    $("#btn-next").click(function(){
        player.nextVideo();
    });
    
    var Token = CheckAuth();
    var Tracks = LoadTracks();

    if(Tracks === false) GetTracks(0, Token, [], Shuffle);

    else Shuffle(Tracks);

    function SearchSong(Track)
    {
        $.ajax({
            url: 'https://www.googleapis.com/youtube/v3/search',
            data : {
                part: "snippet",
                q: Track.name +" by "+Track.artist,
                key: "AIzaSyA4EfES13BN6oKnkkaplf4fZDf5gZo5bXM",
                type: "video"
            },

            success: function(response) {
                var id = response.items[0].id.videoId;                

                Track.SetId(id);
            }
         });
    }
    //SHUFFLE
    function Shuffle(tracks)
    {
        var n = 1000;

        //repeat n times
        for(var i = 0;i<n;i++)
        {
            //pick two random indexes
            var index1 = getRndInteger(0, (tracks.length-2));
            var index2 = getRndInteger((index1+1), tracks.length);
     
            //swap random items   
            var tempTrack = tracks[index1];
            tracks[index1] = tracks[index2];
            tracks[index2] = tempTrack;
        }

        SetTrackList(tracks);

        player.loadVideoById(tracks[0].id);
        CueVideosInPlaylist(tracks);
    }
    function SetTrackList(tracks)
    {
        var myNode = document.getElementById("track-list");
        myNode.innerHTML = '';

        for(var i in tracks)
        {
            tracks[i].AddToTrackList();
        }
    }
    //LIMITED TO 200 VIDEOS
    function CueVideosInPlaylist(tracks)
    {
        var ids = [];

        for(var i=0;i<200;i++)
        {
            ids.push(tracks[i].id);
        }

        player.cuePlaylist(ids);
        console.log(player);
    }
    function getRndInteger(min, max) {
        return Math.floor(Math.random() * (max - min) ) + min;
    }
    //GET TRACKS
    //NEEDS EXCEPTION HANDLING  
    function GetTracks(position, accessToken, tracks, callback)
    {
        $.ajax({
            url: 'https://api.spotify.com/v1/me/tracks',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            },
            data : {
                limit: 50,
                offset: position
            },

            success: function(response) {

                for(var i in response.items)
                {
                    var name = response.items[i].track.name;
                    var artist = response.items[i].track.artists[0].name;
                    var duration = response.items[i].track.duration_ms;
                    var popularity = response.items[i].track.popularity;

                    var tempTrack = new Track(name, artist, duration, popularity, tracks.length);
                    tracks.push(tempTrack);
                }

                console.log(position);

                if(response.items.length < 50) 
                {
                    SaveTracks(tracks);
                    SearchTracks(tracks);
                }

                else GetTracks(position+50, accessToken, tracks, callback);
            }
         });
    }
    function SearchTracks(tracks)
    {
        for(var i in tracks)
        {
            SearchSong(tracks[i]);
        }
        Shuffle(tracks);
    }
    //LOADING AND SAVING
    function SaveTracks(tracks)
    {
        localStorage.setItem("size", tracks.length);

        for(var i=0;i<tracks.length;i++)
        {
            tracks[i].Save();
        }
        console.log("saved tracks");
    }
    function LoadTracks()
    {
        var size = localStorage.getItem("size");
        var tracks = [];

        if(!(size > 0)) return false;

        for(var i = 0;i<size;i++)
        {
            var tempTrack = new Track(null, null, null, null, null, JSON.parse(localStorage.getItem(i)));
            tracks.push(tempTrack);
        }

        return tracks;
    }
    //AUTH
    function CheckAuth()
    {
        var url = window.location.href;
        var token = "";
        var valid = false;

        for(var i in url)
        {
            if(url[i] === "&") break;

            if(valid)
            {
                token += url[i];
            }
            
            if(url[i] === "=")valid = true;
        }

        if(token != "")
        {
            $("#btn-login").css("display", "none");
            return token;
        }
    }
    function GetAuth()
    {
        var url = "https://accounts.spotify.com/authorize";
        var client_id = "e2bf28724f4a42fdb25bcf7bf233d355";
        var response_type = "token";
        var redirect_uri = "http://nathan-nash.me/spotify-shuffle/";
        var scope = "playlist-read-private playlist-read-collaborative user-library-read";

        var link = url+"?client_id="+client_id+"&redirect_uri="+redirect_uri+"&scope="+scope+"&response_type="+response_type;

        window.open(link);
        window.close();
    }
});
}