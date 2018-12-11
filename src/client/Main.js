import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import { Button, Header, Icon, Modal } from 'semantic-ui-react'

import LoggedInContext from './LoggedInContext';

import { withCookies, Cookies } from 'react-cookie';
import PropTypes, { instanceOf } from 'prop-types';

import Home from './Home';
import Maps from './Maps';
import MapNew from './MapNew';
import Map from './Map';
import MapEdit from './MapEdit';
import Mappers from './Mappers';
import MapperNew from './MapperNew';
import Mapper from './Mapper';
import MapperEdit from './MapperEdit';
import Tags from './Tags';
import TagNew from './TagNew';
import Register from './Register';
import Logout from './Logout';

class Main extends Component {
  constructor(props) {
    super(props);

    const { cookies } = props;
    this.state = {
      ageModalConfirmed: cookies.get('ageModalConfirmed') || false,
    }

    this.handleAgeModalClose = this.handleAgeModalClose.bind(this);
  }

  handleAgeModalClose() {
    const { cookies } = this.props;

    cookies.set('ageModalConfirmed', true, { path: '/' });

    this.setState({
      ageModalConfirmed: true, 
    })
  }

  render() {
    return(
      <div>
      <Modal
        open={!this.state.ageModalConfirmed}
      >
        <Header icon='exclamation triangle' content='Cookies and age policy' />
        <Modal.Content>
          <h3>This website uses cookies to ensure the best user experience.</h3>
          <h3>You must be 18 or older to view the contents of this website.</h3>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={this.handleAgeModalClose} inverted>
            <Icon name='checkmark' />I am 18+ and accept cookies
          </Button>
          <a href="https://www.google.com/">
          <Button color='red' inverted>
            <Icon name='x' />I am under 18 or do not consent to cookies
          </Button>
          </a>
        </Modal.Actions>
      </Modal>

      <LoggedInContext.Consumer>
        {({ loggedIn }) => (
          <Switch>
            <Route path='/maps' component={Maps} />
            <Route path='/map/new' component={MapNew} />
            <Route path='/map/:id/edit' component={MapEdit} />
            <Route path='/map/:id' component={Map} />
            <Route path='/mappers' component={Mappers} />
            <Route path='/mapper/new' component={MapperNew} />
            <Route path='/mapper/:id/edit' component={MapperEdit} />
            <Route path='/mapper/:id' component={Mapper} />
            <Route path='/tags' component={Tags} />
            <Route path='/tag/new' component={TagNew} />
            <Route path='/register' component={Register} />
            {loggedIn ? <Route path='/logout' component={Logout} /> : <Redirect from='/logout' to='/' />}
            <Route path='/' component={Home} />
          </Switch>
        )}
      </LoggedInContext.Consumer>
      </div>
    )
  }
}

Main.PropTypes = {
  cookies: instanceOf(Cookies).isRequired
}

export default withCookies(Main);