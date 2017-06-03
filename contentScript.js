window.addEventListener("dblclick", captureWord);
window.addEventListener("click", removePopup);


var clickX = "0px";
var clickY = "0px";
var finishedDisplay = false;
var popupClicked = false;
var mouseOnPopup = false;
var gisCxKey = "CSE ID"; //https://cse.google.com/cse
var gisApiKey = "API KEY"; //Google Developers Console. Make a note of the API Key

var wrapperDiv = document.createElement("div");
wrapperDiv.id = "gismyModal";
wrapperDiv.className = "gismodel";
wrapperDiv.style = 'display:none';

var modelContentDiv = document.createElement("div");
modelContentDiv.className = "gismodal-content";

wrapperDiv.appendChild(modelContentDiv);

var modelHeaderDiv = document.createElement("div");
modelHeaderDiv.className = "gismodal-header";

var closeSpan = document.createElement("span");
closeSpan.className = "gisclose";
closeSpan.innerHTML = "&times;";
modelHeaderDiv.appendChild(closeSpan);

var heading = document.createElement("h2");
heading.innerText = "Google Image Suggestions";

modelHeaderDiv.appendChild(heading);

modelContentDiv.appendChild(modelHeaderDiv);

var modelBodyDiv = document.createElement("div");
modelBodyDiv.className = "gismodal-body";
//modelBodyDiv.id = "gismyModalBody";

var loadingDiv = document.createElement("div");
loadingDiv.id = "giswidgetLoader";
loadingDiv.className = "gisloading-div";

var loaderSpan = document.createElement("span");
loaderSpan.className = "gisloader";
loadingDiv.appendChild(loaderSpan);

modelBodyDiv.appendChild(loadingDiv);

var modelinnerBodyDiv = document.createElement("div");
modelinnerBodyDiv.id = "gismyModalBody";

modelBodyDiv.appendChild(modelinnerBodyDiv);
modelContentDiv.appendChild(modelBodyDiv);
document.body.appendChild(wrapperDiv);

// Get the modal
var modal = document.getElementById('gismyModal');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("gisclose")[0];


// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    hidegispopup();
}

function checkGicsMouseMovement(event) {
    if (Math.abs(event.clientX - clickX) > 10 && Math.abs(event.clientY - clickY) > 10) {
        if (!mouseOnPopup) {
            document.removeEventListener("mousemove", checkGicsMouseMovement, false);
            popupClicked = false;
            hidegispopup();
        }
    }
}

function showgispopup() {
    document.addEventListener("mousemove", checkGicsMouseMovement);
    $("#giswidgetLoader").hide();
    modal.style.display = "block";
    document.getElementById('gismyModal').addEventListener('mouseover', function () { mouseOnPopup = true; });
    document.getElementById('gismyModal').addEventListener('mouseout', function () { mouseOnPopup = false; });
    finishedDisplay = true;
}

function hidegispopup() {
    $("#giswidgetLoader").hide();
    modal.style.display = "none";
    document.removeEventListener("mousemove", checkGicsMouseMovement, false);
    finishedDisplay = false;
}

/* listens for double clicks if extension has been enabled */
function captureWord(event) {
    //modal.style.display = "none";
    $("#giswidgetLoader").show();
    word = document.getSelection().toString();
    clickX = event.clickX; //mouse click x
    clickY = event.clickY; //mouse click y
    modal.style.position = "absolute";
    modal.style.left = event.pageX + 50 + 'px';
    modal.style.top = event.pageY + 'px';

    if ($(event.target).closest('p,div')) {
        word = checkHyphenation($(event.target).closest('p,div').text(), word.trim());
    }
    if (word.length > 0) {
        $.getJSON("https://www.googleapis.com/customsearch/v1?key="+ gisApiKey +"&cx=" + gisCxKey + "&searchType=image&imgSize=small&num=4&q=" + word, function (data) {
            var items = [];
            $("#gismyModalBody").html("").append("<ul></ul>");
            $.each(data.items, function (key, val) {
                $("#gismyModalBody ul").append("<li id='" + key + "'><a target='_blank' href='" + val.image.contextLink + "' title='" + val.title + "'><img src='" + val.image.thumbnailLink + "' alt='" + val.title + "' /></a></li>");
            });
            showgispopup();
        }, function (error) {
            hidegispopup();
        });

    } else {
        hidegispopup();
    }
}

function removePopup(event) {
    if (finishedDisplay && !mouseOnPopup) {
        hidegispopup();
    }
}

function checkHyphenation(context, word) {
    temp1 = "";
    temp2 = "";
    wordStart = context.indexOf(word);
    oldWordStart = wordStart; //in case we click on the middle word of a hyphenated word
    /* deal with hyphenated words */
    if (context.charAt(wordStart - 1) == '-') { //hyphenated word; we clicked on second half
        wordStart = context.substring(0, oldWordStart).lastIndexOf(' '); //pick out the first half as well
        temp1 = context.substring(wordStart + 1, oldWordStart);
    }
    if (context.charAt(oldWordStart + word.length) == '-') { //hyphenated word; we clicked on first half
        wordStart = context.substring(oldWordStart + word.length).indexOf(' '); //pick out the second half as well
        temp2 = context.substring(oldWordStart + word.length).substring(0, wordStart); //we clicked on the first half
    }
    word = temp1 + word + temp2;
    return word;
}