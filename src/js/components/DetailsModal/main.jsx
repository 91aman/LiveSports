/**
 * Created by amanjain on 17/04/16 at 12:57 PM.
 * Description :
 */


import React, {Component} from 'react';
import $ from 'jquery';
import Dialog from 'material-ui/lib/dialog';
import FlatButton from 'material-ui/lib/flat-button';

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
            <FlatButton
                label="SHOW ME"
                primary={true}
                keyboardFocused={true}
                onTouchTap={props.onClose}
                style={{
        width: '150px'
    }}
            />
        ];

        return (
            <div>
                <Dialog
                    title=""
                    actions={actions}
                    modal={false}
                    open={props.open}
                    onRequestClose={props.onClose}
                    className="details-modal"
                >
                    <div className="details-modal-container">
                        <div className="dmc-header"> Live Sports</div>
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

                    </div>

                </Dialog>
            </div>
        );
    }
}

export default DetailsModal;