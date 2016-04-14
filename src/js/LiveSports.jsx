/**
 * Created by amanjain on 14/04/16 at 3:13 PM.
 * Description :
 */

import React, {Component} from 'react';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';
import $ from 'jquery';

let httpRequest;
function makeRequest() {
    httpRequest = new XMLHttpRequest();

    if (!httpRequest) {
        alert('Giving up :( Cannot create an XMLHTTP instance');
        return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('GET', 'http://www.espncricinfo.com/ci/engine/match/980909.json?xhr=1');
    httpRequest.send();
}

function alertContents() {
    if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
            console.log(httpRequest.responseText);
        } else {
            console.log('There was a problem with the request.');
        }
    }
}

function makeHtml5Request() {
    $.ajax({

        // The 'type' property sets the HTTP method.
        // A value of 'PUT' or 'DELETE' will trigger a preflight request.
        type: 'GET',

        // The URL to make the request to.
        url: 'http://www.espncricinfo.com/ci/engine/match/980909.json',

        // The 'contentType' property sets the 'Content-Type' header.
        // The JQuery default for this property is
        // 'application/x-www-form-urlencoded; charset=UTF-8', which does not trigger
        // a preflight. If you set this value to anything other than
        // application/x-www-form-urlencoded, multipart/form-data, or text/plain,
        // you will trigger a preflight request.
        contentType: 'text/plain',

        xhrFields: {
            "Access-Control-Allow-Credentials": true,
            // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
            // This can be used to set the 'withCredentials' property.
            // Set the value to 'true' if you'd like to pass cookies to the server.
            // If this is enabled, your server must respond with the header
            // 'Access-Control-Allow-Credentials: true'.
            withCredentials: false
        },

        headers: {
            // Set any custom headers here.
            // If you set any non-simple headers, your server must include these
            // headers in the 'Access-Control-Allow-Headers' response header.
        },

        success: function () {
            console.log('yey')
        },

        error: function () {
            console.log(':(')
        }
    });
}

function onMatchChange(event, index, value) {
    this.setState({selectedMatch: value})
}

function onStartClick(event, index, value) {
    let that = this,
        refs = that.refs,
        selectedEvents = [];

    getSupportedEvents().forEach(({key, label})=> {
        refs[key].isToggled() && selectedEvents.push(key);
    });

    that.setState({selectedEvents: selectedEvents, start: true});
}

function onStopClick() {
    let that = this;
    that.setState({start: undefined});
}

function getSupportedEvents() {
    return [{
        key: 'FOUR',
        label: '4 runs'
    },
        {
            key: 'SIX',
            label: '6 runs'
        },
        {
            key: 'WICKET',
            label: 'Wicket'
        }]
}

class LiveSports extends Component {

    constructor() {
        super();
        this.state = {
            liveMatches: [],
            selectedMatch: undefined,
            selectedEvents: [],
            start: undefined
        }
    }

    render() {
        let that = this,
            selectedMatch = that.state.selectedMatch,
            start = that.state.start,
            matchOptionsEl = [],
            eventsOptionsEl = [];

        that.state.liveMatches.forEach((value) => {
            matchOptionsEl.push(<MenuItem key={value.id} value={value.id} primaryText={value.text}></MenuItem>)
        });

        getSupportedEvents().forEach((value) => {
            eventsOptionsEl.push(<Toggle
                key={value.key}
                ref={value.key}
                label={value.label}
                style={{
                                    width:'300px',
                                    marginBottom: '16px'
                                }}
            />)
        });

        return (
            <div>
                <div className="title">Live Sports</div>
                <div className="body">
                    <div className="control-group">
                        <SelectField ref="matchSelectEl" className="controls" value={selectedMatch}
                                     onChange={onMatchChange.bind(this)}
                                     floatingLabelText="Select Match" style={{
                                 width: '750px',
                                 margin :'auto',
                                 display :'block'
                                 }}>
                            {matchOptionsEl}
                        </SelectField>
                    </div>
                    <div className="control-group">
                        <div className="control-label">Notifications on</div>
                        <div className="controls">
                            {eventsOptionsEl}
                        </div>
                    </div>
                    <div className="start-btn">
                        <RaisedButton label={start ? "Stop" : "Start"} primary={true}
                                      onClick={(start ? onStopClick : onStartClick).bind(this)}
                                      style={ {margin: 'auto'}}/>
                    </div>

                </div>
                <div className="footer">Made with <span className="footer-heart"> &#x2764; </span> by <a target="_blank"
                                                                                                         href="http://ajain.in/">Aman
                    Jain</a></div>
            </div>
        )
    }

    componentDidUpdate() {
        let that = this,
            state = that.state;

        if (state.start) {
            let intervalFunction = function () {
                $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.espncricinfo.com/ci/engine/match/' + state.selectedMatch + '.json') + '&callback=?', function (data) {
                    let event = JSON.parse(data.contents).comms[0].ball[0].event;

                    if (Notification.permission !== "granted")
                        Notification.requestPermission();
                    else {
                        var notification = new Notification('Score Update', {
                            icon: 'http://apk-dl.com/detail/image/com.howabc.sultan.sportsflash-w250.png',
                            body: event
                        });

                        window.setTimeout(() => {
                            notification.close()
                        }, 2000);

                        notification.onclick = function () {
                            window.open("http://www.espncricinfo.com/ci/engine/match/" + state.selectedMatch + ".html");
                        };
                    }
                });
            };

            intervalFunction();
            that.intervalId = window.setInterval(intervalFunction, 3 * 60 * 1000);
        } else {
            window.clearInterval(that.intervalId)
        }
        console.log('updated');
    }

    componentDidMount() {
        let that = this;

        //$('.iframe').load(() => {
        //
        //    var a = $('.iframe');
        //    console.log('loaded');
        //    makeHtml5Request();
        //});

        $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.espncricinfo.com/ci/engine/match/index/live.html') + '&callback=?', (data) => {
            let contentEl = $(data.contents),
                liveMatches = [];

            contentEl.find('.default-match-block').each((iter, value)=> {
                let matchEl = $(value),
                    matchHref = matchEl.find('a').attr('href'),
                    splitMatchHref = matchHref.split('.')[0].split('/'),
                    matchId = splitMatchHref[splitMatchHref.length - 1],
                    innings1 = matchEl.find('.innings-info-1').text(),
                    innings2 = matchEl.find('.innings-info-2').text();

                liveMatches.push({
                    id: matchId,
                    text: innings1 + ' v/s ' + innings2
                });
            });

            this.setState({liveMatches});
        });

        //window.setTimeout(() => {
        //    this.setState({
        //        liveMatches: [{
        //            id: "980911",
        //            text: "Rising Pune Supergiants    163/5 (20 ov) v/s Gujarat Lions    164/3 (18/20 ov)"
        //        },
        //            {
        //                id: "980912",
        //                text: "lulwa    163/5 (20 ov) v/s Gujarat Lions    164/3 (18/20 ov)"
        //            }]
        //    })
        //}, 1000);

        //  makeRequest();

        //


    }
}

export default LiveSports;