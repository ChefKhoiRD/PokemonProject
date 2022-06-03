// variables for URLs we're grabbing data from
var pokeApiCoUrl = 'https://pokeapi.co/api/v2/pokemon';
var pokeTcgApiUrl = 'https://api.pokemontcg.io/v2/cards/';
var cryUrl = 'https://veekun.com/dex/media/pokemon/cries/';
// initializing variables we work with later
var cry;                    // variable we store audio in for the selected pokemon's cry
var pokemonNames = [];      // variable we store all pokemon names in, array allows us to also use its index as a way to reference them by pokedex #

// get all the pokemon from the API
function getAllPokemon() {
    fetch(`${pokeApiCoUrl}?limit=10000`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // iterate through length of data
            for (i = 0; i < data.results.length; i++) {
                // trim off the URL from the pokemon #
                var urlPokeNum = getDataNumber(data.results[i].url);
                // end loop once we get to the end of real pokemon and not alternate forms/regional variants
                if (urlPokeNum != (i + 1)) {
                    i = data.results.length;
                }
                else {
                    // push our pokemon array the name of our pokemon
                    pokemonNames.push(trimPoke(data.results[i].name.charAt(0).toUpperCase() + data.results[i].name.slice(1)));
                };
            };
            // unhide content after we get all our pokemon
            $("body").removeClass("hide");
        });
};

// function to get a pokemon's cry
function getPokemonCry(pokemon) {
    // create a cry audio object using our resource and the random pokemon
    cry = new Audio(`${cryUrl}${pokemon}.ogg`);
    // lower volume because this stuff really blasts your ears
    cry.volume = .1;
    // set up audio properties we use
    cry.onerror = cryerror;
    cry.oncanplay = crycanplay;
}

// function to get a pokemon's card
function getPokemonCards(pokeName) {
    // fetch cards based off generated pokemon's name, using replace to change any - to * to work better with the pokemontcg.io api, removing the f and m for nidorans
    fetch(`${pokeTcgApiUrl}?q=name:%22${pokeName.replace("-", "*")}%22`, {
        headers: {
            XApiKey: '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
        }
    })
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            createCards(data);
        });
}

// function to get a pokemon's image and name and set the page with it
function getPokemonImage(pokemon) {
    // get the pokemon's data from pokeapi.co
    fetch(`${pokeApiCoUrl}/${pokemon}`)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // store the species name for easier usage and for special case options
            // set the h1 to the pokemon's name, capitalizing the first letter via charAt and then concatenating the rest of the name via slice, removes hide class keeping element hidden
            $("#pokename").text(pokemonNames[pokemon - 1].charAt(0).toUpperCase() + pokemonNames[pokemon - 1].slice(1)).removeClass("hide");
            // setting pokemon weight from incorrectly inputted kilograms to lbs
            function pokemonWeight() {
                $("#pokewei").text(data.weight);
                var convertedWeight = data.weight * 0.22;
                document.getElementById("convertedWeight").textContent = "Weight:" + convertedWeight + "lbs";

            }
            pokemonWeight();
            // setting converted pokemon height
            function pokemonHeight() {
                 $("#pokehei").text(data.height);
                 var convertedHeight = Math.ceil (data.height * 3.93701);
                 var inches = convertedHeight%12;
                 var feet = Math.floor(convertedHeight/12);
                 document.getElementById("convertedHeight").textContent = "Height:" + feet + "\'" + inches + "\"";
            }
           pokemonHeight();
            // set the img to the pokemon's sprite, removes hide class keeping element hidden
            $("#pokeimg").attr("src", data.sprites.front_default).removeClass("hide");

            // set the img to the pokemon's sprite, removes hide class keeping element hidden
            $("#pokeimg").attr("src", data.sprites.front_default).removeClass("hide");
        });
};

// function to get a pokemon + cry + cards
function getPokemon(pokemon) {
    // show the togglecards button
    $("#togglecards").removeClass("hide");
    // get the pokemon's cry
    getPokemonCry(pokemon);
    // get the pokemon's image/name
    getPokemonImage(pokemon);
    // get cards featuring the pokemon
    getPokemonCards(pokemonNames[pokemon - 1]);
};

