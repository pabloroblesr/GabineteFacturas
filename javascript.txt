var conceptsArray = [];
var pricesArray = [];
var discountsArray = [];
var amountsArray = [];
var typesArray = [];

/* initial funciton to execute everytime a page is opened
  used: receipts.html, configuration.html, concepts.html.
  */
document.addEventListener('DOMContentLoaded', function() {
  //console.log(location.href);
  var filename = location.href.split("/");
  if (filename[filename.length -1] == 'receipts.html') {
    fillItemsArray("all");
    displayItems("receipts");
    document.getElementById("pagetype").innerHTML="n";
    clearFields();
    document.getElementById("defaultOpen").click();
    clearFields();
  }
  else if (filename[filename.length -1] == 'configuration.html') {
    document.getElementById("no-invoice-prefix").value = localStorage.noInvoicePrefix;
    document.getElementById("num-receipt-no-invoice").value = localStorage.nonBillReceiptNum;
    document.getElementById("num-receipt-invoice").value = localStorage.billReceiptNum;
    const conftypes = ["descs","discnts"];
    fillItemsArray("all");
    for (const conftype in conftypes) {
      document.getElementById(conftypes[conftype] + "-amount").value = "";
      document.getElementById(conftypes[conftype] + "-name").value = "";
      document.getElementById(conftypes[conftype] + "ConfigUpdateButton").disabled = true;
      document.getElementById(conftypes[conftype] + "ConfigDeleteButton").disabled = true;
      document.getElementById(conftypes[conftype] + "configconfiginnerbox").style.display = "none";
    }
    displayItems("configuration");
    document.getElementById('discntTypeRel').click();
  }
  else if (filename[filename.length -1] == 'concepts.html') {

  }
  else {
      changeSize();
  }
});


/* function to change the size of the document in the help.html page.
 used: help.html
 */
function changeSize() {
  var screensize = (window.innerHeight -220);
  document.getElementById("document").style.height = screensize+'px';
  document.getElementById("docindex").style.height = (screensize - 20) +'px';
}

/*Function that Selects the tab, Recibos or Notas
  Used: receipts.html
  receipttype: receipt, note*/
function openReceiptType(evt, receipttype) {
  //console.log("openReceiptType -> receipttype:" + receipttype );
  var i, tabcontent, tablinks, title, noreceipttype, rec_tit;
  if (receipttype == 'receipt') {
    title = 'RECIBOS';
    rec_tit = "RECIBO";
    noreceipttype = 'note';
    pagetype='r';
    document.getElementById("new-receipt-note").innerHTML="Nuevo Recibo";
  }
  else {
    title = "NOTAS";
    rec_tit = "NOTA";
    noreceipttype = 'receipt';
    pagetype='n';
    document.getElementById("new-receipt-note").innerHTML="Nueva Nota";
  }
  document.getElementById("pagetype").innerHTML=pagetype;
  document.getElementById('receipttitle').innerHTML = title;
  document.getElementById("receipt-title-cli").innerHTML=rec_tit;
  document.getElementById("receipt-title-bus").innerHTML=rec_tit;
  tabcontent = document.getElementsByClassName(noreceipttype);
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  var fieldtypes = document.getElementsByClassName(receipttype);
  for (i = 0; i < fieldtypes.length; i++) {
    fieldtypes[i].style.display = "block";
  }
  copyName("receipt-num","inner");
  copyName("client-name-field","values");
  copyName("date-field","values");
  for (i = 1; i < 7; i++) {
    copyName("quantity-field-" + i,"values");
    copyName("itemprice-field-" + i,"values");
    var selects = document.getElementById("description-" + i + "-cli-" + pagetype).value;
    copyName("description-" + i,"select");
    copyName("price-field-" + i, "inner");
  }
  copyName("subtotal","inner");
  copyName("discount","select");
  copyName("discount-charge","inner");
  copyName("amount-letter-field","inner");
  copyName("total","inner");
  evt.currentTarget.className += " active";
}

/* Function to read the xml string from local memory and return ConceptNodes
   Used: receipts.html
*/
function parseXml(xmlStr) {
  //console.log("parseXml -> xmlStr:" + xmlStr );
  var xml = localStorage.getItem(xmlStr);
  return new window.DOMParser().parseFromString(xml, "text/xml");
}

/* Function to create the conceptsNode array reading from the internal memory
   used: receipts.html
*/
function createNodesFromLocalStorage(itemtype) {
  //console.log("createNodesFromLocalStorage -> itemtype:" + itemtype );
  var leng = itemtype.length;
  var tag = itemtype.substring(0, (leng-1));
  var xmlStr = parseXml(itemtype);
  var itemNode = xmlStr.getElementsByTagName(tag);
  var numitems = itemNode.length;
  itemNodes = [];
  var i = 0;
  for (; i < numitems; i++) {
    var item;
    if (itemtype == "concepts") {
      item = {
        nam: itemNode[i].getAttribute("name"),
        pric: itemNode[i].getAttribute("price")
      };
    }
    else {
      item = {
        nam: itemNode[i].getAttribute("name"),
        amount: itemNode[i].getAttribute("amount"),
        type: itemNode[i].getAttribute("type")
      };
    }
    itemNodes.push(item);
  }
  return itemNodes;
}


