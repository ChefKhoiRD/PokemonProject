/*
allPokemon[n] = {
    name: Pokemon,
    cards: {
        data: [
            {
                images: {
                    large: hi-res link,
                    small: lower-res link
                }
            }
        ]
    },
    info: {
        weight: weight in .kilo,
        height: height in .meters,
        types: [1-2 types],
        sprites: {
            front_default
        }
    }
}
example: allPokemon[0].cards.data[2].images.small links to a lower resolution image of a Bulbasaur card
*/
/*
allPokemon[n] = {
    name: Pokemon,
    images: [images] 0 = front_default rest = cards,
    weight: weight in .kilo,
    height: height in .meters
}

*/
// variables for URLs we're grabbing data from
var pokeApiCoUrl = 'https://pokeapi.co/api/v2/pokemon';
var pokeTcgApiUrl = 'https://api.pokemontcg.io/v2/cards/';
var cryUrl = 'https://veekun.com/dex/media/pokemon/cries/';
var pokeIndex = 0;
var imageIndex = 0;
var pokeImages = [];
var storedPokemon = JSON.parse(localStorage.getItem("allPokemon"));
var allPokemon = [];
var pokeImagesAll = [];
var pokeImagesStored = JSON.parse(localStorage.getItem("pokeImages"))
// initializing variables we work with later
var cry;                                                    // variable we store audio in for the selected pokemon's cry
var pokemonNames = [];
var storedPokemonNames = JSON.parse(localStorage.getItem("pokemonNames"));    // variable we store all pokemon names in, array allows us to also use its index as a way to reference them by pokedex #
if(storedPokemon) allPokemon = storedPokemon;
var preloaded = allPokemon.length;
getAllPokemon();
// get all the pokemon and related info from the APIs
async function getAllPokemon() {
    const fetcher = await fetch(`${pokeApiCoUrl}?limit=10000`)
    const data = await fetcher.json();
    for (let i = preloaded; i < data.results.length; i++) {
        let tempPoke = {}
        // trim off the URL from the pokemon #
        var urlPokeNum = getDataNumber(data.results[i].url);
        // end loop once we get to the end of real pokemon and not alternate forms/regional variants
        if (urlPokeNum != (i + 1)) {
            i = data.results.length;
        }
        else {
            tempPoke.name = trimPoke(data.results[i].name.charAt(0).toUpperCase() + data.results[i].name.slice(1));
            tempPoke.images = [];
            await getPokeInfo(tempPoke, i);
            await getPokeCards(tempPoke, tempPoke.name);
            allPokemon[i] = tempPoke;
            localStorage.setItem("allPokemon", JSON.stringify(allPokemon));
        };
    };
    // after we get all the pokemon objects into an array, store that in localStorage
    // unhide content after we get all our pokemon
    $("body").removeClass("hide");
};

async function getPokeCards(tempObj, pokeName) {
    const fetcher = await fetch(`${pokeTcgApiUrl}?q=name:%22${pokeName}%22`, {
        headers: {
            XApiKey: '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
        }
    });
    const data = await fetcher.json();
    for(cards = 0; cards < data.data.length; cards++) {
        tempObj.images.push(data.data[cards].images.small);
    }
}

async function getPokeInfo(tempObj, pokeNum) {
    // offset by 1 because index is 0 but pokemon start a 1
    const fetcher = await fetch(`${pokeApiCoUrl}/${pokeNum + 1}`);
    const data = await fetcher.json();
    tempObj.height = data.height
    tempObj.weight = data.weight;
    tempObj.types = data.types;
    tempObj.images[0] = data.sprites.front_default;
};

async function getACard(pokeName) {
    const pokemon = [];
    const fetcher = await fetch(`${pokeTcgApiUrl}?q=name:%22${pokeName}%22`, {
        headers: {
            XApiKey: '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
        }
    })
    const data = await fetcher.json();
    for (var i = 0; i < data.data.length; i++) {
        pokemon.push(data.data[i])
    }
    return pokemon;
};
// function to get a pokemon's cry
function setPokemonCry(pokemon) {
    // create a cry audio object using our resource and the random pokemon
    cry = new Audio(`${cryUrl}${pokemon}.ogg`);
    // lower volume because this stuff really blasts your ears
    cry.volume = .1;
    // set up audio properties we use
    cry.onerror = cryerror;
    cry.oncanplay = crycanplay;
};

async function getAllCards() {
    for (let pokemon = 0; pokemon < 25; pokemon++) {
        pokeImagesAll.push(
            await getACard(pokemonNames[pokemon])
        )
    }
    localStorage.set("pokeImages", JSON.stringify(pokeImagesAll));
}

async function getACard(pokeName) {
    const pokemon = [];
    const fetcher = await fetch(`${pokeTcgApiUrl}?q=name:%22${pokeName}%22`, {
        headers: {
            XApiKey: '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
        }
    })
    const data = await fetcher.json();
    for (var i = 0; i < data.data.length; i++) {
        pokemon.push(data.data[i])
    }
    return pokemon;
};

