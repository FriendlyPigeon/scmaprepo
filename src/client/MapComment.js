import React, { Component } from 'react';

import LoggedInContext from './LoggedInContext';

import MapCommentReply from './MapCommentReply';

import { Segment, Message, Label, Button } from 'semantic-ui-react';

export default class MapComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
    }
  }

  render() {
    const { error } = this.state;
    const { mapId, comment } = this.props;

    return(
      <LoggedInContext.Consumer>
        {({ loggedInUser }) =>
        { return comment &&
        <div>
          <Segment style={{ backgroundColor: '#222222', color: '#FFFFFF' }}>
            {error && <Message negative>{error}</Message>}
            <Label>{comment.username ? comment.username : 'deleted'}</Label>
              {comment.comment}
              <Button.Group style={{ float: 'right' }}>
                {loggedInUser && loggedInUser === comment.user_id &&
                  <Button compact onClick={(event) => this.props.onCommentDelete(comment.comment_id, event)}>delete</Button>}
                <Button compact onClick={(event) => this.props.onReplyOpen(comment.comment_id, event)}>reply</Button>
              </Button.Group>
              {this.props.openReply === comment.comment_id && <MapCommentReply key={comment.comment_id} commentId={comment.comment_id} onCommentSubmit={this.props.onCommentSubmit}/>}
              {comment.replies && comment.replies.map((nestedComment) =>
                <MapComment key={nestedComment.comment_id} comment={nestedComment} openReply={this.props.openReply} onReplyOpen={this.props.onReplyOpen} onCommentSubmit={this.props.onCommentSubmit} onCommentDelete={this.props.onCommentDelete} />
              )}
          </Segment>
        </div>
        }
        }
      </LoggedInContext.Consumer>
    )
  }
}