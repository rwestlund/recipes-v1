# Recipes
A nodejs webserver for a simple recipe website.

## Dependencies
- nodejs
- npm
- mongodb
- nginx, or another reverse proxy to handle TLS

## Description

This project provides a simple website where people can post, share, and
comment on recipes.

It uses nodejs and mongodb on the back end, with angularjs managing the
client-side app.

Authentication is done via Google OAuth 2.0, but no Google services are
accessed.  Once the token is acquired, it is allowed to expire and still used
by this system.

This project is provided under the BSD license.

## Installation
- Install nodejs, npm, and mongodb.
- Clone this repo.
- Copy web/config/config.example.js to web/config/config.js and edit variables.
- cd to web and run 'npm start' in screen or tmux.
- Configure nginx to use TLS and route both http and https connections to node.

## TODO
- Create a proper startup script to eliminate need for tmux.
- Enable multiline comments.
- Create tooltips in UI.
- Add a select list of all tags on recipe page.
- Make 'link recipe' field clear after selection.
