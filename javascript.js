


var conceptsArray = [];
var pricesArray = [];
var incomingPage="concepts.html";

/* Function to inilize the combo box and clear all textFields
   Used: receipts.html
*/
function inicializeReceipts() {
  clearFields();
  fillConceptsArray();
  var i=1;
  for (;i<7;i++) {
    displayConcepts("description-"+i+"-cli")
  }
}

/* Function to read the xml string from local memory and return ConceptNodes
   Used: receipts.html
*/
function parseXml(xmlStr) {
  return new window.DOMParser().parseFromString(xmlStr, "text/xml");
}

/* Function to create the conceptsNode array reading from the internal memory
   used: receipts.html
*/
function createConceptsNodesFromLocalStorage() {
  var xmlStr = parseXml(localStorage.concepts);
  var conceptNode = xmlStr.getElementsByTagName("concept");
  var numConcepts = conceptNode.length;
  conceptNodes = [];
  var i = 0;
  for (; i < numConcepts; i++) {
    var conc = {
      nam: conceptNode[i].getAttribute("name"),
      pric: conceptNode[i].getAttribute("price")
    };
    conceptNodes.push(conc);
  }
  return conceptNodes;
}

/* Function to fill ConceptsArray array, with the ConceptNodes array
   Used: receipts.html, configuration.html
*/
function fillConceptsArray() {
  var conceptNodes = createConceptsNodesFromLocalStorage();
  conceptsArray = [];
  pricesArray = [];
  var numConcepts = conceptNodes.length;
  for (i = 0; i < numConcepts; i++) {
    conceptsArray.push(conceptNodes[i]);
    pricesArray[conceptNodes[i].nam] = conceptNodes[i].pric;
  }
  conceptsArray.sort(function(a, b) {
    const namA = a.nam.toUpperCase();
    const namB = b.nam.toUpperCase();
    let comparison = 0;
    if (namA > namB) {
      comparison = 1;
    } else if (namA < namB) {
      comparison = -1;
    }
    return comparison
  });
}

/* Function to fill the combo box with the values in the ConceptsArray
   Used: receipts.html, configuration.html
*/
function displayConcepts(name) {
  var menu = document.getElementById(name);
  for (i = 0; i < conceptsArray.length; i++) {
    var newOption = document.createElement("option");
    newOption.innerHTML = conceptsArray[i].nam;
    menu.appendChild(newOption);
  }
}

/* Function to clear combo boxes and concept items in client and business receipts
   Used: receipts.html
*/
function clearFields() {
  var selects = "";
  var prices = "";
  var i = 1;
  for (; i < 7; i++) {
    selects = "description-" + i + "-cli";
    prices = "price-field-" + i + "-cli";
    document.getElementById("description-" + i + "-cli").selectedIndex = "0";
    document.getElementById("description-" + i + "-bus").value = "";
    document.getElementById("price-field-" + i + "-cli").value = "";
    copyName("price-field-" + i);
  }
  document.getElementById("price-field-7-cli").value = "";
  copyName("price-field-7");
  document.getElementById("client-name-field-cli").value = "";
  copyName("client-name-field");
  document.getElementById("date-field-cli").value = "";
  copyName("date-field");
  document.getElementById("amount-letter-field-cli").value = "";
  copyName("amount-letter-field");
}

/* Function to get the new receipt number non billiable and billiable
   Used: receipts.html
*/
function receiptNum(invoice) {
  var nexnumber;
  if (typeof(Storage) !== "undefined") {
    if (invoice == 0) {
      if (localStorage.nonBillReceiptNum) {
        localStorage.nonBillReceiptNum = Number(localStorage.nonBillReceiptNum) + 1;
      } else {
        localStorage.nonBillReceiptNum = 1;
      }
      if (!localStorage.noInvoicePrefix) {
        localStorage.noInvoicePrefix = "N";
      }
      nextnumber = localStorage.noInvoicePrefix + localStorage.nonBillReceiptNum;
    } else {
      if (localStorage.billReceiptNum) {
        localStorage.billReceiptNum = Number(localStorage.billReceiptNum) + 1;
      } else {
        localStorage.billReceiptNum = 1;
      }
      nextnumber = localStorage.billReceiptNum;
    }
    document.getElementById("receipt-num-cli").innerHTML = "No. " + nextnumber;
    document.getElementById("receipt-num-bus").innerHTML = "No. " + nextnumber;
  } else {
    document.getElementById("receipt-num-cli").innerHTML = "ERROR";
    document.getElementById("receipt-num-bus").innerHTML = "ERROR";
  }
  clearFields();
  document.getElementById("date-field-cli").value = getTodayDate();
  copyName("date-field");
}

