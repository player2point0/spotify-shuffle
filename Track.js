class Track{

    constructor(name, artist, duration, popularity, index, JSONData)
    {
        if(JSONData != null)
        {
            this.name =  JSONData.name;
            this.artist = JSONData.artist;
            this.duration = JSONData.duration;
            this.popularity = JSONData.popularity;
            this.index = JSONData.index;
            this.id = JSONData.id;
        }

        else
        {
            this.name =  name;
            this.artist = artist;
            this.duration = duration;
            this.popularity = popularity;    
            this.index = index;
        }
    }

    AddToTrackList()
    {
        this.h1 = document.createElement("h1");
        this.h1.textContent = this.name +" by "+this.artist;
		this.h1.setAttribute("class", "track");

        $("#track-list").append(this.h1);
    }

    SetId(id)
    {
        //REDUCES API CALLS
        this.id = id;
        this.Save();
    }

    Save()
    {
        localStorage.setItem(this.index, JSON.stringify(this));
    }
}