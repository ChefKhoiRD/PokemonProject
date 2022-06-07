// variables holding url data
var pokeApiCoUrl = 'https://pokeapi.co/api/v2/pokemon';
var pokeTcgApiUrl = 'https://api.pokemontcg.io/v2/cards/';
var cryUrl = 'https://veekun.com/dex/media/pokemon/cries/';
// variables for button indices
var pokeIndex = -1;
var imageIndex = 0;
// get all our pokemon out of localStorage
var allPokemon = [];
var storedPokemon = JSON.parse(localStorage.getItem("allPokemon"));
if (storedPokemon) allPokemon = storedPokemon;
// variable to store our audio cry in
var cry;
// starts us off where we left loading so the page doesn't ask for the same info every reload
var preloaded = allPokemon.length;

// get all the pokemon and related info from the APIs
async function getAllPokemon() {
    // get the list of pokemon from pokeAPI
    const fetcher = await fetch(`${pokeApiCoUrl}?limit=10000`);
    const data = await fetcher.json();
    // for every pokemon in the list, starting from preloaded
    for (let i = preloaded; i < data.results.length; i++) {
        // trim off the URL from the pokemon #
        var urlPokeNum = getDataNumber(data.results[i].url);
        // end loop once we get to the end of real pokemon and not alternate forms/regional variants
        if (urlPokeNum != (i + 1)) i = data.results.length;
        // if we don't already have the info for this pokemon, set up an object for it in our array
        else if (!allPokemon[i]) await setPokeObj(data, i);
        // reinitialize the autocomplete every time we get a new pokemon so we continually expand our autocomplete as we get more pokemon
        autoComplete();
        // unhide our body, we start hidden for a second to make sure we get at least some info for the user to play with to start off
        $("body").removeClass("hide");
    };
    // once we've got all the pokemon, hide the loading icon
    $("#loading").addClass("hide");
};

// function to set up a pokemon object into the allPokemon object array
async function setPokeObj(data, i) {
    // initialize empty temporary object so we can feed it into functions
    let tempPoke = {};
    // set up the name
    tempPoke.name = trimPoke(data.results[i].name.charAt(0).toUpperCase() + data.results[i].name.slice(1));
    // initialize an empty array for our images
    tempPoke.images = [];
    // set up info from pokeAPI
    await getPokeInfo(tempPoke, i);
    // set up cards from pokemonTCG
    await getPokeCards(tempPoke, tempPoke.name);
    // actually add the object to the array at its proper index
    allPokemon[i] = tempPoke;
    // update our localStorage with the newly updated array
    localStorage.setItem("allPokemon", JSON.stringify(allPokemon));
};

// function to set up card images into the pokemon object's image properties
async function getPokeCards(tempObj, pokeName) {
    const fetcher = await fetch(`${pokeTcgApiUrl}?q=name:%22${pokeName}%22`, {
        headers: {
            'X-Api-Key': '6f0066f9-4a35-4bc2-9d6e-cfe8c5948200'
        }
    });
    const data = await fetcher.json();
    for (cards = 0; cards < data.data.length; cards++) {
        tempObj.images.push(data.data[cards].images.small);
    };
};