/* Function that gets today date
   Used: receipts.html
*/
function getTodayDate() {
  const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  var todaydate = new Date();
  var day = todaydate.getDate();
  var month = todaydate.getMonth();
  var year = todaydate.getFullYear();
  var datestring = day + " de " + monthNames[month] + " de " + year;
  return datestring;
}

/* Function to calculate the total of the receripts
   Used: receipts.html
*/
function findTotal() {
  var arr = document.getElementsByName('price');
  var tot = 0;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].value) {
      tot += (localStringToNumber(arr[i].value)) * 100;
    }
  }
  var floatNumber = tot / 100;
  document.getElementById('price-field-7-cli').value = giveFormat(floatNumber);
  copyName("price-field-7");
}

/* Function to get the price from the combo box selection
   Used: receipts.html
*/
function getPrice(rowNum) {
  var selectNum = "description-" + rowNum;
  var priceNum = "price-field-" + rowNum;
  var selects = document.getElementById(selectNum + "-cli");
  var conceptSel = selects.value;
  var chargeValue = localStringToNumber(pricesArray[conceptSel]);
  console.log("value: " + conceptSel);
  if (conceptSel != "") {
	document.getElementById(priceNum + "-cli").value = giveFormat(chargeValue);
  }
  else {
	  document.getElementById(priceNum + "-cli").value  = "";
  }
  document.getElementById(selectNum + "-bus").value = conceptSel;
  copyName(priceNum);
  findTotal();
}

/* Function to remove invalid characters to represent a money format.
   Used: receipts.html and configuration.html
*/
function removeInvalidChars(value) {
  return Number(String(value).replace(/[^0-9.-]+/g, ""));
}

/* Function to validate the float number
   Used: receipts.html
*/
function localStringToNumber(value) {
  var noInvalidChars = String(value).replace(/[^0-9.-]+/g, "");
  var negative = 1;
  if (noInvalidChars.indexOf("-") == 0) {
    negative = "-1";
  }
  noInvalidChars = String(value).replace(/[^0-9.]+/g, "");
  var review = Number(noInvalidChars) * negative;
  return review;
}

/* Function to give format of money to the value
   Used: receipts.html and cofiguration.html
*/
function giveFormat(value) {
  const formatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    currency: 'MXN',
    style: "currency"
  })
  var newvalue = formatter.format(localStringToNumber(value));
  return newvalue;
}


/* Function to evaluate the item charge 
   Used: receipts.html
*/
function itemCharge(priceNum) {
	chargeFormat(priceNum + "-cli");
	copyName(priceNum);
	findTotal();
}

/* Function to change the format of the charge.
   Used: receipt.html
*/
function chargeFormat(priceNum) {	
  var value = giveFormat(document.getElementById(priceNum).value);
  document.getElementById(priceNum).value = value;
  return value;
}

/* Function to print the receipt.
   Used: receipt.html
*/
function printReceipt() {
  window.print();
}

/* Function to copy the values from client receipt to business receipt
   Used: receripts.hmtl
*/
function copyName(inputField) {
  var inputFieldBus = inputField + "-bus";
  document.getElementById(inputFieldBus).value = document.getElementById(inputField + "-cli").value;
}


/* Function to reset the messages in the configuration page
   Used: configuration.html
*/
function resetMessages() {
    document.getElementById("message-number-correct").innerHTML = "";
    document.getElementById("message-number-error").innerHTML = "";
    document.getElementById("message-concept-correct").innerHTML = "";
    document.getElementById("message-concept-error").innerHTML = "";
    document.getElementById("message-file-correct").innerHTML = "";
    document.getElementById("message-file-error").innerHTML = "";
}

/* Function to write messages in the page
   Used: configuration.html
*/
function write(tagName, message) {
  resetMessages();
  document.getElementById(tagName).innerHTML = message;
}

