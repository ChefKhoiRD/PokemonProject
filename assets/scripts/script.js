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
        console.log(data)
        pokemon = data;
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
        // create a cry audio object using our resource and the random pokemon
        cry = new Audio(`${cryurl}${random}.ogg`);
        // lower volume because this stuff really blasts your ears
        cry.volume = .1;
        // 
        cry.onerror = function() {
            getPokemon();
            return;
        };
        cry.play();
        fetch(`${randomPokeUrl}${random}`)
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // set the h1 to the pokemon's name, capitalizing the first letter via charAt and then concatenating the rest of the name via slice, removes hide class keeping element hidden
                $("#pokename").text(data.species.name.charAt(0).toUpperCase() + data.species.name.slice(1)).removeClass("hide");
                // set the img to the pokemon's sprite, removes hide class keeping element hidden
                $("#pokeimg").attr("src", data.sprites.front_default).removeClass("hide");
            });
    });
};

$("#generate").click(function() {
    getPokemon()
    return console.log("This is the pokemon" + pokemon)
});

// function to filter out everything from the URL besides the pokemon number
function getDataNumber(data) {
    var pokeNum = data.split("pokemon/").pop().split("/").shift();
    return pokeNum;
};

$("#pokeimg").click(function() {
    cry.play();
});

fetch('https://api.pokemontcg.io/v2/cards/', {
    headers: {
        XApiKey: '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
    }
})
    .then(function(response) {
        return response.json()
    })
    .then(function(data) {
        console.log(data)
    })