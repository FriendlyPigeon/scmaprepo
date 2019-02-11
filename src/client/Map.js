import React, { Component } from 'react';

import { Link, Redirect } from 'react-router-dom';

import { Segment, Button, Rating, Dimmer, Modal, Image, Loader, Divider, Message, List } from 'semantic-ui-react';

import { Editor, EditorState, convertFromRaw } from 'draft-js';

import MapComments from './MapComments';
import MapScreenshots from './MapScreenshots';

import LoggedInContext from './LoggedInContext';

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapId: null,
      map: null,
      successfulDelete: false,
      fileUrls: null,
      averageRating: null,
      personalRating: null,
      thumbnailUrls: null,
      screenshotUrls: null,
      screenshotOpen: false,
      screenshotOpenUrl: null,
      comments: null,
      error: null,
      successfulDelete: false,
    }

    this.handleRate = this.handleRate.bind(this);
    this.handleScreenshotOpen = this.handleScreenshotOpen.bind(this);
    this.handleScreenshotClose = this.handleScreenshotClose.bind(this);
    this.handleUploadFile = this.handleUploadFile.bind(this);
    this.handleUploadScreenshot = this.handleUploadScreenshot.bind(this);
    this.handleMapDelete = this.handleMapDelete.bind(this);
  }

  componentDidMount() {
    const { id } = this.props.match.params;

    fetch(`/api/map/${id}`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(map => {
        this.setState({
          mapId: id,
          map: map
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })

    fetch(`/api/map/${id}/ratings`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(averageRating => {
        this.setState({
          averageRating: averageRating.averageRating
        })
      })
      .catch(error => {
        console.log(error)
        this.setState({
          error: error.error,
        })
      })
    
    fetch(`/api/map/${id}/thumbnails`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(thumbnails => {
        this.setState({
          thumbnailUrls: thumbnails.thumbnailUrls,
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })

    fetch(`/api/map/${id}/screenshots`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(screenshots => {
        this.setState({
          screenshotUrls: screenshots.screenshotUrls,
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })

    fetch(`/api/map/${id}/comments`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(comments => {
        this.setState({
          comments: comments
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })

    fetch(`/api/map/${id}/files`)
      .then(response => response.json())
      .then(response => {
        if(!response.error) { return response }
        else { throw response }
      })
      .then(files => {
        this.setState({
          fileUrls: files.fileUrls
        })
      })
      .catch(error => {
        this.setState({
          error: error.error,
        })
      })
  }

  handleRate(event, { rating }) {
    console.log(rating)
    const { id } = this.props.match.params;

    fetch(`/api/map/${id}/rating`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: rating,
      })
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(rating => {
      this.setState({
        personalRating: rating.personalRating,
        averageRating: rating.averageRating,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }

  handleScreenshotOpen(index) {
    console.log(index)
    const { screenshotUrls } = this.state;

    this.setState({
      screenshotOpen: true,
      screenshotOpenUrl: screenshotUrls[index],
    })
  }

  handleScreenshotClose() {
    this.setState({
      screenshotOpen: false,
    })
  }

  handleUploadFile(event) {
    event.preventDefault();
    const { id } = this.props.match.params;

    const data = new FormData();
    data.append('file', this.uploadFileInput.files[0]);

    fetch(`/api/map/${id}/files`, {
      method: 'POST',
      body: data
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(file => {
      const newFileUrls = this.state.fileUrls.concat(file.fileUrl);

      this.setState({
        fileUrls: newFileUrls,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }

  handleUploadScreenshot(event) {
    event.preventDefault();
    const { id } = this.props.match.params;

    const data = new FormData();
    data.append('file', this.uploadScreenshotInput.files[0]);
    
    fetch(`/api/map/${id}/screenshots`, {
      method: 'POST',
      body: data
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(images => {
      const newThumbnailUrls = this.state.thumbnailUrls.concat(images.thumbnailUrl)
      console.log(newThumbnailUrls)
      const newScreenshotUrls = this.state.screenshotUrls.concat(images.screenshotUrl)
      console.log(newScreenshotUrls)
      this.setState({
        thumbnailUrls: newThumbnailUrls,
        screenshotUrls: newScreenshotUrls,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }

  handleMapDelete(event) {
    event.preventDefault();
    const { id } = this.props.match.params;

    fetch(`/api/map/${id}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(success => {
      console.log(success)
      this.setState({
        successfulDelete: true,
      })
    })
    .catch(error => {
      this.setState({
        error: error.error,
      })
    })
  }

  handleFileDelete(event, fileUrl) {
    event.preventDefault();
    const { id } = this.props.match.params;

    const pattern = /[\w-]+\.[a-zA-Z]+$/
    const fileName = pattern.exec(fileUrl)[0]
    
    fetch(`/api/map/${id}/files/${fileName}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response => {
      const newFileUrls = this.state.fileUrls.filter(file => {
        return file !== fileUrl
      })

      this.setState({
        fileUrls: newFileUrls,
      })
    })
    .catch(error => {
      console.log(error.error)
      this.setState({
        error: error.error,
      })
    })
  }

  handleScreenshotDelete(event, screenshotUrl) {
    event.preventDefault();
    const { id } = this.props.match.params;

    const pattern = /[^\/]+$/
    const screenshotName = pattern.exec(screenshotUrl)[0]
    
    fetch(`/api/map/${id}/screenshots/${screenshotName}`, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })
    .then(response => response.json())
    .then(response => {
      if(!response.error) { return response }
      else { throw response }
    })
    .then(response => {
      const newScreenshotUrls = this.state.screenshotUrls.filter(screenshot => {
        return screenshot !== screenshotUrl
      })

      const newThumbnailUrls = this.state.thumbnailUrls.filter(thumbnail => {
        return thumbnail !== `https://storage.googleapis.com/scmaprepo-files/map/${id}/thumbnails/${screenshotName}-thumbnail.jpg`
      })

      this.setState({
        screenshotUrls: newScreenshotUrls,
        thumbnailUrls: newThumbnailUrls,
        screenshotOpen: false,
      })
    })
    .catch(error => {
      console.log(error.error)
      this.setState({
        error: error.error,
        screenshotOpen: false,
      })
    })
  }

  render() {
    const { error, mapId, map, fileUrls, averageRating, personalRating, thumbnailUrls, screenshotUrls, screenshotOpen, screenshotOpenUrl, comments, successfulDelete } = this.state;
    return(
      <LoggedInContext.Consumer>
      {({ loggedIn, loggedInUser }) => (
      <Segment inverted>
      {successfulDelete && <Redirect to={'/maps'} />}
      {error && <Message negative>{error}</Message>}
      {map && comments ?
        <div>
          <h2>{map.name}</h2>

          <Button.Group style={{ float: 'right' }}>
            <Link to={`/map/${mapId}/edit`}>
              <Button primary>
                Edit
              </Button>
            </Link>
            
            <Button primary onClick={e => this.handleMapDelete(e)}>
              Delete
            </Button>
          </Button.Group>
          
          <Divider />

          <h3>Map files</h3>
          <List>
          {fileUrls && fileUrls.map((fileUrl, index) =>
          <div>
            <List.Item>
              <a href={fileUrl}>
                {fileUrl}
              </a>
            </List.Item>
            <Button primary onClick={e => this.handleFileDelete(e, fileUrl)}>
              Delete
            </Button>
          </div>
          )}
          </List>

          <form onSubmit={this.handleUploadFile}>
            <input ref={(ref) => { this.uploadFileInput = ref; }} type="file" accept=".7z,.zip,.rar" />
            <Button primary>Upload</Button>
          </form>

          <h3>Authors</h3>
          <List>
          {map.authors && map.authors.map((author, id) =>
            <List.Item key={id}>
              <List.Content>
                <Link to={`/mapper/${map.mapper_ids[id]}`}>{author}</Link>
              </List.Content>
            </List.Item>
          )}
          </List>

          <h3>Tags</h3>
          <List>
          {map.tags && map.tags.map((tag, id) =>
            <List.Item key={id}>
              <List.Content>
                <Link to={`/maps`}>{tag}</Link>
              </List.Content>
            </List.Item>  
          )}
          </List>

          <h3>Rating</h3>
          <Rating 
            icon='star'
            defaultRating={personalRating || averageRating}
            maxRating={10}
            onRate={this.handleRate}
          />
          {averageRating ?
            <p style={{ display: 'inline' }}>Average: {parseFloat(averageRating).toFixed(2)}</p>
          : <p style={{ display: 'inline' }}>Not yet rated</p>
          }

          <h3>Description</h3>
          <Editor editorState={EditorState.createWithContent(convertFromRaw(JSON.parse(map.description)))} readOnly />

          <h3>Screenshots</h3>
          {thumbnailUrls && thumbnailUrls.map((thumbnailUrl, index) =>
            <a onClick={() => this.handleScreenshotOpen(index)}>
              <Image style={{ display: 'inline' }} key={index} src={thumbnailUrl}></Image>
            </a>
          )}

          {screenshotUrls && screenshotOpenUrl &&
            <Dimmer active={screenshotOpen} onClickOutside={this.handleScreenshotClose} page>
              <Image style={{ maxWidth: '100%', maxHeight: '100%' }} src={screenshotOpenUrl} size='huge'></Image>
              <Button primary
                style={{ display: 'block', margin: 'auto' }} 
                onClick={e => this.handleScreenshotDelete(e, screenshotOpenUrl)}
              >
                Delete
              </Button>
            </Dimmer>
          }

          <form onSubmit={this.handleUploadScreenshot}>
            <input ref={(ref) => { this.uploadScreenshotInput = ref; }} type="file" accept=".jpg,.png" />
            <Button primary>Upload</Button>
          </form>

          <h3>Comments</h3>
          <MapComments mapId={mapId} comments={comments} />
        </div>
        : <Loader>Loading map information</Loader>}
      </Segment>
      )}
      </LoggedInContext.Consumer>
    )
  }
}