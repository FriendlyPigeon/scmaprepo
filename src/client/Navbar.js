import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import { Menu, Image } from 'semantic-ui-react';

import LoggedInContext from './LoggedInContext';

import SteamLoginButton from './SteamLoginButton.png';

const Navbar = () => (
  <LoggedInContext.Consumer>
  {({ loggedIn, loggedInUser }) => (
  <Menu inverted>
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

    <Menu.Item
      as={Link}
      to='/tags'
      name='tags'
    >
      Tags
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
      <a href='/auth/steam'>
        <img src={SteamLoginButton}></img>
      </a>
    </Menu.Menu>
    }
  </Menu>
  )}
  </LoggedInContext.Consumer>
);

export default Navbar;