/* Function to inicialize the configuration page
   Used: configuration.html
*/
function inicializeConfigData() {
  document.getElementById("no-invoice-prefix").value = localStorage.noInvoicePrefix;
  document.getElementById("num-receipt-no-invoice").value = localStorage.nonBillReceiptNum;
  document.getElementById("num-receipt-invoice").value = localStorage.billReceiptNum;
  resetMessages();
  document.getElementById("price-amount").value = "";
  document.getElementById("concept-name").value = "";
  fillConceptsArray();
  displayConcepts("descs");
}

/* Function to change the prefix of the invoices
   Used: configuration.html
*/
function changePrefix() {
  localStorage.noInvoicePrefix = document.getElementById("no-invoice-prefix").value;
  document.getElementById("no-invoice-prefix").value = localStorage.noInvoicePrefix;
  write("message-number-correct", "Nuevo Prefijo: \"" + localStorage.noInvoicePrefix + "\".\n");
}

/* Function to change receipt number for non billiable or billiable
   Used: configuation.html
*/
function changeReciptNum(invoice) {
  if (typeof(Storage) !== "undefined") {
    var conSin = "sin"
    var nextNumber = 0;
    if (invoice == 0) {
      nextNumber = document.getElementById("num-receipt-no-invoice").value;
      localStorage.nonBillReceiptNum = nextNumber - 1;
    } else {
      nextNumber = document.getElementById("num-receipt-invoice").value;
      localStorage.billReceiptNum = nextNumber - 1;
      conSin = "con"
    }
    write("message-number-correct", "Para recibos " + conSin + " factura el siguiente número es: " + nextNumber + " .");
  } else {
    document.getElementById("num-receipt-no-invoice").innerHTML = "ERROR";
    document.getElementById("num-receipt-invoice").innerHTML = "ERROR";
    write("message-number-error", "Error al cambiar el número de recibo.\n");
  }
}

function removeValuesDropDownList(list) {
  var dropList= document.getElementById(list);
  var i;
  for (i = dropList.options.length - 1; i >= 0; i--) {
    dropList.remove(i);
  }
}

function loadToComboBox() {
  var i;
  fillConceptsArray();
  var comboBox = document.getElementById("descs");
  removeValuesDropDownList(comboBox);
  var conceptsLength = conceptsArray.length;
  for (i = 0; i < conceptsLength; i++) {
    var newOption = document.createElement("option");
    newOption.innerHTML = conceptsArray[i].nam;
    comboBox.appendChild(newOption);
  }

}

/* Function to add a new concept to the list
   Used: configuration.html
*/
function addNewConcept() {
  var concept = {
    nam: document.getElementById("concept-name").value,
    pric: chargeFormat("price-amount")
  };
  if (typeof(concept.pric) == "undefined") {
    concept.pric="0.00";
  }
  if (concept.nam.length == 0) {
    write("message-concept-error", "En el campo \"Concepto\" es mandatorio tener un valor.");
    return;
  }
  var i = 0;
  for (; i < conceptsArray.length; i++) {
    if (conceptsArray[i].nam == concept.nam) {
      write("message-concept-error", "¡Concepto \"" + concept.nam + "\" ya existe!");
      return;
    }
  }
  addConcept(concept);
  write("message-concept-correct", "!Concepto \"" + concept.nam + "\" agregado!");
}

/* Function to add a new concept
   Used: configuation.html
*/
function addConcept(concept) {
  conceptsArray.push(concept);
  addConceptToConcepts();
  fillConceptsArray();
  removeValuesDropDownList("descs");
  displayConcepts("descs");
  setNullComboBox();
  document.getElementById("price-amount").value = "";
  document.getElementById("concept-name").value = "";
  //getConcept();
}

/* Function to add the concept to the internal memory.
   Used: conficuration.html
*/
function addConceptToConcepts() {
  var xmlStr = "<doc>\n\t<concepts>\n";
  for (i = 0; i < conceptsArray.length; i++) {
    xmlStr = xmlStr + "\t\t<concept name=\"" + conceptsArray[i].nam + "\" price=\"" + conceptsArray[i].pric + "\"/>\n";
  }
  xmlStr = xmlStr + "\t</concepts>\n</doc>";
  localStorage.setItem("concepts", xmlStr);
}

