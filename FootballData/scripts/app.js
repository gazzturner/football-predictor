var myApp = angular.module("app", ["ngRoute"])
    .service('Players',
        function() {
            var players = [
                {
                    "id": 1,
                    "name": "Gazz",
                    "points": 0,
                    "prediction": [
                        "Manchester United FC",
                        "Manchester City FC",
                        "Chelsea FC",
                        "Liverpool FC",
                        "Leicester City FC",
                        "Arsenal FC",
                        "Tottenham Hotspur FC",
                        "Aston Villa FC",
                        "Everton FC",
                        "Leeds United FC",
                        "Newcastle United FC",
                        "Burnley FC",
                        "West Ham United FC",
                        "Brentford FC",
                        "Wolverhampton Wanderers FC",
                        "Brighton & Hove Albion FC",
                        "Crystal Palace FC",
                        "Southampton FC",
                        "Watford FC",
                        "Norwich City FC"
                    ],
                    "topScorers": [
                        "Fernandes",
                        "Sancho",
                        "Cavani",
                    ],
                    "pic": "/images/gazz.jpg"
                //},
                //{
                //    "id": 2,
                //    "name": "Tim",
                //    "points": 0,
                //    "prediction":
                //    [
                //        "Manchester City FC",
                //        "Tottenham Hotspur FC",
                //        "Liverpool FC",
                //        "Chelsea FC",
                //        "Manchester United FC",
                //        "Arsenal FC",
                //        "Everton FC",
                //        "Wolverhampton Wanderers FC",
                //        "Leicester City FC",
                //        "AFC Bournemouth",
                //        "Burnley FC",
                //        "Watford FC",
                //        "Crystal Palace FC",
                //        "West Ham United FC",
                //        "Aston Villa FC",
                //        "Southampton FC",
                //        "Brighton & Hove Albion FC",
                //        "Norwich City FC",
                //        "Newcastle United FC",
                //        "Sheffield United FC"
                //    ],
                //    "topScorers": [],
                //    "pic": "/images/tim.png"
                //},
                ////{
                ////    "id": 3,
                ////    "name": "Chris",
                ////    "points": 0,
                ////    "prediction": [],
                ////    //["Manchester City", "Liverpool","Chelsea","Tottenham Hotspur","Arsenal","Manchester United","Wolverhampton Wanderers","Everton","Leicester City","West Ham United","Watford","Crystal Palace","Newcastle United","Bournemouth","Burnley","Southampton","Brighton & Hove Albion","Aston Villa","Sheffield United", "Norwich City"],
                ////    "topScorers": [],
                ////    "pic": "/images/chris.jpg"
                ////},
                //{
                //    "id": 4,
                //    "name": "Snowy",
                //    "points": 0,
                //    "prediction": [
                //        "Liverpool FC",
                //        "Manchester City FC",
                //        "Tottenham Hotspur FC",
                //        "Manchester United FC",
                //        "Chelsea FC",
                //        "Arsenal FC",
                //        "Leicester City FC",
                //        "Everton FC",
                //        "West Ham United FC",
                //        "Watford FC",
                //        "Wolverhampton Wanderers FC",
                //        "AFC Bournemouth",
                //        "Aston Villa FC",
                //        "Newcastle United FC",
                //        "Southampton FC",
                //        "Burnley FC",
                //        "Crystal Palace FC",
                //        "Brighton & Hove Albion FC",
                //        "Norwich City FC",
                //        "Sheffield United FC"
                //    ],
                //    "topScorers": [
                //        "Kane",
                //        "Salah",
                //        "Aubameyang"
                //    ],
                //    "pic": "/images/snow.jpg"
                }
            ];
            return players;
        });

myApp.config(function ($routeProvider) {
    $routeProvider.when("/", { controller: "dataController", templateUrl: "/current-standings.html" });
    $routeProvider.when("/Prediction/:playerIndex", { controller: "predictionController", templateUrl: "/prediction.html" });
});

var dataController = function($scope, $http, Players) {
    var currentStandings = [];
    var players = Players;
    function getPoints(player) {
        player.points = 0;
        for (var j = 0; j < currentStandings.length; j++) {
            var teamCurrentStandings = currentStandings[j].team.name;
            for (var k = 0; k < player.prediction.length; k++) {
                var teamPrediction = player.prediction[k];

                if (teamCurrentStandings === teamPrediction) {
                    player.points += calculatePoints(k, j);
                    break;
                }
            }
        }
    }

    function calculatePoints(predictedIndex, currentIndex) {
        if (predictedIndex === currentIndex) {
            return 0;
        }
        else if (predictedIndex > currentIndex) {
            return predictedIndex;
        } else {
            return (currentIndex - predictedIndex);
        }
    }

    var apiUrl = "http://api.football-data.org/v2/competitions/PL/standings";

    $http({
        method: "Get",
        url: apiUrl,
        headers: {
            'X-Auth-Token': 'bd750c2c49294c9d804e6a7df3b3378e'
        }
    }).then(function(response) {
            var data = response.data;
        $scope.data = data;
            currentStandings = data.standings[0].table;
        $scope.standings = currentStandings;

            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                getPoints(player);
        }

            $scope.playersOrdered = players.sort(function (a, b) { return a.points - b.points });

        },
        function(reason) {
            $scope.error = reason.statusText;
        });

    var topScorersActual = [];
    $http({
        method: "Get",
        url: 'http://api.football-data.org/v2/competitions/PL/scorers',
        headers: {
            'X-Auth-Token': 'bd750c2c49294c9d804e6a7df3b3378e'
        }
    }).then(function (response) {
            var data = response.data;
            var scorers = data.scorers;

            for (var i = 0; i < 3; i++) {
                topScorersActual.push({
                    "position": i + 1,
                    "player": scorers[i].player.name,
                    "scored": scorers[i].numberOfGoals,
                    "team": scorers[i].team.name
                });
            }

            $scope.topScorersActual = topScorersActual;

        },
        function (reason) {
            $scope.error = reason.statusText;
        });
};

var predictionController = function($scope, $routeParams, Players, $http) {
    var index = $routeParams.playerIndex;
    var selectedPlayer = Players[index];
   
    $scope.position = index + 1;
    $scope.playerName = selectedPlayer.name;
    $scope.prediction = selectedPlayer.prediction;
    var prediction = [];
    for (var i = 0; i < selectedPlayer.prediction.length; i++) {
        var position = i + 1;
        var team = selectedPlayer.prediction[i];
        prediction.push({ "position": position, "team": team });
    }

    var topScorers = [];
    for (var j = 0; j < selectedPlayer.topScorers.length; j++) {
        var pos = j + 1;
        var player = selectedPlayer.topScorers[j];
        topScorers.push({ "position": pos, "player": player });
    }

    $scope.predictionAndPosition = prediction;
    $scope.topScorerAndPosition = topScorers;
}

myApp.controller("dataController", dataController);
myApp.controller("predictionController", predictionController);