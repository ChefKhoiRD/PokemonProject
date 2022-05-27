var allPokeUrl = 'https://pokeapi.co/api/v2/pokemon?limit=10000';
var randomPokeUrl = 'https://pokeapi.co/api/v2/pokemon/';
var cryurl = 'https://veekun.com/dex/media/pokemon/cries/';
var cry;

// function to get a random pokemon + cry
function getPokemon() {
    // get all the pokemon from the API
    fetch(allPokeUrl)
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        var random;
        var cap;
        // iterate through length of data
        for(i = 0; i < data.results.length; i++) {
            // trim off the URL from the pokemon #
            var urlString = getDataNumber(data.results[i].url);
            // end loop once we get to the end of real pokemon and not alternate forms/regional variants, set our RNG cap when we do so
            if(urlString != (i + 1)) {
                cap = (i + 1);
                i = data.results.length;
            };
        };
        // generate the random number with the cap
        random = Math.floor(Math.random() * cap);
        cry = new Audio(`${cryurl}${random}.ogg`)
        console.log(cry)
        cry.volume = .2;
        // fetch the pokemon corresponding with the random number
        fetch(`${randomPokeUrl}${random}`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // set the h1 to the pokemon's name, capitalizing the first letter via charAt and then concatenating the rest of the name via slice, removes hide class keeping element hidden
                $("#pokename").text(data.species.name.charAt(0).toUpperCase() + data.species.name.slice(1)).removeClass("hide");
                // set the img to the pokemon's sprite, removes hide class keeping element hidden
                $("#pokeimg").attr("src", data.sprites.front_default).attr("style", "visibility: visible;").removeClass("hide");
            });
    });
};

$("#generate").click(getPokemon);

// function to filter out everything from the URL besides the pokemon number
function getDataNumber(data) {
    var pokeNum = data.split("pokemon/").pop().split("/").shift();
    return pokeNum;
};

$("#pokeimg").click(function() {
    cry.play();
    var msg = new SpeechSynthesisUtterance();
    msg.text = "Sound not found.";
    window.speechSynthesis.speak(msg);
});