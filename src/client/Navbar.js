import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Menu } from 'semantic-ui-react';

import LoggedInContext from './LoggedInContext';

const Navbar = () => (
  <LoggedInContext.Consumer>
  {({ loggedIn, loggedInUser }) => (
  <Menu>
    <Menu.Item 
      as={Link} 
      to='/maps'
      name='maps'
    >
      Maps
    </Menu.Item>

    <Menu.Item
      as={Link}
      to='/mappers'
      name='mappers'
    >
      Mappers
    </Menu.Item>

    {loggedIn ?
    <Menu.Menu position='right'>
      <Menu.Item
        as={Link}
        to={`/user/${loggedInUser}`}
        name='user'
      >
        Profile
      </Menu.Item>
      <Menu.Item
        as={Link}
        to='/logout'
        name='logout'
      >
        Log out
      </Menu.Item>
    </Menu.Menu>
    :
    <Menu.Menu position='right'>
      <Menu.Item
        as={Link}
        to='/register'
        name='register'  
      >
        Register
      </Menu.Item>

      <Menu.Item
        as={Link}
        to='/login'
        name='login'
      >
        Log in
      </Menu.Item>
    </Menu.Menu>
    }
  </Menu>
  )}
  </LoggedInContext.Consumer>
);

export default Navbar;