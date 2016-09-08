(function(){
    var gameData = [];

    function httpGetAsync(url, callback){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(JSON.parse(xmlHttp.responseText));
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }

    function prependZero(num){
        if (parseInt(num) < 10){
            num = '0' + num;
        }
        return num.toString();
    }

    function getGameData(date, cb){
        var month = prependZero(date.getMonth());
        var today = prependZero(date.getDate());
        var url = 'http://gdx.mlb.com/components/game/mlb/year_' + date.getFullYear() + '/month_' + month + '/day_' + today + '/master_scoreboard.json';

        httpGetAsync(url, function(response){
            if (typeof cb === 'function'){
                if (response != undefined){
                    cb(null, response);
                }
                else {
                    cb('No data returned.');
                }
            }
        })
    }

    function setActiveGame(currentElement){
        currentElement.className += ' active';
        var currentGame = gameData.game.filter(function(obj){
            if (obj.id === currentElement.getAttribute('id')){
                return obj;
            }
        })[0];

        var headline = document.createElement('h1');
        headline.innerHTML = currentGame.home_name_abbrev + ' vs ' + currentGame.away_name_abbrev;
        currentElement.insertBefore(headline, currentElement.childNodes[0]);

        var description = document.createElement('p');
        var gameDate = new Date(currentGame.original_date);
        description.innerHTML = gameDate.toDateString() + ' ' + currentGame.time_hm_lg + currentGame.time_zone;
        currentElement.appendChild(description);
    }

    function addGamesToCarousel(games, cb){
        var carousel = document.getElementById('carousel');

        for(var i = 0; i < games.game.length; i++){
            var gameDiv = document.createElement('div');
            gameDiv.setAttribute('class','game');
            gameDiv.setAttribute('id', games.game[i].id);

            games.game[i].video_thumbnails.thumbnail.forEach(function(element){
                if (element.scenario === '7'){
                    var img = document.createElement('img');
                    img.setAttribute('src', element.content);
                    gameDiv.appendChild(img);
                }
            });

            if (i === 0 && carousel.childElementCount === 0){
                setActiveGame(gameDiv);
            }

            carousel.appendChild(gameDiv);
        }
    }

    function getCurrentActiveGame(){
        return document.getElementsByClassName('active')[0];
    }

    function resetGameDiv(){
        var current = getCurrentActiveGame();
        current.setAttribute('class', 'game');
        current.removeChild(current.lastChild);
        current.removeChild(current.firstChild);
    }

    function scrollLeft(){
        var current = getCurrentActiveGame();
        resetGameDiv();
        setActiveGame(current.previousSibling);
    }

    function scrollRight(){
        var current = getCurrentActiveGame();
        resetGameDiv();
        setActiveGame(current.nextSibling);
    }

    function init(){
        var html = document.getElementsByTagName('html')[0];
        html.addEventListener('keyup', function(e){
            if (e.keyCode === 37){
                scrollLeft();
            }
            else if (e.keyCode === 39){
                scrollRight();
            }
        });

        getGameData(new Date, function(err, response){
            console.log(response);
            gameData = response.data.games;
            addGamesToCarousel(gameData, function(){})
        })
    }

    init();
})();