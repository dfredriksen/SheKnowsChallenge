var hasDOMContentLoaded = false,
    onreadystatechange = false,
    load = false,
    ready = false,
    readyMethod = null,
    callback = null,
    ipretrieved = null,
    newXMLHttpRequest = null,
    go = null,
    detectLegacyDomReady = null,
    init = null;
    domReady = null;

newXMLHttpRequest = function() {
  return window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
};

callback = function() {
  var 
    getElementsByClassName = null, 
    trackedElements = [], 
    index = 0;
    trackingInfo = [],
    trackingItem = null,
    lastItem = null,
    xhrcount = null,
    xhr = [];
    

  trackedElements = document.getElementsByClassName('js-sheknows-tracker') || getElementsByClassName('js-sheknows-tracker');
  lastItem = trackedElements.length;

  if(lastItem > 0) {
    for(index = 0; index < trackedElements.length; index++) {
      xhr.push(newXMLHttpRequest());
      xhr[index].open('GET', 'http://www.telize.com/jsonip'); //Would replace with a more efficient call and one that supports SSL
      xhr[index].index = index;
      xhr[index].onreadystatechange = function() {        
        var DONE = 4; // readyState 4 means the request is done.
        var OK = 200; // status 200 is a successful return.
        var response = null;
        var xhrFinal = newXMLHttpRequest();
        var data = null;
        var currentIndex = this.index;
        if (this.readyState === DONE) {
          if (this.status === OK) {
            response = JSON.decode(xhr.responseText);
            trackingItem = {
              pageTitle: document.title,
              timestamp: Date.now(),
              hostname: window.location.hostname,
              ip: response.ip,
              index: this.index,
            };
            trackingInfo.push(trackingItem);
            data = JSON.stringify(trackingInfo);
            xhrFinal.open('POST','backendprocess.php'); //This would be whatever backendprocess endpoint that translated the JSON data to MySql.
            xhrFinal.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhrFinal.send('pageTitle=' 
                + encodeURIComponent(trackingItem.pageTitle) 
                + '&timestamp=' + encodeURIComponent(trackingItem.timestamp)
                + '&hostname=' + encodeURIComponent(trackingItem.hostname)
                + '&ip=' + encodeURIComponent(trackingItem.ip)
                + '&index=' + encodeURIComponent(trackingItem.index) 
            ); 
            //We do not need a callback for this example            
          } else {
            console.log('Error: ' + xhr.status); // An error occurred during the request.
          }
        }
      };
      xhr[index].send(null);
    }
  }


};

// Listen for "DOMContentLoaded"
document.addEventListener("DOMContentLoaded", callback);

// Listen for "onreadystatechange"
document.onreadystatechange = function () { init("onreadystatechange"); }

// Listen for "load", if onreadystatechange and load is called before DOMContentLoaded, it doesn't exist
// so its an older browser
document.addEventListener("load", function(event) { init("load"); });

// Gets called after any one of the above is triggered. 
init = function(method) {
    if(!ready) {
        ready = true;
        readyMethod = method;
        go();
    }
};

detectLegacyDomReady = function(poller) {
  if(typeof domReady === 'undefined') {
    clearInterval(poller);
    domReady(callback);
  }
};

go = function() {
  if(!hasDOMContentLoaded && load && onreadystatechange) {
    //load legacy browser compatible dom ready script
    loadscript("../src/getElementsByClassName.js", "js") //dynamically load and add this .js file
    loadscript("../src/domReady.js", "js") //dynamically load and add this .js file
    if(typeof domReady === 'undefined'){
      poller = setInterval(function(){ detectLegacyDomReady(poller) }, 20); //20 ms sounds reasonable but can be shortened
      Date.now = Date.now || function() { return +new Date; }; //Legacy IE compatible Date function
    }
    else{  
      domReady(callback);
    }
  }
  //Otherwise rely on native browser DOMContentLoaded event for modern browsers.
}

function loadscript(filename, filetype){
  var fileref=document.createElement('script');
  fileref.setAttribute("type","text/javascript");
  fileref.setAttribute("src", filename);
}