// controlling function to set up a pokemon on the page
function setPokemon(pokemonNum) {
    pokeIndex = pokemonNum - 1;
    setPokemonCry(pokemonNum + 1);
    setPokemonImage(pokemonNum);
    setPokemonName(pokemonNum);
    setPokemonTypes(pokemonNum);
    setPokemonHeightWeight(pokemonNum)
    $("#pokeimg").removeClass("zoomed");
    $("#imagenum").text(`${allPokemon[pokeIndex + 1].images.length} / ${imageIndex + 1}`);
};

function setPokemonImage(pokemonNum) {
    pokeImages = [];
    imageIndex = 0;
    $("#pokeimg").attr("src", allPokemon[pokemonNum].images[imageIndex]).removeClass("hide");
};

function setPokemonName(pokemonNum) {
    $("#pokename").text(allPokemon[pokemonNum].name).removeClass("hide");
};

function setPokemonHeightWeight(pokemonNum) {
    pokemonHeight(allPokemon[pokemonNum])
    pokemonWeight(allPokemon[pokemonNum])
}

function setPokemonTypes(pokemonNum) {
    $("#poketype").text('Type(s):');
    var typesString = allPokemon[pokemonNum].types[0].type.name;
    if(allPokemon[pokemonNum].types.length > 1) {
        for(types = 1; types < allPokemon[pokemonNum].types.length; types++) {
            typesString += `, ${allPokemon[pokemonNum].types[types].type.name}`
        }
    }
    $("#additionalPoketype").text(typesString);
};

// setting converted pokemon height
function pokemonHeight(data) {
    $("#pokehei").text(data.height);
    var convertedHeight = Math.ceil(data.height * 3.93701);
    var inches = convertedHeight % 12;
    var feet = Math.floor(convertedHeight / 12);
    document.getElementById("convertedHeight").textContent = "Height: " + feet + "\'" + inches + "\"";
}

// setting pokemon weight from incorrectly inputted kilograms to lbs
function pokemonWeight(data) {
    $("#pokewei").text(data.weight);
    var convertedWeight = Math.ceil(data.weight * 0.22);
    document.getElementById("convertedWeight").textContent = "Weight: " + convertedWeight + " lbs";
}

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
    // replace -m and -f with male and female symbols
    if (string.endsWith("-m")) string = string.replace("-m", " ♂");
    if (string.endsWith("-f")) string = string.replace("-f", " ♀");
    return string;
};

// audio error functions
function cryerror() {
    // if there is an error with the audio file, notify user
    $("#error").text("✖")
};

function crycanplay() {
    // set the error text to nothing because we have no error
    $("#error").text("🕪");
    // play the cry of the pokemon we're getting
    cry.play();
};

// autocomplete for search box
$(function () {
    var pokemonNames = [];
    for (names = 0; names < allPokemon.length; names++) {
        pokemonNames.push(allPokemon[names].name)
    }
    $('#search').autocomplete({
        autoFocus: true,
        source: (request, response) => {
            const results = $.ui.autocomplete.filter(pokemonNames, request.term);
            response(results.slice(0, 5));
        }
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
    // iterate through the allPokemon array
    for (poke = 0; poke < allPokemon.length; poke++) {
        // if the looked at allPokemon is what was searched
        if (allPokemon[poke].name.toUpperCase() == searched.toUpperCase()) {
            // getPokemon with the index + 1 (array is offset from dex by 1)
            setPokemon((poke));
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

// generate a random number with the length of allPokemon array and use it to call setPokemon
$("#generate").click(function () {
    var random = Math.floor(Math.random() * allPokemon.length);
    setPokemon(random);
});

// if there is no error for cry, then try to play it
$("#error").click(function () {
    if (!cry.error) cry.play();
});

// d-pad functionality
$(":button").click(function (event) {
    if (event.target.id === "down") {
        pokeIndex--;
        if (pokeIndex < 0) pokeIndex = (allPokemon.length - 1)
        setPokemon(pokeIndex + 1)
    }
    else if (event.target.id === "up") {
        pokeIndex++;
        if (pokeIndex > allPokemon.length - 1) pokeIndex = (0)
        setPokemon(pokeIndex + 1)
    }
    else if (event.target.id === "left") {
        imageIndex--;
        if (imageIndex < 0) imageIndex = (allPokemon[pokeIndex + 1].images.length - 1)
        $("#pokeimg").attr("src", allPokemon[pokeIndex + 1].images[imageIndex])
        $("#imagenum").text(`${allPokemon[pokeIndex + 1].images.length} / ${imageIndex + 1}`);

    }
    else if (event.target.id === "right") {
        imageIndex++;
        if (imageIndex > allPokemon[pokeIndex + 1].images.length - 1) imageIndex = (0)
        $("#pokeimg").attr("src", allPokemon[pokeIndex + 1].images[imageIndex])
        $("#imagenum").text(`${allPokemon[pokeIndex + 1].images.length} / ${imageIndex + 1}`);
    }
})

$("#pokeimg").click(function (event) {
    if (imageIndex != 0) {
        if ($(event.target).hasClass("zoomed")) $(event.target).removeClass("zoomed");
        else $(event.target).addClass("zoomed");
    }
})

var helpdisappear = $("#text");
helpdisappear.hover(function () {
    helpdisappear.attr("class", "hide")
},
);