// function to set up height, weight, type and the pokemon's image into the given pokemon object properties
async function getPokeInfo(tempObj, pokeNum) {
    // get the info from pokeAPI, offset by 1 because they use the pokedex number as the query
    const fetcher = await fetch(`${pokeApiCoUrl}/${pokeNum + 1}`);
    const data = await fetcher.json();
    // set up the actual properties on the given object
    tempObj.height = data.height;
    tempObj.weight = data.weight;
    tempObj.types = data.types;
    tempObj.images[0] = data.sprites.front_default;
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

// controlling function to set up a pokemon on the page
function setPokemon(pokemonNum) {
    // set the pokeIndex to the pokemon the user searched
    pokeIndex = pokemonNum;
    // make sure to reset the zoom when pokemon is changed
    $("#pokeimg").removeClass("zoomed");
    // remove pointer class so it doesn't have false pointer indicator if user was looking at a card
    $("#pokeimg").removeClass("pointer");
    // set up pokedex # on page
    $("#pokenum").text(`# ${pokemonNum + 1}`);
    // searched pokemon goes in the search bar
    $("#search").val(allPokemon[pokemonNum].name);
    // set up the pokemon's cry (offset by one because of how it is hosted), image, name, types, height/weight
    setPokemonCry(pokemonNum + 1);
    setPokemonImage(pokemonNum);
    setPokemonName(pokemonNum);
    setPokemonTypes(pokemonNum);
    pokemonHeight(allPokemon[pokemonNum]);
    pokemonWeight(allPokemon[pokemonNum]);
};

// function to set the pokemon's image
function setPokemonImage(pokemonNum) {
    // reset the image index to 0
    imageIndex = 0;
    // set up the first image, unhide the div it's in
    $("#pokeimg").attr("src", allPokemon[pokemonNum].images[imageIndex]).removeClass("hide");
    // show the user how many images are available and that they're viewing the first image
    $("#imagenum").text(`${allPokemon[pokeIndex].images.length} / ${imageIndex + 1}`);
};

// function to set up the pokemon's name
function setPokemonName(pokemonNum) {
    // set the pokemon's name
    $("#pokename").text(allPokemon[pokemonNum].name);
};

// function to set up the pokemon's types
function setPokemonTypes(pokemonNum) {
    // set the text for the labeling span
    $("#poketype").text('Type(s):');
    // set up our first type
    var typesString = allPokemon[pokemonNum].types[0].type.name;
    // if there are any other types
    if (allPokemon[pokemonNum].types.length > 1) {
        // for every type beyond the first
        for (types = 1; types < allPokemon[pokemonNum].types.length; types++) {
            // concatenate a comma, space and the new type for each type
            typesString += `, ${allPokemon[pokemonNum].types[types].type.name}`;
        };
    };
    // set the types to the span
    $("#additionalPoketype").text(typesString);
};

// setting converted pokemon height
function pokemonHeight(data) {
    // convert the height from metric to imperial inches
    var convertedHeight = Math.ceil(data.height * 3.93701);
    // get number of feet rounded down
    var feet = Math.floor(convertedHeight / 12);
    // get the remaining inches
    var inches = convertedHeight % 12;
    // set the DOM element with the height
    document.getElementById("convertedHeight").textContent = "Height: " + feet + "\'" + inches + "\"";
};

// setting pokemon weight from incorrectly inputted kilograms to lbs
function pokemonWeight(data) {
    // convert the weight from metric to imperial pounds
    var convertedWeight = Math.ceil(data.weight * 0.22);
    // set the DOM element with the weight
    document.getElementById("convertedWeight").textContent = "Weight: " + convertedWeight + " lbs";
};

// function to filter out everything from the URL besides the pokemon number
function getDataNumber(data) {
    // start with a URL, split it at the pokemon/, pop off the end and work with that, split again using the left over /, shift gets us our number 
    var pokeNum = data.split("pokemon/").pop().split("/").shift();
    // return the number
    return pokeNum;
};

// function to remove particular phrases from pokemon names fetched from list
function trimPoke(string) {
    // an array of words that come as endings from pokeAPI that we don't want in our list, both on the user's side and used to fetch from pokemonTCG
    var badWords = ["-normal", "-attack", "-ordinary", "-red-striped", "-altered", "-average", "-shield", "-standard", "-incarnate", "-plant", "-male", "-solo", "-land", "-red-meteor", "-disguised", "-aria", "-midday", "-baile", "-amped", "-full-belly", "-single-strike", "-ice", "-50"];
    // for every element in badWords
    for (wordsIndex = 0; wordsIndex < badWords.length; wordsIndex++) {
        // replace the selected element (if it exists of course) with nothing, effectively removing it from the name
        string = string.replace(badWords[wordsIndex], "");
    };
    // replace -m and -f with male and female symbols
    if (string.endsWith("-m")) string = string.replace("-m", " ♂");
    if (string.endsWith("-f")) string = string.replace("-f", " ♀");
    // return our trimmed up name
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
function autoComplete() {
    // initialize an empty array
    var pokemonNames = [];
    // for every name in allPokemon
    for (names = 0; names < allPokemon.length; names++) {
        // push the name from allPokemon to pokemonNames
        pokemonNames.push(allPokemon[names].name)
    }
    // set up the autocomplete with jquery
    $('#search').autocomplete({
        autoFocus: true,
        // use our pokemonNames var as the source, filtering as we go and limiting to 5
        source: (request, response) => {
            const results = $.ui.autocomplete.filter(pokemonNames, request.term);
            response(results.slice(0, 5));
        }
    });
};

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
    // if no match by text, try by number
    // if searched isn't above allPokemon.length and is positive
    if (searched <= allPokemon.length && searched > 0) {
        // setPokemon with the number given
        setPokemon(searched - 1);
        // set boolean to false so we don't get our error
        isError = false;
    }
    // if a matching pokemon isn't found, show the error along with what the user searched
    if (isError) {
        $("#text").addClass("hide");
        var warning = $("<h6>").text(`'${$(event.target)[0][0].value}' could not be found.`).attr("style", "color: white; position: absolute; bottom: 0px; left: 15px;").attr("id", "warning");
        $("#first").append(warning);
    };
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
    // if the user clicks the down button
    if (event.target.id === "down") {
        // decrement pokeIndex
        pokeIndex--;
        // if the pokeIndex is below 0, set it to the upper bound to wrap around
        if (pokeIndex < 0) pokeIndex = (allPokemon.length - 1);
        // setPokemon with pokeIndex
        setPokemon(pokeIndex);
    }
    // if the user clicks the up button
    else if (event.target.id === "up") {
        // increment pokeIndex
        pokeIndex++;
        // if pokeIndex goes above the upper bound, set it to 0 to wrap around
        if (pokeIndex > allPokemon.length - 1) pokeIndex = 0;
        // setPokemon with pokeIndex
        setPokemon(pokeIndex);
    }
    // if the user clicks the left button
    else if (event.target.id === "left") {
        // decrement imageIndex
        imageIndex--;
        // if imageIndex goes below 0, set it to the upper bound to wrap around
        if (imageIndex < 0) imageIndex = (allPokemon[pokeIndex].images.length - 1);
        // set the image we're looking at and set the text denoting which image out of how many
        $("#pokeimg").attr("src", allPokemon[pokeIndex].images[imageIndex]);
        $("#imagenum").text(`${allPokemon[pokeIndex].images.length} / ${imageIndex + 1}`);
        // if user is looking at base image, remove the pointer class, otherwise add it
        if (imageIndex == 0) $("#pokeimg").removeClass("pointer");
        else $("#pokeimg").addClass("pointer");
    }
    // if the user clicks the right button
    else if (event.target.id === "right") {
        // increment imageIndex
        imageIndex++;
        // if imageIndex goes above the upper bound, set it to 0 to wrap around
        if (imageIndex > allPokemon[pokeIndex].images.length - 1) imageIndex = 0;
        // set the image we're looking at and set the text denoting which image out of how many
        $("#pokeimg").attr("src", allPokemon[pokeIndex].images[imageIndex]);
        $("#imagenum").text(`${allPokemon[pokeIndex].images.length} / ${imageIndex + 1}`);
        // if user is looking at base image, remove the pointer class, otherwise add it
        if (imageIndex == 0) $("#pokeimg").removeClass("pointer");
        else $("#pokeimg").addClass("pointer");
    };
});

// allow the user to click on a card to make it larger/smaller
$("#pokeimg").click(function (event) {
    modalToggle(event);
});

// modal toggle function so a user can see the pokemon cards in greater detail
function modalToggle(event) {
    // we don't want to grow our base pokemon image so we only do anything if the imageIndex is 0, which corresponds to the base image
    if (imageIndex != 0) {
        // if the we're already zoomed in with the modal background, go back
        if ($("#pokeimg").hasClass("zoomed") || $(event.target).hasClass("modal")) {
            $("#pokeimg").removeClass("zoomed");
            $(".modal").remove();
        }
        // otherwise, zoom in with modal background 
        else {
            $(event.target).addClass("zoomed pointer");
            $("body").before($("<div>").addClass("modal pointer"));
        };
    };
    // add event listener so we can click the modal to go back
    $(".modal").click(function(event) {
        modalToggle(event);
    });
};

// user hint that goes away when scrolled over
var helpdisappear = $("#text");
helpdisappear.hover(
    function () {
        helpdisappear.attr("class", "hide")
    },
);

// start getting all pokemon on page load
getAllPokemon();