/* Function to fill ConceptsArray array, with the ConceptNodes array
   Used: receipts.html, configuration.html
   itemtype: descs, discnts
*/
function fillItemsArray(itemtype) {
  //console.log("fillItemsArray -> itemtype:" + itemtype );
  if ((itemtype == "descs") || (itemtype == "all")) {
    var conceptsNodes = createNodesFromLocalStorage("concepts");
    conceptsArray = [];
    pricesArray = [];
    var numItems = conceptsNodes.length;
    for (i = 0; i < numItems; i++) {
      conceptsArray.push(conceptsNodes[i]);
      pricesArray[conceptsNodes[i].nam] = conceptsNodes[i].pric;
    }
    conceptsArray = sortArrays(conceptsArray);
  }
  if ((itemtype == "discnts") || (itemtype == "all")) {
    var discountsNodes = createNodesFromLocalStorage("discounts");
    discountsArray = [];
    amountsArray = [];
    typesArray = [];
    var numItems = discountsNodes.length;
    for (i = 0; i < numItems; i++) {
      discountsArray.push(discountsNodes[i]);
      amountsArray[discountsNodes[i].nam] = discountsNodes[i].amount;
      typesArray[discountsNodes[i].nam] = discountsNodes[i].type;
    }
    discountsArray = sortArrays(discountsArray);
  }
}

/* function to order the array in alphabetic order
  used: configuration.html
  itemsArray: array with the concepts or discountSel*/

