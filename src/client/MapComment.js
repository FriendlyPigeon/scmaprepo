import React, { Component } from 'react';

import LoggedInContext from './LoggedInContext';

import MapCommentReply from './MapCommentReply';

import { Segment, Message, Comment, Label, Button, Form } from 'semantic-ui-react';

import { Editor, EditorState, convertFromRaw } from 'draft-js';
import DraftEditor from './DraftEditor';

export default class MapComment extends Component {
  constructor(props) {
    super(props);

    this.state = {
      error: null,
      commentState: EditorState.createEmpty(),
    }
  }

  render() {
    const { error } = this.state;
    const { mapId, comment, openReply, openEdit, openEditState } = this.props;

    return(
      <LoggedInContext.Consumer>
        {({ loggedInUser }) =>
        { return comment &&
          <Comment>
            <Comment.Content>
              <Comment.Author>{comment.username ? comment.username : 'deleted'}</Comment.Author>
              <Comment.Text>
                {comment.comment !== '[deleted]' ? 
                  <Editor editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(comment.comment)))} readOnly />
                  : <p style={{ color: '#FFFFFF' }}>[deleted]</p>
                }
              </Comment.Text>
              <Comment.Actions>
                <Comment.Action onClick={(event) => this.props.onReplyOpen(comment.comment_id, event)}>Reply</Comment.Action>
                <Comment.Action onClick={(event) => this.props.onEditOpen(comment.comment_id, event)}>Edit</Comment.Action>
                <Comment.Action onClick={(event) => this.props.onCommentDelete(comment.comment_id, event)}>Delete</Comment.Action>
              </Comment.Actions>
            </Comment.Content>
            {openReply === comment.comment_id && <MapCommentReply key={comment.comment_id} commentId={comment.comment_id} onCommentSubmit={this.props.onCommentSubmit}/>}
            {openEdit === comment.comment_id &&
              <Form onSubmit={() => this.props.handleCommentEditSubmit(comment.comment_id, openEditState)}>
                <DraftEditor editorState={openEditState} update={this.props.handleCommentEdit} />
                <Button>Submit</Button>
              </Form>
            }
            {comment.replies && comment.replies.map((nestedComment) =>
              <Comment.Group>
                <MapComment key={nestedComment.comment_id} comment={nestedComment} openReply={this.props.openReply} onReplyOpen={this.props.onReplyOpen} onCommentSubmit={this.props.onCommentSubmit} onCommentEdit={this.props.onCommentEdit} onCommentDelete={this.props.onCommentDelete} />
              </Comment.Group>
            )}
          </Comment>
        }
        }
      </LoggedInContext.Consumer>
    )
  }
}