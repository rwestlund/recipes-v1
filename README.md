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
- cd to web/ and run 'npm install' to fetch dependencies.
- Copy web/config/config.example.js to web/config/config.js and edit variables.
- Use a reverse proxy like nginx to implement TLS and route both http/https
  connections to node over http.
- Run 'node bin/www' or use [node-rc](github.com/rwestlund/node-rc)

## TODO
- Create a proper startup script to eliminate need for tmux.
- Enable multiline comments.
- Create tooltips in UI.
- Add a select list of all tags on recipe page.
- Make 'link recipe' field clear after selection.
