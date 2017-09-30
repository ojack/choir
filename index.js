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
const CONST_VID_WIDTH = 160
const CONST_VID_HEIGHT = 120

var vid_width, vid_height;

window.onload = function () {
  container = document.createElement('div')
  vid_width = window.innerWidth/NUM_CHOIR
  vid_height = vid_width * (CONST_VID_HEIGHT/CONST_VID_WIDTH)
  //var top = (window.innerHeight - vid_height * NUM_ROWS)/2
  var top = 0
  css(container, {
    position: 'fixed',
    right: '0px',
    top: top +'px',
    width: window.innerWidth,
    'overflow-x': 'scroll'
  })

  document.body.appendChild(container)
  getUserMedia({ audio: true, video: { width: CONST_VID_WIDTH, height: CONST_VID_HEIGHT } }, function (err, stream) {
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
        peerOptions: {
          reconnectTimer: 1000,
          trickle: false
        },

        userData: {
          uuid: localId,
          nickname: 'test'
        }})

        var localVid = new VideoRepeater({
          stream: stream,
          id: localId,
          width: vid_width,
          height: vid_height,
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
          width: vid_width,
          height: vid_height,
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

      multiPeer.on('peers', function(peers){
        console.log("PEERS", peers)
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
  vid_width = window.innerWidth/NUM_CHOIR
  vid_height = vid_width * (CONST_VID_HEIGHT/CONST_VID_WIDTH)
  //var top = (window.innerHeight - vid_height * NUM_ROWS) / 2
  var top = 0
  css(container, {
    position: 'fixed',
    right: '0px',
    top: top + 'px',
    width: window.innerWidth,
    'overflow-x': 'scroll'
  })
  for(var id in streamObjects){
    streamObjects[id].width =  vid_width
    streamObjects[id].height =  vid_height
  }
}