function sortArrays(itemsArray) {
  //console.log("sortArrays -> itemsArray:" + itemsArray );
  itemsArray.sort(function(a, b) {
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
  return itemsArray;
}

/* Function to fill the combo box with the values in the ConceptsArray
   Used: receipts.html, configuration.html
   itemtype: descs, discnts, receipts
*/
function displayItems(itemtype) {
  //console.log("displayItems -> itemtype:" + itemtype );
  var data = [];
  var todescs = [];
  var todiscnts = [];
  var itemsArray;
  if (itemtype == "receipts") {
    const recnot = ["r","n"];
    for (rn in recnot) {
      for (i=1;i<7;i++) {
        todescs.push("description-"+i+"-cli-" + recnot[rn]);
      }
      todiscnts.push("discount-cli-" + recnot[rn]);
    }
    data.push({label: "conceptsArray", value: todescs});
    data.push({label: "discountsArray", value: todiscnts});
  }
  if ((itemtype == "configuration") || (itemtype == "descs")) {
    todescs.push("descs");
    data.push({label: "conceptsArray", value: todescs});
  }
  if ((itemtype == 'configuration') || (itemtype == "discnts")) {
    todiscnts.push("discnts");
    data.push({label: "discountsArray", value: todiscnts});
  }
  for (dat in data) {
    for (tod in data[dat].value) {
      var menu = document.getElementById(data[dat].value[tod]);
      if (data[dat].label == "conceptsArray" ) {
        itemsArray = conceptsArray;
      }
      else {
        itemsArray = discountsArray;
      }
      for (i = 0; i < itemsArray.length; i++) {
        var newOption = document.createElement("option");
        newOption.innerHTML = itemsArray[i].nam;
        menu.appendChild(newOption);
      }
    }

  }
}

/* Function to clear combo boxes and concept items in client and business receipts
   Used: receipts.html
*/
function clearFields() {
  //console.log("clearFields ->  ");
  var pagetype = document.getElementById("pagetype").innerHTML;
  var selects = "";
  var prices = "";
  var i = 1;
  for (; i < 7; i++) {
    selects = "description-" + i + "-cli";
    prices = "price-field-" + i + "-cli";
    document.getElementById("quantity-field-" + i + "-cli-" + pagetype).value = "";
    copyName("quantity-field-" + i,"values");
    document.getElementById("description-" + i + "-cli-" + pagetype).selectedIndex = "0";
    copyName("description-" + i,"select");
    //document.getElementById("description-" + i + "-bus").value = "";
    document.getElementById("itemprice-field-" + i + "-cli-" + pagetype).value = "";
    copyName("itemprice-field-" + i,"values");
    document.getElementById("price-field-" + i + "-cli-" + pagetype).innerHTML = "";
    copyName("price-field-" + i,"inner");
  }
  document.getElementById("receipt-num-cli-" + pagetype).innerHTML = "";
  copyName("receipt-num","inner");
  document.getElementById("client-name-field-cli-" + pagetype).value = "";
  copyName("client-name-field","values");
  document.getElementById("date-field-cli-" + pagetype ).value = "";
  copyName("date-field","values");
  document.getElementById("amount-letter-field-cli-" + pagetype).innerHTML = "";
  copyName("amount-letter-field","inner");
  document.getElementById("subtotal-cli-" + pagetype).innerHTML = "";
  copyName("subtotal","inner");
  document.getElementById("discount-cli-" + pagetype).selectedIndex = "0";
  copyName("discount","select");
  document.getElementById("discount-charge-cli-" + pagetype).innerHTML = "";
  copyName("discount-charge","inner");
  document.getElementById("total-cli-" + pagetype).innerHTML = "";
  copyName("total","inner");


}

/* Function to get the new receipt number non billiable and billiable
   Used: receipts.html
   invoice: 1 -> receipt, 0 -> note
*/
function receiptNum(invoice) {
  //console.log("receiptNum -> invoice:" + invoice );
  var nexnumber;
  var pagetype = document.getElementById("pagetype").innerHTML;
  if (typeof(Storage) !== "undefined") {
    if (pagetype == 'n') {
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
    document.getElementById("receipt-num-cli-" + pagetype).innerHTML = "No. " + nextnumber;
  } else {
    document.getElementById("receipt-num-cli-" + pagetype).innerHTML = "ERROR";
  }
  copyName("receipt-num", "inner");
  document.getElementById("date-field-cli-" + pagetype).value = getTodayDate();;
  copyName("date-field", "values");
}

/* Function that gets today date
   Used: receipts.html
*/
function getTodayDate() {
  //console.log("getTodayDate ->" );
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
  //console.log("findTotal ->");
  var pagetype = document.getElementById("pagetype").innerHTML;
  var prices = document.getElementsByName('item-price-' + pagetype);
  var quantities = document.getElementsByName('quantity-' + pagetype);
  var tot = 0;
  for (var i = 0; i < prices.length; i++) {
    if ((prices[i].value) && (quantities[i].value)) {
      linetotal =  ((localStringToNumber(prices[i].value) * (localStringToNumber(quantities[i].value)))) * 100;
      document.getElementById('price-field-'+(i+1)+'-cli-'+ pagetype).innerHTML = giveFormat(linetotal / 100);
      copyName('price-field-'+(i+1),"inner");
      tot +=linetotal;
    }
  }
  var floatNumber = tot / 100;
  document.getElementById('subtotal-cli-'+ pagetype).innerHTML = giveFormat(tot / 100);
  copyName("subtotal","inner");

  var discountSel = document.getElementById('discount-cli-' + pagetype).value;
  var discountamount = localStringToNumber(amountsArray[discountSel]);
  var discounttype = typesArray[discountSel];
  if (discountSel != "") {
    if (discounttype == "Relativo") {
      discountamount = (floatNumber * discountamount);
    }
    else {
      discountamount = (discountamount * 100);
    }
    document.getElementById('discount-charge-cli-'+ pagetype).innerHTML = giveFormat(discountamount / 100);
    copyName("discount-charge","inner");
    tot = tot - discountamount;
  }
  else {
    document.getElementById('discount-charge-cli-'+ pagetype).innerHTML = "$ 0.00";
    copyName("discount-charge", "inner");
  }
  document.getElementById('total-cli-'+ pagetype).innerHTML = giveFormat(tot / 100);
  copyName("total", "inner");
  numberToLetters(tot / 100);
}

//Write number in letters
// n is 1- or 2-digit number
function convertToWords(n) {
  //console.log("convertToWords -> n:" + n );
  var str = "";
  var ones = ["","un","dos","tres","cuatro","cinco","seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce","quince",
            "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte", "veintiuno", "veintidós", "veintitrés", "veinticuatro",
            "veinticinco", "veintiséis", "veintisiete", "veintiocho", "veintinueve"];
  var tens = ["","","","treinta","cuarenta","cincuenta", "sesenta", "setenta","ochenta", "noventa"];
  var hundreds = ["","ciento","doscientos","trecientos","cuatrocientos","quinientos", "seiscientos", "setecientos","ochocientos", "novecientos"];

  var cal = Math.floor(n / 1000000);
  if ((cal > 0) && (cal < 1000000))  {
    str = convertToWords(cal)
    if (cal == 1) {
      str = str + " millón";
    } else {
      str = str + " millones";
    }
    if ((n % 1000000) > 0) {
      str = str + " " + convertToWords(n % 1000000);
    }
    return str;
  }

  cal = Math.floor(n / 1000);
  if ((cal > 0) && (cal < 1000))  {
    if (cal == 1)
      str = " mil";
    else
      str = convertToWords(cal) + " mil";
    if ((n % 1000) > 0) {
      str = str + " " + convertToWords(n % 1000);
    }
    return str;
  }

  cal = Math.floor(n / 100);
  if ((cal > 0) && (cal < 10))  {
    if ((cal == 1) && ((n % 100) == 0)) {
      str="cien";
    }
    else {
      str = hundreds[cal] ;
    }
    if ((n % 100) > 0) {
      str = str + " " + convertToWords(n % 100);
    }
    return str;
  }
  if (n < 30) {
    return ones[n];
  }
  cal = Math.floor(n / 10);
  if ((cal > 0) && (cal < 10)) {
    str = str + tens[cal];
    if ((n % 10) > 0) {
      str = str + " y " + convertToWords(n % 10);
    }
    return str;
  }
}

/* function to convert a number to words.
  used on receipts.html
  num: the number to convert
  */
function numberToLetters(num) {
  //console.log("numberToLetters -> num:" + num );
    var enters, cents, letters
    var negative = ""
    if (num < 0) {
      letters = "menos ";
      num = num * -1;
    }
    enters = Math.floor(num);
    cents = Math.round((num - enters).toFixed(2) * 100);
    if (num == "0.00") {
      letters = "Cero pesos."
    }
    else {
      if (enters == "1") {
        letters = "un peso";
      } else {
        letters = convertToWords(enters) + " pesos";
      }

    }
    if (cents == 0)
      letters = letters + ".";
    else
      letters = letters + " con " +convertToWords(cents)+ " centavos." ;
    pagetype = document.getElementById("pagetype").innerHTML;

    //letters = negative +" " + enters + " " + cents;
    document.getElementById("amount-letter-field-cli-" + pagetype).innerHTML=letters;
    copyName("amount-letter-field","inner");
}

/* Function to get the price from the combo box selection
   Used: receipts.html
   rowNum: the row number to get the price
*/
function getPrice(rowNum) {
  //console.log("getPrice -> rowNum:" + rowNum );
  var pagetype = document.getElementById("pagetype").innerHTML;
  var ending = "-cli-" + pagetype;
  var selectNum = "description-" + rowNum;
  var itemPriceNum = "itemprice-field-" + rowNum;
  var priceNum = "price-field-" + rowNum;
  var quantityNum = "quantity-field-" + rowNum;
  var conceptSel = document.getElementById(selectNum + ending).value;
  var chargeValue = localStringToNumber(pricesArray[conceptSel]);
  if (conceptSel != "") {
    document.getElementById(itemPriceNum + ending).value = giveFormat(chargeValue);
    var quantity = document.getElementById(quantityNum + ending).value;
    if (quantity == "") {
      document.getElementById(quantityNum + ending).value = "1";
    }
  }
  else {
	  document.getElementById(quantityNum + ending).value  = "";
    copyName(quantityNum, "values");
    document.getElementById(itemPriceNum + ending).value  = "";
    document.getElementById(priceNum + ending).innerHTML  = "";
    copyName(priceNum, "inner");
  }
  //document.getElementById(selectNum + "-bus").value = conceptSel;
  copyName(selectNum, "values");
  copyName(quantityNum, "values");
  copyName(itemPriceNum, "values");
  findTotal();
}

/* function to get the discount amount and calculate the discount amount.
  used: receipts.html
  */
function getDiscount() {
  //console.log("getDiscount -> "  );
  var pagetype = document.getElementById("pagetype").innerHTML;
  var subtotal =  parseFloat(document.getElementById("subtotal-cli-"+ pagetype).innerHTML.substring(1));
  var conceptSel = document.getElementById("discount-cli-"+ pagetype).value;
  if (Number.isNaN(subtotal)) {
    openModalMessage("\nNo se puede aplicar descuento si no hay cargos.");
    document.getElementById("discount-cli-"+ pagetype).selectedIndex = "0";
    return;
  }
  if (subtotal <= 0.0) {
    openModalMessage("\nNo se puede aplicar descuento a esa cantidad.");
    document.getElementById("discount-cli-"+ pagetype).selectedIndex = "0";
    return;
  }
  if (conceptSel == "") {
    document.getElementById("discount-charge-cli-"+ pagetype).innerHTML= "$0.00";
    copyName("discount-charge","inner");
  }
  copyName("discount", "values");
  findTotal();
}


/* Function clean the input number as a positve or negative number
   Used: receipts.html and configuration
   value: the string to change to number
*/
function localStringToNumber(value) {
  //console.log("localStringToNumber -> value:" + value );
  var noInvalidChars = String(value).replace(/[^0-9.-]+/g, "");
  var negative = 1;
  if (noInvalidChars.indexOf("-") == 0) {
    negative = "-1";
  }
  noInvalidChars = String(value).replace(/[^0-9.]+/g, "");
  if (noInvalidChars.length == 0) {
    noInvalidChars = 0;
  }
  var review = Number(noInvalidChars) * negative;
  return review;
}

/* Function to give format of currency to the value
   Used: receipts.html and cofiguration.html
   value: the number to be converted in currency format
*/
function giveFormat(value) {
  //console.log("giveFormat -> value:" + value );
  const formatter = new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    currency: 'MXN',
    style: "currency"
  })
  var newvalue = formatter.format(localStringToNumber(value));
  return newvalue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



/* Function to evaluate the price of all items in the line
   Used: receipts.html
   rowNum: the line number to get the charge
*/
function itemCharge(rowNum) {
  //console.log("itemCharge -> rowNum:" + rowNum );
  var pagetype = document.getElementById("pagetype").innerHTML;
  var ending = "-cli-" + pagetype;
  var quantityNum = "quantity-field-" + rowNum;
  var selectNum = "description-" + rowNum;
  var itemPriceNum = "itemprice-field-" + rowNum;
  var quantity = document.getElementById(quantityNum + ending).value;
  var price = document.getElementById(itemPriceNum + ending).value;
  var desc = document.getElementById(selectNum + ending).value;
  if ((price != "" )  && (desc == "")) {
    openModalMessage("\nPara cambiar de precio se necesita un producto.");
    document.getElementById(itemPriceNum + ending).value = "";
    copyName(itemPriceNum,"values");
    return
  }
  if (quantity == "") {
    if (price != "" ) {
      openModalMessage("\nEn el campo Cantidad se necesita un valor.");
      document.getElementById(quantityNum + ending).value= "1";
      copyName(quantityNum,"values");
      return
    }
  }
  else {
    if (quantity <= "0") {
      openModalMessage("\nLa Cantidad no puede ser menor a uno.");
      document.getElementById(quantityNum + ending).value= "1";
      copyName(quantityNum,"values");
      return;
    }
  }
  copyName(quantityNum, "values");
  var itemPriceNum = "itemprice-field-" + rowNum;
  if ((price == "") && (desc != "")) {
    openModalMessage("\nEl precio no puede estar vacio si hay un producto.");
    getPrice(rowNum);
    return;
  }
  if ( price != "" ) {
    chargeFormat(itemPriceNum + ending);
  }
	copyName(itemPriceNum, "values");
	findTotal();
}

/* Function gets a value from a input text and putback the same value in currency format
   Used: receipt.html, configuration
   priceNum: the element id to give currency format
*/
function chargeFormat(priceNum) {
  //console.log("chargeFormat -> priceNum:" + priceNum );
  var value = giveFormat(document.getElementById(priceNum).value);
  document.getElementById(priceNum).value = value;
  return value;
}


/* Function that takes the value from discount amount and review if it is
  porcentage or currency and put back the number in correct format and returns the same number
  Used: configuration.html
*/
function getProperFormat() {
  //console.log("getProperFormat -> " );
  var formattype = document.getElementById("discntTypeRel").checked;
  var discountamount = document.getElementById("discnts-amount").value;
  //console.log("discountamount: " + discountamount);
  var formatedamount;
  if (formattype) {
    document.getElementById("discntsAmountLabel").innerHTML = "Porcentaje"
    formatedamount = localStringToNumber(discountamount) + "%";
  }
  else {
    document.getElementById("discntsAmountLabel").innerHTML = "Monto"
    formatedamount = giveFormat(discountamount);
  }
  document.getElementById("discnts-amount").value = formatedamount;
  return(formatedamount);
}

/* Function to print the receipt.
   Used: receipt.html
*/
function printReceipt() {
  //console.log("printReceipt -> " );
  window.print();
}

/* Function to copy the values from client receipt to business receipt
   Used: receripts.hmtl
   inputfield: is the name of the field from client receipt without the cli-r or cli-n
   source: source type inner, select, value
*/
function copyName(inputField, source) {
  //console.log("copyName -> inputField:" + inputField + "source:" + source );
  var pagetype = document.getElementById("pagetype").innerHTML;
  var inputFieldBus = inputField + "-bus";
  var values;
  if (source == "inner") {
    values=document.getElementById(inputField + "-cli-"+pagetype).innerHTML;
      document.getElementById(inputFieldBus).innerHTML = values;
  }
  else if (source == "value" ){
    values= document.getElementById(inputField + "-cli-"+pagetype).value;
    document.getElementById(inputFieldBus).value =values;
  }
  else {
    values = document.getElementById(inputField + "-cli-"+ pagetype).value;
    document.getElementById(inputFieldBus).innerHTML = values;
  }
}


/* Function to change the prefix of the invoices
   Used: configuration.html
*/
function changePrefix() {
  //console.log("changePrefix -> " );
  localStorage.noInvoicePrefix = document.getElementById("no-invoice-prefix").value;
  document.getElementById("no-invoice-prefix").value = localStorage.noInvoicePrefix;
  openModalMessage("\nPrefijo se cambio satisfactoriamente a: \"" + localStorage.noInvoicePrefix + "\".\n");
}
``
/* Function to validate the input value for the next folio
   used: configuration.html, receipts.html
   num: number to be validated
*/
function validateCorrectNumber(num) {
  //console.log("validateCorrectNumber -> num:" + num );
    return /^-?\d+$/.test(num);
}

/* Function to change receipt number for non billiable or billiable
   Used: configuation.html
   invoice: 0 for notes and 1 for receipts
*/
function changeReceiptNum(invoice) {
  //console.log("changeReceiptNum -> invoice:" + invoice );
  if (typeof(Storage) !== "undefined") {
    var message;
    var nextNumber = 0;
    if (invoice == 0) {
      nextNumber = document.getElementById("num-receipt-no-invoice").value;
      if (validateCorrectNumber(nextNumber)) {
        localStorage.nonBillReceiptNum = nextNumber - 1;
        message = "\n\nEl folio para nota se cambio satisfactoriamente a: " +nextNumber + ".";
      } else {
        document.getElementById("num-receipt-no-invoice").value =  localStorage.nonBillReceiptNum;
        message = "\n\nEl valor no es numerico o es nulo, favor de revisarlo.";
      }
    } else {
      nextNumber = document.getElementById("num-receipt-invoice").value;
      if (validateCorrectNumber(nextNumber)) {
        localStorage.billReceiptNum = nextNumber - 1;
        message = "\n\nEl folio para recibo se cambio satisfactoriament a: " +nextNumber + ".";
      } else {
        document.getElementById("num-receipt-invoice").value =  localStorage.billReceiptNum;;
        message = "\n\nEl valor no es numerico o es nulo, favor de revisarlo.";
      }

    }
    openModalMessage(message);
  } else {
    document.getElementById("num-receipt-no-invoice").innerHTML = "ERROR";
    document.getElementById("num-receipt-invoice").innerHTML = "ERROR";
    message = "\n\nError al cambiar el número de folio.\n";
    openModalMessage(message);
  }
}


/*function to remove all values from the drop downlist
  used: configuration.innerHTML
  list: list to be cleaned
*/
function removeValuesDropDownList(list) {
  //console.log("removeValuesDropDownList -> list:" + list );
  var dropList= document.getElementById(list);
  var i;
  for (i = dropList.options.length - 1; i >= 0; i--) {
    dropList.remove(i);
  }
}

/* function to laad all the list to the combo box from the concepts array in memory
  used: configuration.html  */
function loadToComboBox() {
  //console.log("loadToComboBox -> ");
  var i;
  fillItemsArray("All");
  var comboBox = document.getElementById("descs");
  removeValuesDropDownList(comboBox);
  var conceptsLength = conceptsArray.length;
  for (i = 0; i < conceptsLength; i++) {
    var newOption = document.createElement("option");
    newOption.innerHTML = conceptsArray[i].nam;
    comboBox.appendChild(newOption);
  }
}

/*function to show and hide the configuration concepts fields
  used: configuration.html
  actiontype: cancel, delete, add, update
  typeofconf: descs, discnts
*/
function enableUpAdDel(actiontype, typeofconf) {
  //console.log("enableUpAdDel -> actiontype:" + actiontype + " |typeofconf:" + typeofconf );
  var display;
  var disable = true;
  document.getElementById(typeofconf + "ConfigUpdateButton").disabled = disable;
  document.getElementById(typeofconf + "ConfigDeleteButton").disabled = disable;
  //document.getElementById(typeofconf + "UpdateButton").style.display = "none";
  //document.getElementById(typeofconf + "SaveButton").style.display = "none";
  if ( actiontype == "cancel") {
    display = "none";
    document.getElementById(typeofconf + "ConfigBox").style.border = "none";
    document.getElementById(typeofconf + "ConfigAddButton").disabled = false;
    document.getElementById(typeofconf).disabled = false;
    document.getElementById(typeofconf + "SaveButton").style.display = display;
    document.getElementById(typeofconf + "UpdateButton").style.display = display;
    //document.getElementById(typeofconf + "DeleteButton").style.display = display;
    document.getElementById(typeofconf + "-name").readOnly = false;
    document.getElementById(typeofconf + "-amount").readOnly = false;
    getSelectedItem(typeofconf);
  }
  else {
    var description;
    if (typeofconf == "descs") {
      description = "Cargo";
    }
    else {
      description = "Descuento";
    }
    if (actiontype == "delete") {
      var message;
      var conceptDiscntSel = document.getElementById(typeofconf).value;
      if (typeofconf == "descs") {
        var price = pricesArray[conceptDiscntSel];
        message = "\n¿Estas seguro que quieres borrar el cargo \"" + conceptDiscntSel +"\"\ncon monto de: $"+ price +" pesos?";
      }
      else {
        var amount = amountsArray[conceptDiscntSel];
        var distype = typesArray[conceptDiscntSel];
        if (distype == "Relativo") {
          message = "\n¿Estas seguro que quieres borrar el descuento: \""+ conceptDiscntSel +"\" de tipo \"" + distype + "\" y con un monto de \"" + amount +"%\"?\n";
        } else {
          message = "\n¿Estas seguro que quieres borrar el descuento \"" +conceptDiscntSel +"\" de tipo \"" + distype + "\" y con un monto de \"" + amount +" pesos\"?\n";
        }
      }
      openModalConfirm("deleteConDis ('"+typeofconf+"','"+description+"','"+conceptDiscntSel+"')", message, typeofconf) ;
      return;
    }
    display = "block";
    document.getElementById(typeofconf + "ConfigBox").style.border = "solid";
    document.getElementById(typeofconf + "ConfigBox").style.borderColor = "#0066CC";
    document.getElementById(typeofconf + "ConfigAddButton").disabled = true;
    if ( actiontype == "add") {
      document.getElementById(typeofconf + "SaveButton").style.display = display;
      document.getElementById(typeofconf + "UpdateButton").style.display = "none";
      //document.getElementById(typeofconf + "DeleteButton").style.display = "none";
      document.getElementById(typeofconf + "ActionTitle").innerHTML="Agregar " + description + ".";
      document.getElementById(typeofconf).value = "";
      document.getElementById(typeofconf + "-name").value="";
      document.getElementById(typeofconf + "-amount").value="";
      document.getElementById(typeofconf).disabled = false;
    }
    else {
      document.getElementById(typeofconf + "UpdateButton").style.display = display;
      document.getElementById(typeofconf + "SaveButton").style.display = "none";
      //document.getElementById(typeofconf + "DeleteButton").style.display = "none";
      document.getElementById(typeofconf + "ActionTitle").innerHTML="Cambiar " + description + ".";
    }
  }
  document.getElementById(typeofconf + "configconfiginnerbox").style.display = display;
}

/* Function to delete a concept or discount
  Used: configuration.html
  typeofconf: descs, discnts
  description: "cargo", "descuento"
  conpetDiscntSel: the name of the concept to delete
*/
function deleteConDis (typeofconf,description,conceptDiscntSel) {
  //console.log("deleteConDis -> typeofconf:" + typeofconf + " |description:" + description + " |description:" + conceptDiscntSel);
    var modal = document.getElementById("modal-confirm");
    modal.style.display = "none";
    deleteConcept(typeofconf);
    document.getElementById(typeofconf + "-amount").value = "";
    document.getElementById(typeofconf +"-name").value = "";
    openModalMessage("\n\n¡El "+ description+ " \"" + conceptDiscntSel + "\" fue borrado exitosamente!")
}

/* Function to show the Add concept fields
  Used: configuration.html
  actiontype: [Crear, Cambiar, Borrar]
  typeofconf: descs, discnts
*/
function showConceptFields (actiontype,typeofconf) {
  //console.log("showConceptFields -> actiontype:" + actiontype + " |typeofconf:" + typeofconf );
  enableUpAdDel(actiontype,typeofconf);
  if ( actiontype == "create") {
    document.getElementById("descs").value = "";
    document.getElementById("concept-name").value="";
    document.getElementById("price-amount").value="";
  }
}

/* Function to get the amount without any character from amount field.
   Used: configuration.html
   typeofconf: descs, discnts
*/
function getamountvalue(typeofconf) {
  //console.log("getamountvalue -> typeofconf:" + typeofconf );
    var amountvalue = document.getElementById(typeofconf + "-amount").value;
    //console.log("getamountvalue -> amountvalue: "+amountvalue);

    if ((typeofconf == "discnts") && (document.getElementById("discntTypeRel").value)) {
      if (amountvalue.length == 0) {
        openModalMessage("\n\n¡¡¡ERROR!!!\n\nEl porcentaje no puede estar vacio.");
        return "error";
      }
      amountvalue=amountvalue.substring(0,amountvalue.length-1);
      return amountvalue;
    }
    if (amountvalue.length == 0) {
      openModalMessage("\n\n¡¡¡ERROR!!!\n\nEl monto no puede estar vacio.");
      return "error";
    }
    return giveFormat(amountvalue).substring(1);
}

/* Function to validate if the concecpt or discount already exists
  Used: configuration.html
  typeofconf: descs, discnts
  des: description of the concept or discount.
  returns: true if exists false if doesn't exists
*/
function validateIfExists(typeofconf,des) {
  //console.log("validateIfExists -> des:" + des + " |typeofconf:" + typeofconf );
    var conceptdiscArray;
    if (typeofconf == "descs") {
      conceptdiscArray = conceptsArray;
    }
    else {
      conceptdiscArray = discountsArray;
    }
    for (var i = 0; i < conceptdiscArray.length; i++) {
      if (conceptdiscArray[i].nam == des) {
        return true;
      }
    }
    return false;
}

/* Function to add, update and delete a concept or discount
   Used: configuration.html
   action: add, update, delete
   typeofconf: descs, discnts
*/
function configureConceptDiscount(action, typeofconf) {
  console.log("configureConceptDiscount -> action:" + action + " |typeofconf:" + typeofconf );
  var conceptdisc;
  var conceptdiscArray;
  var description;
  var name = document.getElementById(typeofconf + "-name").value;
  if (name.length == 0) {
    openModalMessage("\n\n¡¡¡ERROR!!!\n\nLa descripción no puede estar vacia.");
    return;
  }
  var amount = getamountvalue(typeofconf);
  if (amount == "error") {
    return;
  }
  if (typeofconf == "descs") {
    conceptdisc = {
      nam: name,
      pric: amount
    };
    conceptdiscArray = conceptsArray;
    description = "cargo";
  }
  else {
    var disctype;
    conceptdiscArray = discountsArray;
    description = "descuento";
    if (document.getElementById("discntTypeRel").checked) {
      disctype="Relativo";
    }
    else {
      disctype="Absoluto";
    }
    conceptdisc = {
      nam: name,
      amount: amount,
      type: disctype
    };
  }
  if (validateIfExists()) {
    message = "\n\n¡¡¡ERROR!!!\n\n¡El "+ description+ " \"" + conceptdisc.nam + "\" ya existe!";
    return;
  }
  message = "\n\n¡El "+ description+ " \"" + conceptdisc.nam + "\" se agregó exitosamente!";
  if (action == "update") {
    deleteConcept(typeofconf);
    message = "\n¡El "+ description+ " \"" + conceptdisc.nam + "\" se modificó exitosamente!";
  }
  addItem(typeofconf,conceptdisc);
  enableUpAdDel("cancel", typeofconf);
  openModalMessage(message);
}

/* Function to add a new concept
   Used: configuation.html
   itemtype: descs, discnts
   item: strict with the nam, pric or amount, type
*/
function addItem(itemtype, item) {
  //console.log("addItem -> itemtype:" + itemtype + " |item:" + item );
  addItems(itemtype, item);
  removeValuesDropDownList(itemtype);
  displayItems(itemtype);
}

/* Function to add the concept to the internal memory.
   Used: conficuration.html
   xmlsection: concepts, discounts
*/
function addItemToItems(xmlsection) {
  //console.log("addItemToItems -> xmlsection:" + xmlsection );
  var xmlStr = "<doc>\n\t<" + xmlsection +">\n";
  if (xmlsection == "concepts") {
    for (i = 0; i < conceptsArray.length; i++) {
      xmlStr = xmlStr + "\t\t<concept name=\"" + conceptsArray[i].nam + "\" price=\"" + conceptsArray[i].pric + "\"/>\n";
    }
  }
  else {
    for (i = 0; i < discountsArray.length; i++) {
      xmlStr = xmlStr + "\t\t<discount name=\"" + discountsArray[i].nam + "\" amount=\"" + discountsArray[i].amount + "\" type=\""  + discountsArray[i].type + "\"/>\n";
    }
  }
  xmlStr = xmlStr + "\t</" + xmlsection +">\n</doc>";
  localStorage.setItem(xmlsection, xmlStr);
}

/* Function to get the concept selected in the combo box.
   Used: Configuarion.html
*/
function getSelectedItem(typeofconf) {
  //console.log("getSelectedItem -> typeofconf:" + typeofconf );
  var conceptSel = document.getElementById(typeofconf).value;
  var disable;
  var price, distype;
  document.getElementById(typeofconf+"-name").value = conceptSel;
  if (typeofconf == "descs") {
    price = pricesArray[conceptSel];
    document.getElementById(typeofconf+"-amount").value = giveFormat(price);
  } else {
    price = amountsArray[conceptSel];
    if (typesArray[conceptSel]=="Relativo") {
      document.getElementById("discntTypeRel").checked=true;
      document.getElementById("discntTypeAbs").checked=false;
    }
    else {
      document.getElementById("discntTypeRel").checked=false;
      document.getElementById("discntTypeAbs").checked=true;
    }
    document.getElementById(typeofconf+"-amount").value = price;
    getProperFormat();
  }
  if (conceptSel == "") {
    disable = true;
  } else {
    disable = false;
  }
  document.getElementById(typeofconf + "ConfigUpdateButton").disabled = disable;
  document.getElementById(typeofconf + "ConfigDeleteButton").disabled = disable;
}

/* Function delete concept from the concepts.
   Used: configuration.html
   typeofconf: descs, discnts
*/
function deleteConcept(typeofconf) {
  //console.log("deleteConcept -> typeofconf:" + typeofconf );
  var selects = document.getElementById(typeofconf);
  var conceptDiscDel = selects.value;
  deleteFromLocal(conceptDiscDel, typeofconf);
  fillItemsArray(typeofconf);
  selects.remove(selects.selectedIndex);
  document.getElementById(typeofconf + "-amount").value = "";
  document.getElementById(typeofconf + "-name").value = "";
}

/* Function to delete the concept to the internal memory
   used: configuration.html
   item: item name to delete
   typeofconf: descs, discnts
*/
function deleteFromLocal(item, typeofconf) {
  //console.log("deleteFromLocal -> item: " + item +" |typeofconf:" + typeofconf );
  var xmlStr;
  if (typeofconf == "descs" ) {
    xmlStr = "<doc>\n\t<concepts>\n";
    for (var i = 0; i < conceptsArray.length; i++) {
      if (conceptsArray[i].nam != item) {
        xmlStr = xmlStr + "\t\t<concept name=\"" + conceptsArray[i].nam + "\" price=\"" + conceptsArray[i].pric + "\"/>\n";
      }
    }
    xmlStr = xmlStr + "\t</concepts>\n</doc>";
    localStorage.setItem("concepts", xmlStr);
  }
  else {
    xmlStr = "<doc>\n\t<discounts>\n";
    for (var i = 0; i < discountsArray.length; i++) {
      if (discountsArray[i].nam != item) {
        xmlStr = xmlStr + "\t\t<discount name=\"" + discountsArray[i].nam + "\" amount=\"" + discountsArray[i].amount + "\" type=\""  + discountsArray[i].type + "\"/>\n";
      }
    }
    xmlStr = xmlStr + "\t</discounts>\n</doc>";
    localStorage.setItem("discounts", xmlStr);
  }
}

/* Function to go to the concept page
   Used: configuration.html
*/
function goToConepts() {
  //console.log("goToConepts ->  " );
    window.location = "concepts.html";
}

/* Function to load all the concepts and discounts to the interal sortArrays
  used : concepts.html
  itemtype: descs, discnts
  item: struct to add {nam, pric or amount, type}
   */
function addItems(itemtype, item) {
  //console.log("addItems -> item: " + item +" |itemtype:" + itemtype );
  var xmlsection;
  if (itemtype == "descs") {
    conceptsArray.push(item);
    xmlsection="concepts";
  } else {
      discountsArray.push(item);
      xmlsection="discounts";
  }
  addItemToItems(xmlsection);
  fillItemsArray(itemtype);
}


/* Function to load all the concepts and discounts to the internal sortArrays
  used : concepts.html
   */
function loadConcepts() {
  //console.log("loadConcepts -> " );
  document.getElementById("modal-confirm").style.display = "none";
  conceptsArray=[];
  discountsArray=[];
  var concepttable = document.getElementById( "tableConcepts" );
  for ( var i = 1; i < concepttable.rows.length; i++ ) {
    var conceptstruct = {
      nam: concepttable.rows[i].cells[1].innerHTML,
      pric: concepttable.rows[i].cells[2].innerHTML.substring(2)
    };
    addItems("descs", conceptstruct);
  }
  var discounttable = document.getElementById( "tableDiscounts" );
  for ( var i = 1; i < discounttable.rows.length; i++ ) {
    var discamount;
    var distype = discounttable.rows[i].cells[3].innerHTML;
    if (distype == "Absoluto") {
      discamount = discounttable.rows[i].cells[2].innerHTML.substring(2);
    }
    else {
      discamount = discounttable.rows[i].cells[2].innerHTML;
      var chars = (discamount.length-1);
      discamount = discamount.substring(0,chars);
    }
    var discountstruct = {
      nam: discounttable.rows[i].cells[1].innerHTML,
      amount: discamount,
      type: distype
    };
    addItems("discnts", discountstruct);
  }
  openModalMessage("Cargos y descuentos se cargaron exitosamente.");
}

/* Function to download all the descriptions from memory to a concepts.html file
   used: configuraion.innerHTML
   filename: the name of the file to write
   text: the text to be written in the file
*/
function download(filename, text) {
  //console.log("loadConcepts -> filename: " + filename +" |text:" + text );
  var filename = "concepts.html";
  var firstCol="<tr><td>";
  var secondCol="</td><td>";
  var lastCol="</td></tr>";
  var text = document.getElementById("before-table").value;
  for (var i = 0; i < conceptsArray.length; i++) {
    text = text + firstCol + (i+1) + secondCol + conceptsArray[i].nam + secondCol + "$ " +conceptsArray[i].pric + lastCol;
  }
  text = text + document.getElementById("middle-table").value;
  for (var i = 0; i < discountsArray.length; i++) {
    //console.log(discountsArray[i].nam);
    var discount = "$ " + discountsArray[i].amount;
    if (discountsArray[i].type == "Relativo") {
      discount = discountsArray[i].amount + "%";
    }
    text = text + firstCol + (i+1) + secondCol + discountsArray[i].nam + secondCol + discount  + secondCol  + discountsArray[i].type + lastCol;
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
  openModalMessage("Archivo \"concepts.html\" fue guardado exitosamente en la carpeta de \"Descargas\".<p>*Nota: Recuerda moverlo al directorio correspondiente y reemplazar el archivo existente.");
}

/* Function to show the confirmation window
   used: configuraion.html, concepts.html
   todo: the name of the function to call in case of yes button pressed
   typeofconf: descs or discnts
   message: the text to be written in the window
*/
function openModalConfirm(todo, message, typeofconf) {
  //console.log("openModalConfirm -> todo:" + todo + " |message:" + message );
  var modal = document.getElementById("modal-confirm");
  modal.style.display = "block";
  document.getElementById("modal-confirm-message").innerHTML=message;
  //console.log(  "javascript: "+todo+"();" )
  document.getElementById("modal-yes").setAttribute( "onClick", "javascript: "+todo+";" );
  document.getElementById("modal-yes").focus();
  var modalno = document.getElementById("modal-no");
  modalno.onclick = function() {
    if ( typeofconf) {
      document.getElementById(typeofconf + "ConfigUpdateButton").disabled = false;
      document.getElementById(typeofconf + "ConfigDeleteButton").disabled = false;
    }
    modal.style.display = "none";
  }
  var span = document.getElementById("modal-close-confirm");
  span.onclick = function() {
    if ( typeofconf) {
      document.getElementById(typeofconf + "ConfigUpdateButton").disabled = false;
      document.getElementById(typeofconf + "ConfigDeleteButton").disabled = false;
    }
    modal.style.display = "none";
    return false;
  }
}

/* Function to show the alert window
   used: configuraion.html, receipt.html, concepts.html
   message: the text to be written in the window
*/
function openModalMessage(message) {
  var modal = document.getElementById("modal-message");
  modal.style.display = "block";
  document.getElementById("modal-message-message").innerHTML=message;
  modalok = document.getElementById("modal-ok");
  modalok.focus();
  modalok.onclick = function() {
    modal.style.display = "none";
  }
  var span = document.getElementById("modal-close-message");
  span.onclick = function() {
    modal.style.display = "none";
    return false;
  }
}