// function to pass each card into generateCard
function createCards(cardsArray) {
    // remove any cards already on the page
    $("#cards").children().remove();
    // loop through the cardsArray and generate a card DOM object for each entry, special cases for any cards that don't play nice, default for the rest
    for (card = 0; card < cardsArray.data.length; card++) {
        generateCard(cardsArray.data[card]);
    };
};

// function to generate a DOM object for a given card
function generateCard(card) {
    // create a div to contain the card image, we know the incoming image size so we've adjusted the width/height
    var newCard = $("<div>").attr("style", "width: 255px; height: 352px; display: flex; justify-content: center; align-items: center;");
    // create an image and give it the card source, with contain to keep aspect ratio
    var cardImg = $("<img>").attr("src", card.images.large).attr("style", "object-fit: contain;");
    // append the card to the div
    newCard.append(cardImg);
    // append the dive to the DOM
    $("#cards").append(newCard);
};

// function to filter out everything from the URL besides the pokemon number
function getDataNumber(data) {
    var pokeNum = data.split("pokemon/").pop().split("/").shift();
    return pokeNum;
};

// function to remove particular phrases from pokemon names fetched from list
function trimPoke(string) {
    var badWords = ["-normal", "-attack", "-ordinary", "-red-striped", "-altered", "-average", "-shield", "-standard", "-incarnate", "-plant", "-male", "-solo", "-land", "-red-meteor", "-disguised", "-aria", "-midday", "-baile", "-amped", "-full-belly", "-single-strike", "-ice", "-50"];
    for (wordsIndex = 0; wordsIndex < badWords.length; wordsIndex++) {
        string = string.replace(badWords[wordsIndex], "");
    };
    // replace -m and -m with male and female symbols
    if (string.includes("-m")) string = string.replace("-m", " ♂");
    if (string.includes("-f")) string = string.replace("-f", " ♀");
    return string;
};

// audio error functions
function cryerror() {
    // if there is an error with the audio file, notify user
    $("#error").text("This cry is unavailable at the moment.").attr("style", "color: red;");
};
function crycanplay() {
    // set the error text to nothing because we have no error
    $("#error").text("");
    // play the cry of the pokemon we're getting
    cry.play();
};

// autocomplete for search box
$(function () {
    $('#search').autocomplete({
        source: pokemonNames,
    });
});

// when user submits a pokemon to the input, if their input is invalid, tell them, if their input is valid, work with it to get the right pokemon, sound and cards
$("form").submit(function (event) {
    // preventDefault so we don't reload page
    event.preventDefault();
    // remove any existing warning if it exists
    $("#warning").remove();
    // boolean to be used if we have bad user input
    var isError = true;
    // assign the searched text to a variable for readable usage
    searched = $(event.target)[0][0].value;
    // iterate through the pokemonNames array
    for (poke = 0; poke < pokemonNames.length; poke++) {
        // if the looked at pokemonNames is what was searched
        if (pokemonNames[poke].toUpperCase() == searched.toUpperCase()) {
            // getPokemon with the index + 1 (array is offset from dex by 1)
            getPokemon((poke + 1));
            // if a matching pokemon is found, set the boolean to false so we don't get our error
            isError = false;
        };
    };
    // if a matching pokemon isn't found, show the error along with what the user searched
    if (isError) {
        var warning = $("<h6>").text(`'${$(event.target)[0][0].value}' could not be found.`).attr("style", "color: red;").attr("id", "warning");
        $("form").after(warning);
    }
});

// events for the toggle cards button
$("#togglecards").click(function() {
    // do what the button says and change the button to the other state
    if($("#togglecards").val() === "Show Cards") {
        $("#togglecards").val("Hide Cards");
        $("#cards").removeClass("hide");
    }
    else if ($("#togglecards").val() === "Hide Cards") {
        $("#togglecards").val("Show Cards");
        $("#cards").addClass("hide");
    };
});

// generate a random number with the length of pokemonNames array and use it to call getPokemon
$("#generate").click(function () {
    var random = Math.floor(Math.random() * pokemonNames.length);
    getPokemon(random);
});

// if there is no error for cry, then try to play it
$("#pokeimg").click(function () {
    if (!cry.error) cry.play();
});

// when page loads, get all our pokemon so we can work with them
getAllPokemon();