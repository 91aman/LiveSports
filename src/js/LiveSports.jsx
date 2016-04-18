/**
 * Created by amanjain on 14/04/16 at 3:13 PM.
 * Description :
 */

import React, {Component} from 'react';
import SelectField from 'material-ui/lib/SelectField';
import MenuItem from 'material-ui/lib/menus/menu-item';
import Divider from 'material-ui/lib/divider';
import Toggle from 'material-ui/lib/toggle';
import RaisedButton from 'material-ui/lib/raised-button';
import CircularProgress from 'material-ui/lib/circular-progress';
import DetailsModal from './components/DetailsModal/main.jsx';
import Snackbar from 'material-ui/lib/snackbar';
import ClassNames from 'classnames';
import $ from 'jquery';
import _ from 'lodash';


let eventMap = {
    EVERY_BALL: {
        label: 'Every ball',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cricketball.png'
    },
    EVERY_OVER: {
        label: 'End of over',
        icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cricketball.png'
    },
    OUT: {
        label: 'Wicket',
        icon: 'http://www.nickjr.com/nickjr/buttons/alphabuttons/default-08-2015/icon-alpha-w-default-08-2015-2x.png'
    },
    SIX: {
        label: '6 runs',
        icon: 'http://christchurch.barnet.sch.uk/wp-content/uploads/2015/10/year-6-thumbnail.jpg'
    },
    FOUR: {
        label: '4 runs',
        icon: 'http://3.bp.blogspot.com/-9cSZuRMO65M/UOYn20oxGUI/AAAAAAAALgg/zTyw-uLPkO8/s1600/number4.jpg'
    },
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
    }
};

/**
 * returns short form name, eg : MI v/s GL.
 * @param content
 * @returns {string}
 */
function getMatchHeaderDetails(content) {
    let teamShortNames = [];

    _.forEach(content.team, (team) => {
        teamShortNames.push(getTeamName(team));
    });

    this.matchHeader = teamShortNames.join(' v/s ');

    return this.matchHeader;
}

function getTeamName(team) {
    return team.team_abbreviation || team.team_short_name || team.team_name;
}

function getCurrentBattingTeamDetails(content) {
    let inningsDetails = content.live.innings,
        battingTeamId = inningsDetails.batting_team_id,
        battingTeamDetails = _.filter(content.team, (team) => {
            return team.team_id === battingTeamId;
        })[0],
        battingTeamName = getTeamName(battingTeamDetails);

    return battingTeamName + ' : ' + inningsDetails.runs + '/' + inningsDetails.wickets + ' in ' + inningsDetails.overs;
}

function pushNotification(ball = {}, content, eventarg) {
    let that = this,
        event = eventarg || ball.event,
        eventDetails = eventMap[event] || {},
        icon = eventDetails.icon || 'https://upload.wikimedia.org/wikipedia/commons/b/b0/Cricketball.png',
        label = eventDetails.label || event,
        body;

    switch (event) {
        case 'EVERY_OVER':
            body = 'Over complete.';
            break;
        default:
            body = ball.overs_actual + ', ' + ball.players + ', ' + label;
    }

    (event === 'OUT') && (body += '\n' + ball.dismissal);

    body += '\n\n' + getCurrentBattingTeamDetails(content);

    var notification = new Notification('Score Update ( ' + (that.matchHeader || getMatchHeaderDetails.call(that, content)) + ' )', {
        icon,
        body
    });

    window.setTimeout(() => {
        notification.close()
    }, 10000);

    notification.onclick = function () {
        window.open("http://www.espncricinfo.com/ci/engine/match/" + that.state.selectedMatch + ".html");
    };
}

function onMatchChange(event, index, value) {
    this.setState({selectedMatch: value})
}

function onDetailDialogClose() {
    let that = this;

    that.setState({
        showDetails: false
    })
}

function onSnackBarClose() {
    let that = this;

    that.setState({
        showSnackbar: false
    })
}

function onStartClick(event, index, value) {
    let that = this,
        refs = that.refs,
        selectedEvents = {};

    _.keys(eventMap).forEach((key) => {
        refs[key].isToggled() && (selectedEvents[key] = 1);
    });

    that.matchHeader = undefined;
    that.previousOver = undefined;
    that.previousBall = undefined;

    that.setState({selectedEvents: selectedEvents, start: true, showSnackbar: true});
}

function onStopClick() {
    let that = this;
    that.setState({start: undefined});
}

class LiveSports extends Component {

    constructor() {
        super();
        this.state = {
            liveMatches: {},
            selectedMatch: undefined,
            selectedEvents: {},
            start: undefined,
            loading: true,
            showDetails: false,
            showSnackbar: false
        }
    }

