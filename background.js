// JavaScript source code
//window.alert("hello from background");
//document.location.href = "http://stackoverflow.com/";
//chrome.browserAction.onClicked.addListener(function (activeTab) {
    //var newURL = "http://stackoverflow.com/";
  //  chrome.tabs.create({ url: newURL });
//});
// JavaScript source code
//window.alert('background running');
/*chrome.tabs.create({'url': 'speechtotext.html', 'type': 'popup'}, function(window) {
});*/

/*window.alert('background running');

chrome.onUpdated.addListener(function(tab) {
    // No tabs or host permissions needed!
    console.log('Turning ' + tab.url + ' red!');
    chrome.tabs.executeScript({
        code: 'document.body.style.backgroundColor="red"'
    });
});
chrome.runtime.onMessage.addListener(function(msg) {
    if (msg == "activate") {
        document.body.style.background = 'red';
        document.body.style.backgroundColor = 'red';
    }
});*/

var final_transcript = '';
var interim_transcript = '';
var currentTab;
var recognizing = false;
var ignore_onend;
var run = false;

function navigateChrome(text) {
    var words = text.split(' ');
    if (words.indexOf('go') >= 0 && words.indexOf('to') == words.indexOf('go') + 1) {
        window.open('http://' + words[words.indexOf('to') + 1]);
    } else if (words.indexOf('search') >= 0 && words.indexOf('for') == words.indexOf('search') + 1) {
        window.open('https://www.google.ca/search?q=' + words.slice(2).join('+'));
    } else if (words.indexOf('search') >= 0 && words.indexOf('videos') == words.indexOf('search') + 1 && words.indexOf('of') == words.indexOf('videos') + 1) {
        window.open('https://www.youtube.com/results?search_query=' + words.slice(3).join('+'));
    } else if (words.indexOf('down') >= 0) {
        down();
    } else if (words.indexOf('up') >= 0) {
        up();
    }
    else if(words.indexOf('exit')>=0){
        chrome.tabs.getSelected(null, function(tab){
            chrome.tabs.remove(tab.id);
        });
    }
    else if (words.indexOf('right') >= 0) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.query({}, function (tabs) {
                chrome.tabs.update(tabs[tab.index + 1].id, { active: true });
            });
        });
    }
    else if (words.indexOf('left') >= 0) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.query({}, function (tabs) {
                chrome.tabs.update(tabs[tab.index - 1].id, { active: true });
            });
        });
    }
    else if (words.indexOf('refresh') >= 0) {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.reload(tab.id);
        });
    }
}

function down() {
    window.scrollBy(0,500);
}

function up() {
    window.scrollBy(0,-500);
}

if ('webkitSpeechRecognition' in window) {
    var recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onstart = function () {
        recognizing = true;
    };
    recognition.onerror = function (event) {
        if (event.error == 'no-speech') {
            ignore_onend = true;
        }
        if (event.error == 'audio-capture') {
            ignore_onend = true;
        }
        if (event.error == 'not-allowed') {
            window.open("chrome-extension://" + chrome.runtime.id + "/errorCatching.html");
            ignore_onend = true;
        }
    };
    recognition.onend = function () {
        recognizing = false;
        if (ignore_onend) {
            return;
        }
        if (!final_transcript) {
            return;
        }
        navigateChrome(final_transcript);
        final_transcript = '';
    };
    recognition.onresult = function (event) {
        for (var i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                final_transcript += event.results[i][0].transcript;
                final_transcript = final_transcript.toLowerCase().trim();
                var noSpaceWordArray = [];
                var spaceWordArray = [];
                var startAdding = false;
                final_transcript.split(' ').forEach(function(i) {
                    if (i.indexOf('.') >= 0) {
                        startAdding = true;
                    }
                    if (startAdding) {
                        if(i == 'slash') {
                            i = '/';
                        }
                        noSpaceWordArray.push(i);
                    } else {
                        spaceWordArray.push(i);
                    }
                });
                final_transcript = spaceWordArray.join(' ');
                final_transcript += ' ' + noSpaceWordArray.join('');
                final_transcript = final_transcript.trim();
                //if (run) {
                    navigateChrome(final_transcript);
               /* }
                if (final_transcript == 'okay chrome' || final_transcript == 'ok chrome') {
                    run = true;
                    //alert("It's on!");
                } else if (final_transcript == 'goodbye chrome') {
                    run = false;
                   // alert("It's off!");
                }*/
            }
           /* else {
                interim_transcript += event.results[i][0].transcript;
            }*/
        }
        interim_transcript = interim_transcript.toLowerCase().trim();
        console.log(1, final_transcript, 2, interim_transcript);
        final_transcript = '';
    };
}

if (recognizing) {
    recognition.stop();
    //return;
}
recognition.lang = ['en-US', 'United States'];
recognition.start();
ignore_onend = false;
