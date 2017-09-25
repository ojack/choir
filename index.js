// log in, just see videos of all connected
// key command to start
// limited size in getUserMedia
// to do: how to have same order for all
const MultiPeer = require('./libs/MultiPeer.js')
const css = require('dom-css')
const VideoRepeater = require('./VideoRepeater.js')
const getUserMedia = require('getusermedia')
const vidContainers = {}

var multiPeer, container
var streamObjects = {}

const NUM_ROWS = 4
const NUM_CHOIR = 8
const REPEAT_TIME = 1000
const VID_WIDTH = 160
const VID_HEIGHT = 120

window.onload = function () {
  container = document.createElement('div')

  var top = (window.innerHeight - VID_HEIGHT * NUM_ROWS)/2
  css(container, {
    position: 'fixed',
    right: '0px',
    top: top +'px',
    width: window.innerWidth,
    'overflow-x': 'scroll'
  })

  document.body.appendChild(container)
  getUserMedia({ audio: true, video: { width: VID_WIDTH, height: VID_HEIGHT } }, function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
      console.log('failed')
    } else {
      console.log('got a stream', stream)
      var d = new Date()
      var localId = d.getTime() // milliseconds since 1970, helpful with keeping consistent ordering for all connected peers

      multiPeer = new MultiPeer({
        room: 'node-body',
        server: 'https://live-lab-v1.glitch.me/',
        stream: stream,
        userData: {
          uuid: localId,
          nickname: 'test'
        }})

        var localVid = new VideoRepeater({
          stream: stream,
          id: localId,
          width: VID_WIDTH,
          height: VID_HEIGHT,
          numReps: NUM_CHOIR,
          cycleTime: REPEAT_TIME,
          volume: 0
        })
        streamObjects[localId] = localVid
        container.appendChild(localVid.container)

      multiPeer.on('stream', function (peerId, peerStream) {
        console.log('STREAM', peerId)
        var newVid = new VideoRepeater({
          stream: peerStream,
          id: peerId,
          width: VID_WIDTH,
          height: VID_HEIGHT,
          numReps: NUM_CHOIR,
          cycleTime: REPEAT_TIME,
          volume: 1
        })
        streamObjects[peerId] = newVid
        var children = container.children
      //  if()

        if(container.children.length > 0) {
          var index = container.children.length
          if(parseFloat(peerId) > parseFloat(container.children[index-1].id)){
              container.appendChild(newVid.container)
          } else {
            while(parseFloat(peerId) < parseFloat(container.children[index-1].id)){
              index--
              if(index <= 0) {
                index = 0
                break
              }
              console.log("comparing", index, parseFloat(peerId), parseFloat(container.children[index].id))
            }
            container.insertBefore(newVid.container, container.children[index])
          }
        } else {
            container.appendChild(newVid.container)
        }

      //  index = container.children.length-1
      //  container.appendChild(newVid.container)
    /*    console.log("comparing", index, parseFloat(peerId), parseFloat(container.children[index].id))
        if(parseFloat(peerId) > parseFloat(container.children[index].id)){
            container.appendChild(newVid.container)
        } else {
         while(parseFloat(peerId) < parseFloat(container.children[index-1].id)){
           index--
           if(index <= 0) {
             index = 0
             break
           }

            console.log("comparing", index, parseFloat(peerId), parseFloat(container.children[index].id))

          }
          console.log("inserting before", index)
          container.insertBefore(newVid.container, container.children[index])
        }*/

      })

      multiPeer.on('close', function (id) {
        console.log('on close')
        streamObjects[id].destroy()
        container.removeChild(streamObjects[id].container)
        delete streamObjects[id]
      })
    }
  })

  document.addEventListener('keydown', function (e) {
    console.log('key', e.keyCode)
    if (e.keyCode === 67) {
    } else if (e.keyCode === 68) {

    }
  }, false)
}

window.onresize = function () {
  var top = (window.innerHeight - VID_HEIGHT * NUM_ROWS) / 2
  css(container, {
    position: 'fixed',
    right: '0px',
    top: top + 'px',
    width: window.innerWidth,
    'overflow-x': 'scroll'
  })
}
