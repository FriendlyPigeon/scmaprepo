import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';

import LoggedInContext from './LoggedInContext';

import Maps from './Maps';
import MapNew from './MapNew';
import Map from './Map';
import MapEdit from './MapEdit';
import Mappers from './Mappers';
import Mapper from './Mapper';
import Register from './Register';
import Logout from './Logout';

export default class Main extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }

  render() {
    return(
      <LoggedInContext.Consumer>
        {({ loggedIn }) => (
          <Switch>
            <Route path='/maps' component={Maps} />
            <Route path='/map/new' component={MapNew} />
            <Route path='/map/:id/edit' component={MapEdit} />
            <Route path='/map/:id' component={Map} />
            <Route path='/mappers' component={Mappers} />
            <Route path='/mapper/:id' component={Mapper} />
            {loggedIn ? <Redirect from='/register' to='/' /> : <Route path='/register' component={Register} />}
            {loggedIn ? <Route path='/logout' component={Logout} /> : <Redirect from='/logout' to='/' />}
          </Switch>
        )}
      </LoggedInContext.Consumer>
    )
  }
}