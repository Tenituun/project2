const drop = document.getElementById("selectTheater");                                      //luodaan vakio select-elementille
const timeTable = document.getElementById("timeTable");                                     //luodaan vakio diville, johon tiedot dumpataan

var stylish = document.head.appendChild(document.createElement("style"));                   //Luodaan uusi style-elementti taustakuvien sumennusta varten.

var data = {};                                                                              //Luodaan tyhjä datapankki objekteja varten

const schedules = new URL("https://www.finnkino.fi/xml/Schedule/?nrOfDays=7")               // yhdistettävä urli ja get-parametrit (haetaan aikataulut viikon ajalta vain pääkaupunkiseudulta)
var xhr = new XMLHttpRequest();                                                             // luodaan uusi request muuttuja

xhr.open("GET", schedules, true);                                                           //avataan yhteys urliin
xhr.send();                                                                                 //lähetetään pyyntö

xhr.onreadystatechange = function() {                                                       //Kun pyyntö on valmistunut suoritetaan funktio
    if (xhr.readyState === 4 && xhr.status === 200) {                                       //Jos kaikki meni putkeen niin jatketaan
        var xmlDoc = xhr.responseXML;                                                       //tallennetaan vastaus xmlDoc-muuttujaan
    
        var theaters = new Set();                                                           // uusi Set-muuttuja, mikä voi sisältää vain uniikkeja arvoja
        var showNodes = xmlDoc.getElementsByTagName("Show");                                //luodaan htmlcollection-array kaikista Show-tageista

        for (var i = 0, il = showNodes.length; i < il; ++i) {                               //aloitetaan for loop, joka jatkuu kunnes showNoden kaikki kohdat on iteroitu
            var showNode    = showNodes[i];                                                 //Annetaan käytävälle showille muuttuja
            var showTitle   = showNode.getElementsByTagName("Title")[0].innerHTML;          //Otetaan käytävän esityksen leffan nimi
            var showStart   = showNode.getElementsByTagName("dttmShowStart")[0].innerHTML;  //Otetaan käytävän esityksen aloitusaika
            var showGenre   = showNode.getElementsByTagName("Genres")[0].innerHTML;         //Otetaan käytävän esityksen genre
            var showTheater = showNode.getElementsByTagName("Theatre")[0].innerHTML;        //Otetaan käytävän esityksen teatterisijointi
            var showSynopsis= showNode.getElementsByTagName("EventURL")[0].innerHTML;       //Otetaan esityksen nettisivu
            var showCover   = "";                                                           //Luodaan tyhjä muuttuja mahdolliselle kansikuvalle
            var coverNodes  = showNode.getElementsByTagName("EventMediumImagePortrait");    //Yritetään hakea kansikuvaa
            if (coverNodes.length > 0) {                                                    //Jos coverNodes sisältää jotain
                showCover   = coverNodes[0].textContent;                                    //Tallennetaan arvo aiemmin luotuun muuttujaan
            }
            var showImage   = "";                                                           //Luodaan tyhjä muuttuja mahdolliselle kuvalle
            var imageNodes  = showNode.getElementsByTagName("EventLargeImageLandscape");    //Yritetään hakea kuvaa 
            if(imageNodes.length > 0) {                                                     //Jos imageNodes sisältää jotain
                showImage   = imageNodes[0].textContent;                                    //Tallennetaan arvo muuttujaan showImage
            }
            var showAge     = "";                                                           //Sama juttu vielä kertaalleen
            var ageNodes    = showNode.getElementsByTagName("RatingImageUrl");              // haetaan ikäraja-kuvaketta
            if (ageNodes.length > 0) {                                                      //Jos löytyi
                showAge     = ageNodes[0].textContent;                                      //Tallennetaan
            }
            
            theaters.add(showTheater);                                                      //Lisätään uusi uniikki arvo (jos löytyy) teattereihin 

            if (!data[showTheater]) {                                                       //Jos datan sisältä ei löyty showTheater kategoriaa
                data[showTheater] = {};                                                     // niin luodaan sinne sellainen (vain ensimmäisellä kerralla)
            }

            if (!data[showTheater][showTitle]) {                                            //Tässä käydään läpi saatu data ja lisätään ne data-kokoelmaan jos elokuvaa ei vielä ole datassa
                data[showTheater][showTitle] = {};                                          //Lisätään elokuvan nimi
                data[showTheater][showTitle]["Genres"] = showGenre;                         //Lisätään elokuvalle genre
                data[showTheater][showTitle]["Synopsis"] = showSynopsis;                    //Lisätään event url dataan
                data[showTheater][showTitle]["Cover"] = showCover;                          //Lisätään kansikuva
                data[showTheater][showTitle]["Image"] = showImage;                          //Lisätään toinen kuva
                data[showTheater][showTitle]["Age"] = showAge;                              //Lisätään ikäraja-kuvake
                data[showTheater][showTitle]["Times"] = [];                                 //Lisätään tyhjä paikka esitysajoille
            }

            data[showTheater][showTitle]["Times"].push(new Date(Date.parse(showStart)));    //Otetaan esityksen aloitusajat ja pusketaan ne arrayihin Date-elementteinä
        }

        for (var theater of theaters) {                                                     //Jokaista teatteria kohtaan
            var option = new Option(theater, theater);                                      //Luodaan teatterista uusi option-muuttuja
            drop.add(option);                                                               //Lisätään vaihtoehto select-elementtiin
        }
    }
}

