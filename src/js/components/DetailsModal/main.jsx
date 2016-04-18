/**
 * Created by amanjain on 17/04/16 at 12:57 PM.
 * Description :
 */


import React, {Component} from 'react';
import $ from 'jquery';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';
import RaisedButton from 'material-ui/lib/raised-button';

class DetailsModal extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            state: $.noop
        };
    }

    render() {
        let that = this,
            props = that.props;

        const actions = [
            <RaisedButton
                label="Show me"
                primary={true}
                keyboardFocused={true}
                onTouchTap={props.onClose}
                style={{
        width: '125px',
        textTransform : 'none'
    }}
            />
        ];

        return (
            <div>
                <Dialog
                    title="Live Sports"
                    titleClassName="dm-title"
                    titleStyle={{
                    padding:"24px",
                    fontSize: "35px",
                    color : "white"
                    }}
                    actions={actions}
                    actionsContainerStyle={{
                        background: '#3F51B5',
                        textAlign : 'centre'
                    }}
                    modal={false}
                    open={props.open}
                    onRequestClose={props.onClose}
                    className="details-modal"
                    bodyStyle={{
                    padding: "40px 24px"
                    }}
                >
                    <div className="dmc-body">
                        <div className="dmc-info-lines"><i>"Want to watch a cricket match, but stuck in
                            work."<br></br>
                            "Afraid of seeing updates on Cricinfo, knowing that your boss might catch you."
                        </i>
                        </div>
                        <div className="dmc-no-worries">No worries,</div>
                        <div>
                            If you are avid cricket fan and want to be updated about score with out
                            compromising your work,<br></br> <i>‘Live Sports’</i> is here for you.

                            <br></br>Now get notifications on each updates of the match you want.
                        </div>
                    </div>
                    <div className="cricinfo-info"><i>* Live Updates are fetched from <a
                        href="http://www.espncricinfo.com/" target="_black">Cricinfo</a></i></div>
                </Dialog>
            </div>
        );
    }
}

export default DetailsModal;