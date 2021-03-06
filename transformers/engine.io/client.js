'use strict';
/*globals eio*/

/**
 * Minimum viable WebSocket client. This function is stringified and written in
 * to our client side library.
 *
 * @runat client
 * @api private
 */
module.exports = function client() {
  var primus = this
    , socket;

  //
  // Connect to the given url.
  //
  primus.on('primus::connect', function connect(url) {
    if (socket) socket.close();

    socket = eio(url, {
      path: this.pathname
    });

    //
    // Setup the Event handlers.
    //
    socket.onopen = primus.emits('open');
    socket.onerror = primus.emits('error');
    socket.onclose = primus.emits('close');
    socket.onmessage = primus.emits('data', function parse(evt) {
      return evt.data;
    });
  });

  //
  // We need to write a new message to the socket.
  //
  primus.on('primus::write', function write(message) {
    if (socket) socket.send(message);
  });

  //
  // Attempt to reconnect the socket. It asumes that the `close` event is
  // called if it failed to disconnect.
  //
  primus.on('primus::reconnect', function reconnect() {
    if (socket) {
      socket.close();
      socket.open();
    }
  });

  //
  // We need to close the socket.
  //
  primus.on('primus::close', function close() {
    if (socket) {
      socket.close();
      socket = null;
    }
  });
};
