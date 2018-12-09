import React, { Component } from 'react';

import { Segment, TextArea, Form, Button } from 'semantic-ui-react';

export default class MapCommentReply extends Component {
  constructor(props) {
    super(props);

    this.state = {
      newComment: '',
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
  }

  handleFieldChange(event) {
    this.setState({ [event.target.name]: event.target.value });
  }

  render() {
    const { newComment } = this.state;
    return(
      <Segment inverted>
        <Form onSubmit={() => this.props.onCommentSubmit(this.props.commentId, newComment)}>
          <TextArea
            autoHeight 
            rows={5}
            name='newComment'
            value={newComment}
            onChange={this.handleFieldChange}
          >
          </TextArea>

          <Button>Submit</Button>
        </Form>
      </Segment>
    )
  }
}