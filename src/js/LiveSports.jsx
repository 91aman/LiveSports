/**
 * Created by amanjain on 14/04/16 at 3:13 PM.
 * Description :
 */

import React, {Component} from 'react';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';
import ClassNames from 'classnames';
import $ from 'jquery';
import _ from 'lodash';


let eventMap = {
    "1 run": {
        label: '1 run',
        icon: 'https://creativenglishlearning.files.wordpress.com/2010/09/number1.jpg'
    },
    "2 runs": {
        label: '2 runs',
        icon: 'http://tiengtrunghoanglien.com.vn/profiles/tiengtrunghoangliencomvn/uploads/attach/thumbnail/1408429533_s%C3%B2dinhmenh.jpg'
    },
    "3 runs": {
        label: '3 runs',
        icon: 'https://weeklytreats.files.wordpress.com/2011/05/number3.jpg'
    },
    FOUR: {
        label: '4 runs',
        icon: 'http://3.bp.blogspot.com/-9cSZuRMO65M/UOYn20oxGUI/AAAAAAAALgg/zTyw-uLPkO8/s1600/number4.jpg'
    },
    SIX: {
        label: '6 runs',
        icon: 'http://christchurch.barnet.sch.uk/wp-content/uploads/2015/10/year-6-thumbnail.jpg'
    },
    OUT: {
        label: 'Wicket',
        icon: 'http://www.nickjr.com/nickjr/buttons/alphabuttons/default-08-2015/icon-alpha-w-default-08-2015-2x.png'
    }
};

function pushNotification(ball, content) {

    let that = this,
        event = ball.event,
        inningsDetails = content.live.innings,
        battingTeamId = inningsDetails.batting_team_id,
        battingTeamDetails = _.filter(content.team, (team) => {
            return team.team_id === battingTeamId;
        })[0],
        battingTeamName = battingTeamDetails.team_abbreviation || battingTeamDetails.team_short_name || battingTeamDetails.team_name,
        score = inningsDetails.runs + '/' + inningsDetails.wickets + ' in ' + inningsDetails.overs,
        eventDetails = eventMap[event],
        body;

    if (event === 'OUT') {
        body = ball.dismissal;
    } else {
        body = ball.players + ', ' + eventDetails.label
    }

    body += '\n\n' + battingTeamName + ' : ' + score;

    var notification = new Notification('Score Update', {
        icon: eventDetails.icon,
        body: body
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

    _.keys(eventMap).forEach((key) => {
        refs[key].isToggled() && (selectedEvents[key] = 1);
    });

    that.setState({selectedEvents: selectedEvents, start: true});
}

function onStopClick() {
    let that = this;
    that.setState({start: undefined});
}

class LiveSports extends Component {

    constructor() {
        super();
        this.state = {
            liveMatches: [],
            selectedMatch: undefined,
            selectedEvents: {},
            start: undefined,
            loading: true
        }
    }

    render() {
        let that = this,
            state = that.state,
            selectedMatch = state.selectedMatch,
            start = state.start,
            matchOptionsEl = [],
            eventsOptionsEl = [];

        that.state.liveMatches.forEach((value) => {
            matchOptionsEl.push(<MenuItem key={value.id} value={value.id} primaryText={value.text}></MenuItem>)
        });

        _.forEach(eventMap, (value, key)=> {
            {
                eventsOptionsEl.push(<Toggle
                    key={key}
                    ref={key}
                    label={value.label}
                    className="notificationSelector"
                />)
            }
        });


        return (
            <div>
                <div className={ClassNames("overlay",{
                hide : !state.loading
                })}>
                    <CircularProgress className="overlay-icon"/>
                </div>
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

                        let content = JSON.parse(data.contents),
                            comms = content.comms,
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

                                selectedEvents[ball.event] && pushNotification.call(that, ball, content);

                            }
                        }
                    });
                }
            };

            intervalFunction();
            that.intervalId = window.setInterval(intervalFunction, 15 * 1000);
        } else {
            window.clearInterval(that.intervalId)
        }
        console.log('updated');
    }

    componentDidMount() {
        let that = this;

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

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

            this.setState({liveMatches, loading: false});
        });

    }
}

export default LiveSports;