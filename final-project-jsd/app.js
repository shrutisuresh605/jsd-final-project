(function () {

var breweryAppReference = firebase.database();  

console.log("loaded")

const $buttonClick = $(".show-breweries");
const $favButtonClick = $(".show-favorite");
const $visitButtonClick = $(".show-visited");

// 

// use the set method to save data to the messages




// function getBreweries() {
//     $.get(`https://api.openbrewerydb.org/breweries?by_type=micro`)
//     .then((response) => {
//         console.log("response");
//     })
// }



$buttonClick.click(function() {
    var city = $(".city").val().replace(" ", "_");
    var state = $(".state").val().replace(" ", "_");
    var type = $("#type").val();
    // console.log(city, state, type);
    event.preventDefault();
    

    var query = "https://api.openbrewerydb.org/breweries?"
    if(type!=="Select a brewery type") {
        query+= `by_type=${type}&`
    }
    if(city){
        query+= `by_city=${city}&`
    }
    if(state){
        query+= `by_state=${state}`
    }

    function getBreweries() {
        $.get(query)
        .then((response) => {
            
            var visitedCheckBox = `<input type="checkbox" class="visit">`;
            var favCheckBox = `<input type="checkbox" class="fav">`;
            $.each(response, function(i, item) {
                var address = item.street + ", " + item.city+ ", " + item.state;
                populateTable("", item.name, address, item.brewery_type, visitedCheckBox, favCheckBox);

            }); 
            
            setCheckBoxEvent();
        })
    }

    getBreweries();
})

$favButtonClick.click(function() {
    event.preventDefault();
    console.log("favorited")

    breweryAppReference.ref('mybrewery').on('value', function (results) {   
        var favBrewery = results.val();
        
        console.log(favBrewery)
        if(favBrewery) {
            $("#brewtable").find("tr:gt(0)").remove();
        }

        for (let id in favBrewery) {
            console.log(id);
            let item = favBrewery[id];
            if(!item.favorite)
            {
                continue;
            }
            var visitedCheckBox = `<input type="checkbox" class="visit">`;
            if(item.visited) {
                visitedCheckBox = `<input type="checkbox" class="visit" checked>`;
            }

            var favCheckBox = `<input type="checkbox" class="fav" checked>`;

            populateTable(id, item.name, item.address, item.type, visitedCheckBox, favCheckBox);
        }
        setCheckBoxEvent();
    })

});

$visitButtonClick.click(function() {
    event.preventDefault();
    console.log("favorited")

    breweryAppReference.ref('mybrewery').on('value', function (results) {   
        var favBrewery = results.val();
        
        console.log(favBrewery)
        if(favBrewery) {
            $("#brewtable").find("tr:gt(0)").remove();
        }

        for (let id in favBrewery) {
            console.log(id)
            let item = favBrewery[id];
            if(!item.visited)
            {
                continue;
            }
            var favCheckBox = `<input type="checkbox" class="fav">`;
            if(item.favorite) {
                favCheckBox = `<input type="checkbox" class="fav" checked>`;
            }
            var visitedCheckBox = `<input type="checkbox" class="visit" checked>`;

            populateTable(id, item.name, item.address, item.type, visitedCheckBox, favCheckBox);
        }
                
        setCheckBoxEvent();
    })

});

function populateTable(id, name, address, type, visitedCheckBox, favCheckBox) {
    var $tr = $(`<tr></tr>`);
    $tr.append(
        $(`<td>`).text(name),
        $(`<td>`).text(address),
        $(`<td>`).text(type),
        $(`<td>`).append(visitedCheckBox),
        $(`<td>`).append(favCheckBox),
    ).appendTo("#brewtable");

    if(id.length) {
        $tr.attr('data-id', id);
    }
}

function processCheckedEvent(target, isVisitedhecked, isFavChecked) {
    var $tr = $(target).closest("tr")
    var $td = $tr.find("td");

    var rowData = [];
    $.each($td, function() {
        rowData.push($(this).text());
    });

    var id = $tr.data('id');
    // console.log(id);
    // console.log(isVisitedhecked);
    // console.log(isFavChecked);
    if(!id) {
        addNewRecord(rowData, isVisitedhecked, isFavChecked, $tr);
    }
    else if(!isFavChecked && !isVisitedhecked) {
        deleteRecord(id);
    }
    else {
        updateRecord(id, isVisitedhecked, isFavChecked);
    }
}

function setCheckBoxEvent()
{               
    $(".visit").change(function() {
        event.preventDefault();
        var isVisitedhecked = this.checked;
        var isFavChecked = $(this).closest("tr").find(".fav").prop("checked");
        processCheckedEvent($(this), isVisitedhecked, isFavChecked);
    });
    
    $(".fav").change(function() {
        event.preventDefault();
        var isVisitedhecked = $(this).closest("tr").find(".visit").prop("checked");
        var isFavChecked = this.checked;
        processCheckedEvent($(this), isVisitedhecked, isFavChecked);
    });
}

function addNewRecord(rowData, isVisitedhecked, isFavChecked, tr) {
    let breweryRef = breweryAppReference.ref('mybrewery');

    let key = breweryRef.push({
        name: rowData[0],
        address: rowData[1],
        type: rowData[2],
        visited: isVisitedhecked,
        favorite: isFavChecked
        }).getKey();

    console.log(key);

    tr.attr("data-id", key);
}

function updateRecord(id, visitedhecked, favChecked) {
    var breweryRef = breweryAppReference.ref('mybrewery/' + id);
    breweryRef.update({ 
        visited: visitedhecked, 
        favorite: favChecked 
    });
}

function deleteRecord(id) {
    var breweryRef = breweryAppReference.ref('mybrewery/' + id);
    breweryRef.remove();
    $(`tr[data-id=${id}]`).remove();
}


})();