    render() {
        let that = this,
            state = that.state,
            selectedMatch = state.selectedMatch,
            start = state.start,
            matchOptionsEl = [],
            eventsOptionsEl = [],
            iter = 0;

        _.forEach(that.state.liveMatches, (values, key) => {

            iter && matchOptionsEl.push(<Divider key={iter} />);

            matchOptionsEl.push(<MenuItem key={key} value={key} primaryText={key} disabled={true}></MenuItem>);
            values.forEach((value) => {
                matchOptionsEl.push(<MenuItem key={value.id} value={value.id} primaryText={value.text}
                                              secondaryText={value.secondaryText} insetChildren={true}></MenuItem>)
            });
            iter++;
        });

        _.forEach(eventMap, (value, key)=> {
            {
                eventsOptionsEl.push(<Toggle
                    key={key}
                    ref={key}
                    label={value.label}
                    className="notificationSelector"
                    disabled={state.start}
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
                <DetailsModal open={state.showDetails} onClose={onDetailDialogClose.bind(that)}/>
                <Snackbar
                    open={state.showSnackbar}
                    message="Congrats, You will receive your first notification soon."
                    autoHideDuration={4000}
                    onRequestClose={onSnackBarClose.bind(that)}
                />
                <div className="title">Live Sports</div>
                <div className="body">
                    <div className="control-group">
                        <SelectField ref="matchSelectEl" className="controls" value={selectedMatch}
                                     onChange={onMatchChange.bind(this)}
                                     disabled={state.start}
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
                                      disabled={!state.selectedMatch}
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
            if (!that.intervalId) {
                let intervalFunction = function () {

                    if (Notification.permission !== "granted") {
                        Notification.requestPermission();
                    } else {
                        $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.espncricinfo.com/ci/engine/match/' + state.selectedMatch + '.json') + '&callback=?', function (data) {

                            let content = JSON.parse(data.contents),
                                overs = content.comms || [],
                                currentOver = overs[0] || {},
                                currentOverNo = currentOver.over_number,
                                balls = currentOver.ball || [],
                                currentBall = (balls[0] || {}).overs_unique,
                                iter,

                            //if no previous ball is set, set it as the current ball.
                                previousBall = that.previousBall || currentBall,
                                previousOver = that.previousOver || currentOverNo;

                            that.previousBall = currentBall;
                            that.previousOver = currentOverNo;

                            for (iter = 0; iter < overs.length; iter++) {
                                let over = overs[iter],
                                    balls = over.ball || [],
                                    j;

                                for (j = 0; j < balls.length; j++) {
                                    let ball = balls[j];

                                    if (ball.overs_unique === previousBall) {
                                        return;
                                    }
                                    console.log(ball.overs_unique, ball.event);

                                    (selectedEvents['EVERY_BALL'] || selectedEvents[ball.event]) && pushNotification.call(that, ball, content);
                                }

                                if (selectedEvents['EVERY_OVER'] && currentOverNo != previousOver) {
                                    pushNotification.call(that, {}, content, 'EVERY_OVER')
                                }
                            }
                        });
                    }
                };

                intervalFunction();
                that.intervalId = window.setInterval(intervalFunction, 15 * 1000);
            }
        } else {
            window.clearInterval(that.intervalId);
            that.intervalId = undefined;
        }
    }

    componentDidMount() {

        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        $.getJSON('http://whateverorigin.org/get?url=' + encodeURIComponent('http://www.espncricinfo.com/ci/engine/match/index/live.html') + '&callback=?', (data) => {
            let jDummy = $('<div class="dummy"></div>'),
                contentEl = jDummy.closest('.dummy').html(data.contents),
                sectionHeads = contentEl.find('.match-section-head'),
                matchGroups = contentEl.find('.matches-day-block'),
                liveMatches = {};

            sectionHeads.each((iter, value) => {
                let matchGroup = $(matchGroups[iter]),
                    groupLabel = $(value).text(),
                    matchInGroup = [];

                matchGroup.find('.default-match-block').each((iter, value)=> {
                    let matchEl = $(value),
                        matchHref = matchEl.find('a').attr('href'),
                        splitMatchHref = matchHref.split('.')[0].split('/'),
                        matchId = splitMatchHref[splitMatchHref.length - 1],
                        innings1 = matchEl.find('.innings-info-1').text(),
                        innings2 = matchEl.find('.innings-info-2').text();

                    matchInGroup.push({
                        id: matchId,
                        text: innings1 + ' v/s ' + innings2,
                        secondaryText: matchEl.find('.match-info .bold').text()
                    });
                });

                liveMatches[groupLabel] = matchInGroup;
            });

            this.setState({liveMatches, loading: false, showDetails: true});
        });
    }
}

export default LiveSports;