function selected(theater) {                                                                //Funktio, joka käynnistyy kun valitaan joku selectin vaihtoehdoista (onChange)
    var shows = data[theater];                                                              //Luodaan muuttuja, jolle annetaan datasta kaikki yhden teatterin esitykset
    var i = 0;                                                                              //luodaan indeksimuuttuja looppia varten

    timeTable.innerHTML = "";                                                               //tyhjennetään timeTable-div

    for (var show in shows) {                                                               //Käydään jokainen teatterin esitys läpi
        var title = show;                                                                   //Esityksen nimi
        var genre = shows[show]["Genres"];                                                  //Esityksen genre
        var times = shows[show]["Times"];                                                   //Esityksen aikataulut
        var Cover = shows[show]["Cover"];                                                   //Esityksen kansikuva
        var Image = shows[show]["Image"];                                                   //Esitykse lisäkuva
        var Age = shows[show]["Age"];                                                       //Esityksen ikäraja-kuvake
        var Synopsis = shows[show]["Synopsis"];                                             //Linkki esityksen sivulle finnkinoon         
        
        var dump    =  "<p class=info>" + title + ", " + "<br>" + genre + ", " +            //Lyödään kaikki yhden esityksen data muuttujan sisälle
                    "</p>" + "<a href=" + Synopsis + "><img class=movieImg src='" + Cover + "'></a>" +          //Kuvat laitetaan myös käyttäen saatua linkkiä
                    "<img class=movieImg src='" + Age + "'>" +                              //Luodaan myös luokat luoduille elementeille
                    "<img class=movieImg src='" + Image + "'>" +                            //Sama jatkuu
                    "<p class=times>" + times.map(t => t.getDate() + "/" + t.getMonth() + "/" + t.getFullYear() //Otetaan aloitusajat ja formatoidaan ne kivempaan muotoon yödyntäen date-muuttujan metodeita
                    + " " + t.getHours() + ":" + t.getMinutes()).join(" -- \b") + "</p>";   //Yhdistetään kaikki mahdolliset aloitusajat väliviivoilla


        stylish.innerHTML += ".bg_" + i +"a::before{background-image:url(" + Cover + ");}"; //Lisätään alussa luotuun style-elementin avulla before-tagi jokailelle taustakuvalle, jotta ne saadaan blurrattua yksittäin
        timeTable.innerHTML += "<div class='movie bg_" + i + "a'>" + dump + "</div>";       //Laitetaan muuttuja uuden divin sisälle formatointia varten ja pastetaan koko homma ruudulle

        ++i;                                                                                //For-loop loppuu
    }
}

