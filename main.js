(function(){
    var gameData = [];
    var nextDateToLoad = new Date();
    var getGameDataAttempt = 1;

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

    function getGameData(){
        var date = nextDateToLoad;
        console.log(date);
        var month = prependZero(date.getMonth() + 1);
        var today = prependZero(date.getDate());
        var url = 'http://gdx.mlb.com/components/game/mlb/year_' + date.getFullYear() + '/month_' + month + '/day_' + today + '/master_scoreboard.json';
        console.log(url);

        httpGetAsync(url, function(response){
            nextDateToLoad.setDate(nextDateToLoad.getDate() + 1);
            if (response.data.games.game.length > 0){
                gameData = gameData.concat(response.data.games.game);
                console.log(gameData);
                addGamesToCarousel(gameData);
                getGameDataAttempt = 1;
            }
            else {
                //not sure if this is really needed
                console.log('attempting reload');
                if (getGameDataAttempt >= 7){
                    console.warn('There has been an error loading game data for ' + getGameDataAttempt + ' days. Stopping data load.');
                }
                else {
                    getGameDataAttempt++;
                    getGameData();
                }
            }
        })
    }

    function setActiveGame(currentElement){
        currentElement.className += ' active';
        var currentGame = gameData.filter(function(obj){
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

    function addGamesToCarousel(games){
        var carousel = document.getElementById('carousel');

        for(var i = 0; i < games.length; i++){
            var gameDiv = document.createElement('div');
            gameDiv.setAttribute('class','game');
            gameDiv.setAttribute('id', games[i].id);

            games[i].video_thumbnails.thumbnail.forEach(function(element){
                if (element.scenario === '7'){
                    var img = document.createElement('img');
                    img.setAttribute('src', element.content);
                    gameDiv.appendChild(img);
                    gameDiv.setAttribute('style', 'width: ' + element.width + 'px;');
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

        if (current.nextSibling.nextSibling.nextSibling === null){
            getGameData();
        }
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

        getGameData();
    }

    init();
})();