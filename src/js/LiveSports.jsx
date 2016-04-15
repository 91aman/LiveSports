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
import _ from 'lodash';

let iconMap = {
    FOUR: 'http://3.bp.blogspot.com/-9cSZuRMO65M/UOYn20oxGUI/AAAAAAAALgg/zTyw-uLPkO8/s1600/number4.jpg',
    SIX: 'http://christchurch.barnet.sch.uk/wp-content/uploads/2015/10/year-6-thumbnail.jpg',
    OUT: 'http://api.ning.com/files/lE4UVJcD*3lcgmdp0QRHLcsZdY7hPXLRIa9p6aEYxN0ez5J0hCT5StJNSZfivI8UgQnUNdMG*ju-VZqLIMeAvbK0j*K0NDPs/dreamstime_3538344.jpg'
};

function pushNotification(ball) {

    let that = this,
        event = ball.event;

    var notification = new Notification('Score Update', {
        icon: iconMap[event],
        body: event === 'OUT' ? ball.dismissal : ball.players
    });

    window.setTimeout(() => {
        notification.close()
    }, 5000);

    notification.onclick = function () {
        window.open("http://www.espncricinfo.com/ci/engine/match/" + that.state.selectedMatch + ".html");
    };
}

function onMatchChange(event, index, value) {
    this.setState({selectedMatch: value})
}

function onStartClick(event, index, value) {
    let that = this,
        refs = that.refs,
        selectedEvents = {};

    getSupportedEvents().forEach(({key, label})=> {
        refs[key].isToggled() && (selectedEvents[key] = 1);
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
            key: 'OUT',
            label: 'Wicket'
        }]
}

class LiveSports extends Component {

    constructor() {
        super();
        this.state = {
            liveMatches: [],
            selectedMatch: undefined,
            selectedEvents: {},
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
            state = that.state,
            selectedEvents = state.selectedEvents;

        if (state.start) {
            let intervalFunction = function () {

                if (Notification.permission !== "granted") {
                    Notification.requestPermission();
                } else {
                    $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.espncricinfo.com/ci/engine/match/' + state.selectedMatch + '.json') + '&callback=?', function (data) {

                        let comms = JSON.parse(data.contents).comms,
                            balls = comms[0].ball,
                            iter = 0,

                            previousBall = that.previousBall || balls[0].overs_unique,
                            previousBallInnings = that.previousBallInnings || balls[0].previousBallInnings;

                        that.previousBall = balls[0].overs_unique;

                        for (iter = 0; iter < comms.length; iter++) {
                            let over = comms[iter],
                                balls = over.ball,
                                j = 0;

                            for (j = 0; j < balls.length; j++) {
                                let ball = balls[j];

                                if (ball.overs_unique === previousBall) {
                                    return;
                                }

                                selectedEvents[ball.event] && pushNotification.call(that, ball);

                            }
                        }
                    });
                }
            };

            intervalFunction();
            that.intervalId = window.setInterval(intervalFunction,  15 * 1000);
        } else {
            window.clearInterval(that.intervalId)
        }
        console.log('updated');
    }

    componentDidMount() {
        let that = this;

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

    }
}

export default LiveSports;