//handlers for search button and add button
document.addEventListener('DOMContentLoaded', function (){
    const button = document.getElementById('searchButton');
    button.addEventListener('click', getName);

    const addButton = document.getElementById('addButton');
    addButton.addEventListener('click', searchCountry);

    const links = document.getElementById('links');
    links.addEventListener('change', showWikiLinks);
});

//get the name from the search bar to get data to populate select
function getName(){
    var restUrl = "https://restcountries.com/v3.1/name/";
    var name = document.getElementById('name').value;

    if (!name) {
        alert('Enter a country name or partial name.');
        return;
    }

    $.ajax( {
       method : 'GET',
       url : restUrl + name + "?fields=name,cca3",
       success : function(result) {
            populateList(result);
            document.getElementById('selectCountry').style.display = 'inline-block';
            document.getElementById('addButton').style.display = 'inline-block';
       },
       error: function (xhr, status, error) {
        alert("No countries");
       }
    });
}

//add data to select
function populateList(result){
    var selectCountry = document.getElementById('selectCountry');

    selectCountry.innerHTML = '';
    
    result.forEach(country => {
        const option = document.createElement('option');
        option.value = country.cca3; //want the value to be the ABBREVIATION
        option.textContent = country.name.official;
        selectCountry.appendChild(option);
    });
}

//after clicking search button, get the details of that country
function searchCountry(){
    var countryAbbreviation = document.getElementById('selectCountry').value;
    var restURL = "https://restcountries.com/v3.1/alpha/";

    document.getElementById('name').value = '';
    document.getElementById('selectCountry').style.display = 'none';
    document.getElementById('addButton').style.display = 'none';

    $.ajax( {
        method : 'GET',
        url : restURL + countryAbbreviation,
        success : function(result) {
            result = result[0];
            var countryData = {
                flag: result.flags.png,
                name: result.name.official,
                population: result.population,
                commonName: result.name.common,
                countryCode: result.cca3,
                continents: result.continents,
                region: result.region,
                subregion: result.subregion,
                capitalCity: result.capital
            };
            //check if country is already added
            let added = checkCountry(countryData.countryCode);
            if(!added) addCountry(countryData);
        },
        error: function (xhr, status, error) {
         alert("Error fetching data");
        }
     });
}

//add the country information to the page
function addCountry(countryData){
    var container = document.getElementById('container');
    var countryCard = document.createElement('div');
    countryCard.setAttribute('id', countryData.countryCode);
    countryCard.setAttribute('class', 'country');
    
    var flag = document.createElement('img');
    flag.setAttribute('id', 'flag');
    flag.src = countryData.flag;

    var h1 = document.createElement('h1');
    h1.setAttribute('id', 'countryName');
    h1.innerHTML = countryData.name;

    var table = document.createElement('table');
    table.setAttribute('id', 'table');
    makeTableRow(table, "Population", countryData.population.toLocaleString('en-US'));
    makeTableRow(table, "Common Name", countryData.commonName);
    makeTableRow(table, "Country Code", countryData.countryCode);
    makeTableRow(table, "Continents", countryData.continents);
    makeTableRow(table, "Region", countryData.region);
    makeTableRow(table, "Subregion", countryData.subregion);
    makeTableRow(table, "Capital City", countryData.capitalCity);

    var deleteButton = document.createElement('button');
    deleteButton.setAttribute('id', 'deleter');
    deleteButton.onclick = function () {
        removeCountry(countryCard);
    };

    getWikiLinks(countryCard, countryData);

    countryCard.appendChild(h1);
    countryCard.appendChild(flag);
    countryCard.appendChild(deleteButton);
    countryCard.appendChild(table);
    container.appendChild(countryCard);
}

//helper for adding country
function makeTableRow(table, datatype, data){
    var th = document.createElement('th');
    var text = document.createTextNode(datatype);
    th.appendChild(text);
    var td = document.createElement('td');
    var text = document.createTextNode(data);
    td.appendChild(text);
    var tr = document.createElement('tr');

    table.appendChild(tr);
    tr.appendChild(th);
    tr.appendChild(td);
}

function removeCountry(countryCard){
    var container = document.getElementById('container');
    container.removeChild(countryCard);
}

//ajax request for wiki articles
function getWikiLinks(countryCard, countryData){
    var wikiUrl = "https://en.wikipedia.org/w/api.php?origin=*&action=query&format=json&list=search&prop=links&srsearch=";
    var name = countryData.commonName;

    $.ajax( {
        method : 'GET',
        url : wikiUrl + name + ",religion",
        success : function(result) {
            addWikiLinks(countryCard, result)
        },
        error: function (xhr, status, error) {
        alert("Error fetching data");
        }
    });
}

//create article elements
function addWikiLinks(countryCard, result){
    var wikiSection = document.createElement('div');
    wikiSection.setAttribute('class', 'wiki');

    var h1 = document.createElement('h1');
    h1.setAttribute('class', 'articles');
    h1.innerHTML = "Wikipedia Articles";
    wikiSection.appendChild(h1);

    result.query.search.forEach(article => {
        var div = document.createElement('div');
        div.setAttribute('class', 'article');

        var a = document.createElement('a');
        a.setAttribute('class', 'link');
        var url = "https://en.wikipedia.org/wiki/" + article.title;
        a.setAttribute('href', url);
        a.setAttribute('target', '_blank');

        var title = document.createElement('h2');
        title.setAttribute('class', 'title');
        title.innerHTML = article.title;
        a.appendChild(title);

        var snippet = document.createElement('p');
        snippet.setAttribute('class', 'snippet');
        snippet.innerHTML = article.snippet;

        wikiSection.appendChild(div);
        div.appendChild(a);
        div.appendChild(snippet);
    });

    const isChecked = document.getElementById('links').checked;
    wikiSection.style.display = isChecked ? 'inline-block' : 'none';
    countryCard.appendChild(wikiSection);
}

//show articles when checkbox is checked
function showWikiLinks(){
    const isChecked = document.getElementById('links').checked;
    var wikis = document.getElementsByClassName('wiki');
    for (let i = 0; i < wikis.length; i++) {
        let wiki = wikis[i];
        wiki.style.display = isChecked ? 'inline-block' : 'none';
    }
}

//check if country has already been added
function checkCountry(countryCode){
    var container = document.getElementById('container');
    var countries = container.children;

    //check each child for their ids
    for(let i = 0; i < countries.length; i++){
        if (countryCode == countries[i].id) {
            alert("Country already added");
            return true;
        }
    }
    return false;
}