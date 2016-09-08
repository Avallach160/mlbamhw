(function(){
    var gameData = [];
    var nextDateToLoad = new Date();
    var getGameDataAttempt = 1;

    //perform async http call
    function httpGetAsync(url, callback){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                callback(JSON.parse(xmlHttp.responseText));
        };
        xmlHttp.open("GET", url, true); // true for asynchronous
        xmlHttp.send(null);
    }

    //add a 0 to numbers < 10 because mlb api wants 2 digit day and month
    function prependZero(num){
        if (parseInt(num) < 10){
            num = '0' + num;
        }
        return num.toString();
    }

    //fetch game data and load it into the carousel
    function getGameData(){
        var date = nextDateToLoad;
        var month = prependZero(date.getMonth() + 1);
        var today = prependZero(date.getDate());
        var url = 'http://gdx.mlb.com/components/game/mlb/year_' + date.getFullYear() + '/month_' + month + '/day_' + today + '/master_scoreboard.json';

        httpGetAsync(url, function(response){
            //started playing with loading additional days. it didnt work so well. could be done with more time
            nextDateToLoad.setDate(nextDateToLoad.getDate() + 1);
            //could use some more information on what possible error codes are returned. this is a pretty dirty way of checking games
            if (response.data.games.game.length > 0){
                gameData = gameData.concat(response.data.games.game);
                addGamesToCarousel(gameData);
                getGameDataAttempt = 1;
            }
            // else {
            //     //auto retry for loading additional days
            //     console.log('attempting reload');
            //     if (getGameDataAttempt >= 7){
            //         console.warn('There has been an error loading game data for ' + getGameDataAttempt + ' days. Stopping data load.');
            //     }
            //     else {
            //         getGameDataAttempt++;
            //         getGameData();
            //     }
            // }
        })
    }

    //sets styling for currently selected game
    function setActiveGame(currentElement){
        currentElement.className = 'game active animated zoomIn';
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

    //adds an array of games to the main carousel div and sets first element active
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

    //when user scrolls to next game, zoom out and reset size
    function resetGameDiv(){
        var current = getCurrentActiveGame();
        current.className = 'game animated zoomOut';
        current.removeChild(current.lastChild);
        current.removeChild(current.firstChild);
    }

    function scrollLeft(){
        var current = getCurrentActiveGame();
        if (current.previousElementSibling !== null){
            resetGameDiv();
            setActiveGame(current.previousElementSibling);
        }
    }

    function scrollRight(){
        var current = getCurrentActiveGame();
        if (current.nextElementSibling !== null){
            resetGameDiv();
            setActiveGame(current.nextElementSibling);
        }

        // if (current.nextSibling.nextSibling.nextSibling === null){
        //     getGameData();
        // }
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