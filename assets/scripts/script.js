var allPokeUrl = 'https://pokeapi.co/api/v2/pokemon?limit=10000';
var randomPokeUrl = 'https://pokeapi.co/api/v2/pokemon/';
var cryurl = 'https://veekun.com/dex/media/pokemon/cries/';
var cry;
var pokemonNames = [];
var random;
var cap;


// get all the pokemon from the API
fetch(allPokeUrl)
    .then(function (response) {
        return response.json();
    })
    .then(function (data) {
        // iterate through length of data
        for (i = 0; i < data.results.length; i++) {
            // push our pokemon array the name of our pokemon
            pokemonNames.push(data.results[i].name.charAt(0).toUpperCase() + data.results[i].name.slice(1));
            // trim off the URL from the pokemon #
            var urlString = getDataNumber(data.results[i].url);
            // end loop once we get to the end of real pokemon and not alternate forms/regional variants, set our RNG cap when we do so
            if (urlString != (i + 1)) {
                cap = (i + 1);
                i = data.results.length;
            };
        };
        // unhide content after we get all our pokemon
        $("body").removeClass("hide");
    });

// function to get a random pokemon + cry
function getPokemon(pokemon) {
    // create a cry audio object using our resource and the random pokemon
    cry = new Audio(`${cryurl}${pokemon}.ogg`);
    // lower volume because this stuff really blasts your ears
    cry.volume = .1;
    $("#error").text("");
    cry.onerror = function () {
        $("#error").text("This cry is unavailable at the moment.").attr("style", "color: red;");
    };
    cry.oncanplay = function() {
        cry.play();
    }
    fetch(`${randomPokeUrl}${pokemon}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // set the h1 to the pokemon's name, capitalizing the first letter via charAt and then concatenating the rest of the name via slice, removes hide class keeping element hidden
            $("#pokename").text(data.species.name.charAt(0).toUpperCase() + data.species.name.slice(1)).removeClass("hide");
            // set the img to the pokemon's sprite, removes hide class keeping element hidden
            $("#pokeimg").attr("src", data.sprites.front_default).removeClass("hide");
        });
};

$("#generate").click(function () {
    // generate the random number with the cap
    random = Math.floor(Math.random() * cap);
    getPokemon(random);
});

// function to filter out everything from the URL besides the pokemon number
function getDataNumber(data) {
    var pokeNum = data.split("pokemon/").pop().split("/").shift();
    return pokeNum;
};

$("#pokeimg").click(function () {
    // if there is no error for cry, then try to play it
    if(!cry.error) cry.play();
});

$("form").submit(function(event) {
    // preventDefault so we don't reload page
    event.preventDefault();
    // assign the searched text to a variable for readable usage
    searched = $(event.target)[0][0].value
    // iterate through the pokemonNames array
    for (poke = 0; poke < pokemonNames.length; poke++) {
        // if the looked at pokemonNames is what was searched
        if(pokemonNames[poke] == searched) {
            // getPokemon with the index + 1 (array is offset from dex by 1)
            getPokemon((poke + 1));
        };
    };
});

// Autocomplete for search box
$(function () {
    $('#search').autocomplete({
        source: pokemonNames
    });
});