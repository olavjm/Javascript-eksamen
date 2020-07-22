//candidate number:102, 213,147

//Constructor
function Constructor(file) {
  this.data = undefined;
  this.file = file;
};

// Here will all the datasets get downloaded
Constructor.prototype.getNames = function() {
  // Makes a list with all the names
  var list = [];
  for (var key in this.data) {
    list.push(key);
  }
  return list;
};

Constructor.prototype.getIDs = function() {
  // makes a list with all of the municipality numbers
  var list = [];
  for (var key in this.data) {
    list.push(this.data[key].kommunenummer);
  }
  return list;
};

Constructor.prototype.getInfo = function(knum) {
  //Goes trough all the municipality numbers and
  //then we find the rigth numbers and information about the dataset.
  for (var key in this.data) {
    if (this.data[key].kommunenummer == knum) {
      var data = {
        name: key,
        data: this.data[key]
      };
      return data;
    }
  }
};

Constructor.prototype.load = function(datasett) {
  // this function sends a request about if it is possible to download the datasett
  // variable "datasett"decides which object that will download after click from button
  // Then calls the onload method
  // Till the end, "xml.send" sends the request to get the data.
  var respons;
  var xml = new XMLHttpRequest();
  xml.open("GET", this.file, true);
  xml.onreadystatechange = function() {
    if (xml.readyState == 4 && xml.status == 200) {
      respons = JSON.parse(xml.responseText);
      if (datasett == "population") {

        befolkning.data = respons.elementer;
      }

      if (datasett == "employed") {
        sysselsatte.data = respons.elementer;
      }

      if (datasett == "eduacation") {
        utdanning.data = respons.elementer;
        utdanning.onload();
      }
    }
  };
  xml.send();
};


//Here we create a object av each object and give them onload.
var befolkning = new Constructor("http://wildboy.uib.no/~tpe056/folk/104857.json");
befolkning.load("population");

var sysselsatte = new Constructor("http://wildboy.uib.no/~tpe056/folk/100145.json");
sysselsatte.load("employed");

var utdanning = new Constructor("http://wildboy.uib.no/~tpe056/folk/85432.json");
utdanning.onload = function() {
  enableNavigationButtons();
};
utdanning.load("eduacation");


function enableNavigationButtons() {
  ["introButt", "overButt", "detailButt", "compButt"].forEach(function(id) {
    $(id).disabled = false;
  });
};

//function that reduse the use of document.getelementById
function $(id) {
  return document.getElementById(id);
};

//function that create elements with to parameters
function createElement(tagType, content) {
  var element = document.createElement(tagType);

  if (content) {
    element.appendChild(
      document.createTextNode(content)
    );
  }

  return element;
};

// function  that controlls hide and show of the different divs.
function hideIt(div) {
  var liste = ["introduction", "overview", "details", "comparison"];
  for (var i = 0; i < liste.length; i++) {
    var display;
    if (liste[i] == div) {
      display = 'block';
    } else {
      display = 'none';
    }
    $(liste[i]).style.display = display;
  }
};

//Make a table


//valueOne is the key to the table here the row will be added and valueTwo is
//the key to the row that will be added
//Data is the information that we will see in the first cell in the row
function makeRow(valueOne, valueTwo, data) {
  var row = createElement("TR");
  row.setAttribute("id", valueTwo);
  $(valueOne).appendChild(row);
  $(valueTwo).appendChild(createElement('td', data));
};


// id is the key to the row that will add cells and data is the info that will be
//represented in the cell that will be added
function addInfoRow(id, data) {
  var cell = createElement('td', data);
  $(id).appendChild(cell);
};


// function that checks if the number is valid in every dataset
function checkIt(num) {
  if (befolkning.getInfo(num)) {
    var name = befolkning.getInfo(num).name;
    return name == sysselsatte.getInfo(num).name && name == utdanning.getInfo(num).name
  } else {
    return false;
  }

};


/** Oversikt **/


//Empty dive for a new table
//Makes a new table
function controllTable() {
  $("allMunici").innerHTML = "";
  var x = createElement("table");
  x.setAttribute("id", "table-overview");
  $("allMunici").appendChild(x);

  makeRow("table-overview", "cities", "Kommuner");
  makeRow("table-overview", "K_num", "Kommunenr.");
  makeRow("table-overview", "last_Pop", "Sist målt befolkning");

  for (var i in befolkning.data) {
    addInfoRow("cities", i);
    addInfoRow("K_num", befolkning.data[i].kommunenummer);
    var list = [];
    for (var ind in befolkning.data[i].Menn) {
      list.push(ind);
    }
    var place = list.length - 1;
    var menn = befolkning.data[i].Menn[list[place]];
    var kvinner = befolkning.data[i].Kvinner[list[place]];
    addInfoRow("last_Pop", menn + kvinner);
  }
};

function overviewIt(value) {
  controllTable();
  hideIt(value);
};

