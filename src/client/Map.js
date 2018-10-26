import React, { Component } from 'react';

import { Link } from 'react-router-dom';

import { Segment, Button, Dimmer, Image, Loader, Divider, Message, List } from 'semantic-ui-react';

import MapComments from './MapComments';
import MapScreenshots from './MapScreenshots';

export default class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mapId: null,
      map: null,
      thumbnailUrls: null,
      screenshotUrls: null,
      screenshotOpen: false,
      screenshotOpenUrl: null,
      comments: null,
      error: null,
    }

    this.handleScreenshotOpen = this.handleScreenshotOpen.bind(this);
    this.handleScreenshotClose = this.handleScreenshotClose.bind(this);
    this.handleUploadScreenshot = this.handleUploadScreenshot.bind(this);
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
          error: error
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
          error: error
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

  handleUploadScreenshot(event) {
    event.preventDefault();
    const { id } = this.props.match.params;

    const data = new FormData();
    data.append('file', this.uploadInput.files[0]);
    
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

  render() {
    const { error, mapId, map, thumbnailUrls, screenshotUrls, screenshotOpen, screenshotOpenUrl, comments } = this.state;
    return(
      <Segment>
 
      {error && <Message negative>{error}</Message>}
      {map && comments ?
        <div>
          <h2>{map.name}</h2>
          <Link 
            style={{ float: 'right' }} 
            to={`/map/${mapId}/edit`}
          >Edit</Link>
          <Divider />

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

          <h3>Description</h3>
            <Segment>
              {map.description}
            </Segment>

          <h3>Screenshots</h3>
          {thumbnailUrls && thumbnailUrls.map((thumbnailUrl, index) =>
            <a onClick={() => this.handleScreenshotOpen(index)}>
              <Image style={{ display: 'inline' }} key={index} src={thumbnailUrl}></Image>
            </a>
          )}

          {screenshotUrls && screenshotOpenUrl &&
            <Dimmer active={screenshotOpen} onClickOutside={this.handleScreenshotClose} page>
              <Image src={screenshotOpenUrl}></Image>
            </Dimmer>
          }

          <form onSubmit={this.handleUploadScreenshot}>
            <input ref={(ref) => { this.uploadInput = ref; }} type="file" accept=".jpg,.png" />
            <Button>Upload</Button>
          </form>

          <h3>Comments</h3>
          <MapComments mapId={mapId} comments={comments} />
        </div>
        : <Loader>Loading map information</Loader>}
      </Segment>
    )
  }
}