/* Function to get the concept selected in the combo box.
   Used: Configuarion.html
*/
function getConcept() {
  var selects = document.getElementById("descs");
  var conceptSel = selects.value;
  var value = pricesArray[conceptSel];
  document.getElementById("concept-name").value = conceptSel;
  document.getElementById("price-amount").value = giveFormat(value);
  document.getElementById("addButton").disabled = true;
  document.getElementById("updateButton").disabled = false;
  document.getElementById("removeButton").disabled = false;
}

/* Function to change the selection of the combo box when the field text has been modified.
   Used: configuration.html
*/
function setNullComboBox() {
  document.getElementById("descs").value="";
  document.getElementById("addButton").disabled = false;
  document.getElementById("updateButton").disabled = true;
  document.getElementById("removeButton").disabled = true;

}

/* Function to update the concepts
  Used: configuration.html
*/
function updateConcept() {
  var concept = {
    nam: document.getElementById("concept-name").value,
    pric: chargeFormat("price-amount")
  };
  
  if (concept.nam.length == 0) {
    write("message-concept-error", "En el campo \"Concepto\" es mandatorio tener un valor.");
    return;
  }
  deleteConcept();
  addConcept(concept);
  setNullComboBox();
  document.getElementById("price-amount").value = "";
  document.getElementById("concept-name").value = "";
  write("message-concept-correct", "!Concepto \"" + concept.nam + "\" cambiado!");
 
}

/* Function delete concept from the concepts.
   Used: configuration.html
*/
function deleteConcept() {
    var selects = document.getElementById("descs");
    var conceptDel = selects.value;
    deleteFromLocal(conceptDel);
    fillConceptsArray();
    selects.remove(selects.selectedIndex);
    //getConcept();
    setNullComboBox();
    document.getElementById("price-amount").value = "";
    document.getElementById("concept-name").value = "";
    write("message-concept-correct", "Concepto \"" + conceptDel + "\" borrado exitosamente.")
}

/* Function to delete the concept to the internal memory
   used: configuration.html
*/
function deleteFromLocal(item) {
    var i = 0;
    var xmlStr = "<doc>\n\t<concepts>\n";
    for (i = 0; i < conceptsArray.length; i++) {
      if (conceptsArray[i].nam != item) {
        xmlStr = xmlStr + "\t\t<concept name=\"" + conceptsArray[i].nam + "\" price=\"" + conceptsArray[i].pric + "\"/>\n";
      }
    }
    xmlStr = xmlStr + "\t</concepts>\n</doc>";
    localStorage.setItem("concepts", xmlStr);
}

/* Function to go to the concept page
   Used: configuration.html
*/
function goToConepts() {
    incomingPage = "configuration.html"
    window.location = "concepts.html";
}

function addConcepts(concept) {
    conceptsArray.push(concept);
    addConceptToConcepts();
    fillConceptsArray();
}

function loadConcepts() {
  conceptsArray=[];
  var table = document.getElementById( "tableConcepts" );
  for ( var i = 1; i < table.rows.length; i++ ) {
    var concept = {
      nam: table.rows[i].cells[1].innerHTML,
      pric: table.rows[i].cells[2].innerHTML
    };
    addConcepts(concept);
  }
  document.getElementById("message-file").innerHTML = "Conceptos cargados exitosamente.";

  //write("message-file-error", "Conceptos cargados exitosamente.")
}

function resetConcepts() {
  document.getElementById("message-file").innerHTML = "";
}

  function download(filename, text) {
    var filename = "concepts.html";
    var firstCol="<tr><td>";
    var secondCol="</td><td>";
    var lastCol="</td></tr>";
    var text = document.getElementById("before-table").value;
    for (i = 0; i < conceptsArray.length; i++) {
      text = text + firstCol + (i+1) + secondCol + conceptsArray[i].nam + secondCol + conceptsArray[i].pric + lastCol;
    }
    text = text + document.getElementById("after-table").value;
    document.getElementById("all-table").value = text;
    var element = document.createElement('a');
    element.setAttribute('href', 'data:concepts/text,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'Concepts';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    write("message-file-correct", "Archivo \"concepts.xml\" fue exportado exitosamente.")
  }
  