/** Befolkning table **/


 //collect information about municipality and Then adds "Befolkning" as a heading
//over befolknings table
function populationTable(id) {
  var popu = befolkning.getInfo(id);
  $("befolkning").appendChild(
    createElement('h2', 'Befolkning')
  );

  //Makes a table and gives it id : table-1 and then adds the table to the
  //befolknings-diven
  var x = createElement("table");
  x.setAttribute("id", "table-1");
  $("befolkning").appendChild(x);
  makeRow("table-1", "år", "År");
  makeRow("table-1", "antall", "Antall");

  // goes trough each year
  for (var i in popu.data.Menn) {
    addInfoRow("år", i);
  }
  // goes trough each year
  for (var i in popu.data.Menn) {
    addInfoRow("antall", popu.data.Menn[i] + popu.data.Kvinner[i]);
  }
};

/** employed table **/

function employedTable(id) {
  var view = createElement("h2", "Sysselsatte");
  $("sysselsatte").appendChild(view);

  // Collect information about sysselsetting to that specific city
  var emp = sysselsatte.getInfo(id);

  //Makes a table
  var x = createElement("table");
  x.setAttribute("id", "table-2");
  $("sysselsatte").appendChild(x);

  makeRow("table-2", "year_s", "År");
  makeRow("table-2", "amount", "Prosentandel");



  // Goes trough each year and add that year to the row
  for (var key in emp.data["Begge kjønn"]) {
    addInfoRow("year_s", key);
  };

  // Goes trough each year and adds sysselsatte for each year in to the row
  // with "amount" as ID
  for (i in emp.data["Begge kjønn"]) {
    addInfoRow("amount", emp.data["Begge kjønn"][i]);
  }
};

/** Utdanning table **/

function eduacationTable(id) {
  $("educated").appendChild(
    createElement("H2", "Utdanning")
  );

  // Gets out data about "utdanning" for a specific municipality
  var edua = utdanning.getInfo(id);

  //Make a table
  var x = createElement("table");
  x.setAttribute("id", "table-3");
  $("educated").appendChild(x);


  // first row in the cell in the row gets filled with utdanning/År
  makeRow("table-3", "years", "Utdanninger/År");

  for (var u in edua.data["11"].Menn) {
    addInfoRow("years", u);
  };

  // Makes a variable with all the possible utdanninger and makes it as a list
  // and loopes trough it
  //Makes differente ids to every loop
  var utdanninger = ["11", "01", "02a", "03a", "04a", "09a"];
  for (var index = 0; index < utdanninger.length; index++) {
    var id = "antallene" + (index + 1);
    makeRow("table-3", id, utdanninger[index]);
  };

  for (var index = 0; index < utdanninger.length; index++) {
    var id = "antallene" + (index + 1);
    //num1 is how many prosent of men that have taken this type of eduacation
    //Num 2 is how many womans that have taken this type of eduacation
    //average = gjennomsnittet av num1 og num2 and then transform -
    //the number to 2 desimalers
    for (var x in edua.data["11"].Menn) {
      var data = edua.data[utdanninger[index]];
      var num1 = data.Menn[x];
      var num2 = data.Kvinner[x];
      var average = (num1 + num2) / 2;
      average = Math.round(average * 100) / 100;
      addInfoRow(id, average);
    }
  }
};

// id is the key to which list the item will go in
//data is the value that will go in the list
function listItems(id, data) {
  var x = createElement('li', data);
  $(id).appendChild(x);
};


//function that create a point list
//Specific information from each dataset
function pointList(num) {
  var befolk = befolkning.getInfo(num),
    sysatt = sysselsatte.getInfo(num),
    utdann = utdanning.getInfo(num);

  //Create a unorganized list
  var p_list = createElement("UL");
  p_list.setAttribute("id", "ul-list");
  $("infoArea").appendChild(p_list);

  //create a item with the name and crates a item with municipality number
  //picks out the last befolkning from the table and makes a item with it
  //picks out the last measured sysselsatte from the table and makes a item with it
  //picks out the last year of measured of utdanning
  listItems("ul-list", befolk.name);
  listItems("ul-list", "Kommunenummer: " + num);

  var sisteBefolk = $("table-1").rows[1].cells[12].innerHTML;
  listItems("ul-list", "Siste måling av befolkning: " + sisteBefolk);
  var sisteSyssel = $("table-2").rows[1].cells[14].innerHTML;

  listItems("ul-list", "Siste måling av sysselsatte: " + sisteSyssel);
  var lastYear = $("table-3").rows[0].cells[39].innerHTML;


  // calulating how to find people with high eduacation
  var kvinneProsent1 = utdann.data["03a"].Kvinner[lastYear];
  var mennProsent2 = utdann.data["03a"].Menn[lastYear];
  var kvinneProsent2 = utdann.data["04a"].Kvinner[lastYear];
  var mennprosent1 = utdann.data["04a"].Menn[lastYear];
  var totAntallKvinner = befolk.data.Kvinner[lastYear];
  var totAntallMenn = befolk.data.Menn[lastYear];

  var utdannKvinner1 = getPercentage(totAntallKvinner, kvinneProsent1);
  var utdannMenn1 = getPercentage(totAntallMenn, mennprosent1);
  var utdannKvinner2 = getPercentage(totAntallKvinner, kvinneProsent2);
  var utdannMenn2 = getPercentage(totAntallMenn, mennProsent2);

  var highUtdanning = utdannKvinner1 + utdannMenn1 + utdannKvinner2 + utdannMenn2;
  listItems("ul-list", "Sist målte personer med høyere utdanning: " + highUtdanning);
};
// function for calculating percentage
function getPercentage(value, num) {
  return Number(value) / 100 * Number(num);
};


//Tabell-tableOverview

function tableOverview() {
  //Clear
  $("befolkning").innerHTML = "";
  $("sysselsatte").innerHTML = "";
  $("educated").innerHTML = "";
  $("infoArea").innerHTML = "";


  //variabel num is the id that collets info
  //Collects table about befolkning, utdanning and sysselsetting to a city
  //create an unorganized list with data
  //Translate id into string value
  var num = $("cityNum").value;
  if (checkIt(num)) {
    num = String(num);
    populationTable(num);
    employedTable(num);
    eduacationTable(num);
    pointList(num);

  } else {
    $("befolkning").appendChild(
      createElement("H2", "Can't find this municipality number")
    );
  }
};

/** Sammenligning **/


//function that creates a row
function createRow(value1, value2) {
  makeRow('table-s', value1, value2);
};

function cityCompare() {
  //Creates two variables that use getInfo() ability to get the rigth information of each municipality
  //Collects sysselsetting information about the right city
  var syss1 = sysselsatte.getInfo(
    $("compNum1").value
  );

  var syss2 = sysselsatte.getInfo(
    $("compNum2").value
  );

  //Create a table
  var x = createElement("table");
  x.setAttribute("id", "table-s");
  $("compareEachOther").appendChild(x);
  // Create row for each year
  //Create a row for each city and for each genders
  createRow("years", "År");
  createRow("mennSyss1Antall", syss1.name + " Menn");
  createRow("mennSyss2Antall", syss2.name + " Menn");
  createRow("kvinnerSyss1Antall", syss1.name + " Kvinner");
  createRow("kvinnerSyss2Antall", syss2.name + " Kvinner");

  //Adds each year in to the table
  for (var i in syss1.data.Menn) {
    addInfoRow("years", i);
  };

  // Adds the amount of syssesatte for each year in a row
  for (i in syss1.data.Menn) {
    addInfoRow("mennSyss1Antall", syss1.data.Menn[i]);
    addInfoRow("mennSyss2Antall", syss2.data.Menn[i]);
    addInfoRow("kvinnerSyss1Antall", syss1.data.Kvinner[i]);
    addInfoRow("kvinnerSyss2Antall", syss2.data.Kvinner[i]);
  };

  // Checks to differente cities if they are compare to each other or not
  if (syss1.name !== syss2.name) {

    var table = $("table-s");
    //function that findes the values
    function getValue(index, position) {
      var row = table.rows[position];
      return row.cells[index].innerText - row.cells[index - 1].innerText;
    };

    // function that gets a cell
    function getCell(index, position) {
      return table.rows[position].cells[index];
    };


    // function for setting values in a cell
    //That row with higest increase will turn and green at the screen
    function setCell(index, position) {
      var cell = getCell(index, position);
      cell.style.color = "orange";
    };
    // Goes trough each year and compare them with last year
    // The tasks wanted us to se the increase from 2006, and the reason is because it is no increase from 2004-2005
    // That is the reason index start at 2
    // Makes a variable that shows increase in prosent for each year
    for (var i = 2; i < 15; i++) {
      var mennIncrease1 = getValue(i, 1);
      var mennIncrease2 = getValue(i, 2);
      var kvinnerIncrease1 = getValue(i, 3);
      var kvinnerIncrease2 = getValue(i, 4);

      if (mennIncrease1 > mennIncrease2) {
        setCell(i, 1);
      } else {
        setCell(i, 2);
      }

      if (kvinnerIncrease1 > kvinnerIncrease2) {
        setCell(i, 3)
      } else {
        setCell(i, 4)
      }
    }
  }
};

// Puts in data so they can compare each other

function compare() {
  $("compareEachOther").innerHTML = "";
  var valueOne = checkIt($("compNum1").value);
  var valueTwo = checkIt($("compNum2").value);

  if (valueOne && valueTwo) {
    cityCompare();
  } else {
    var error = createElement("H2", "Error! Enter two valid municipality numbers!");
    $("compareEachOther").appendChild(error);
  }
};
