// log in, just see videos of all connected
// key command to start
// limited size in getUserMedia
// to do: how to have same order for all
const MultiPeer = require('./libs/MultiPeer.js')
const shortid = require('shortid')
const css = require('dom-css')

const getUserMedia = require('getusermedia')
const vidContainers = {}
var localVid
var numStreams = 0
var peers = []
var multiPeer, localId

const NUM_ROWS = 3
const NUM_CHOIR = 4
const REPEAT_TIME = 1000

var frames = 0
window.onload = function(){

  getUserMedia({ audio: true, video: { width: 320, height: 240}}, function (err, stream) {
    // if the browser doesn't support user media
    // or the user says "no" the error gets passed
    // as the first argument.
    if (err) {
      console.log('failed');
    } else {
      console.log('got a stream', stream);
      numStreams++
      var d = new Date();
      var localId = d.getTime(); // milliseconds since 1970, helpful with keeping consistent ordering for all connected peers
      //localId = shortid.generate()
      multiPeer = new MultiPeer({
        room: "node-body",
        server: "https://live-lab-v1.glitch.me/",
        stream: stream,
        userData: {
          uuid: localId,
          nickname: "test"
        }})


        //  peers.push(localId)
        localVid = startRecording(stream, localId)
        //  document.body.appendChild(localVid)
        //initial connection with server
        // to do: what happens if more peers than allowed?
        multiPeer.on('peers', function (_peers) {
          peers = _peers.slice(0)
          if(peers.indexOf(localId) < 0) peers.push(localId)
          peers.sort
          console.log("peers", peers)
          peers.forEach((id)=>{
            var el = document.createElement('div')
            css(el, {
              width: "2000px",
              height: window.innerHeight/NUM_ROWS+ "px"
            })
            vidContainers[id] = {
              el: el
            }
            document.body.appendChild(vidContainers[id].el)
          })
          vidContainers[localId].stream = stream

          /* while (document.body.firstChild) {
          document.body.removeChild(document.body.firstChild);
        }*/
        vidContainers[localId].el.appendChild(localVid)
        //setDomFromPeerObject()
        //  console.log("peers", peers)


      })
      //
      //
      multiPeer.on('new peer', function (data) {
        console.log("NEW PEER", data)
        if(peers.length < NUM_ROWS){
          peers.push(data.id)
          peers.sort
          var el = document.createElement('div')
          css(el, {
            width: "2000px",
            height: window.innerHeight/NUM_ROWS+ "px"
          })

          vidContainers[data.id] = {
            el: el
          }
          document.body.appendChild(vidContainers[data.id].el)
          //console.log("data peers", data, peers)
        }
      //  setDomFromPeerObject()
      })

      multiPeer.on('stream', function (peerId, peerStream) {
        numStreams++
        console.log("STREAM", peerId)
        vidContainers[peerId].stream = peerStream
        var rVid = startRecording(peerStream, peerId)
        vidContainers[peerId].el.appendChild(rVid)
        //if(numStreams === NUM_ROWS) startChoir()
      })

      multiPeer.on('close', function (id) {
        numStreams--
        peers.splice(peers.indexOf(id), 1)
        document.body.removeChild(vidContainers[id].el)
        delete vidContainers[id]
        console.log("ppers", peers)
      })

    }
  })

  document.addEventListener("keydown", function(e){
    console.log("key", e.keyCode)
    if(e.keyCode===83) {
      console.log("starting choir")
      startChoir()
    }
  }, false);
}

function startChoir() {
  peers.forEach((id) => {
    recordLoop(vidContainers[id])
  })
}

function setDomFromPeerObject() {
  //remove existing dom elements
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
  peers.forEach((id) => {
    if(vidContainers[id].el) document.body.appendChild(vidContainers[id].el)
  })
}

function initElements(){
  for(var i = 0; i < NUM_ROWS; i++) {
    var el = document.createElement('div')
    css(el, {
      width: "2000px",
      height: window.innerHeight/NUM_ROWS+ "px"
    })
    console.log(el)
    document.body.appendChild(el)
    vidContainers.push(el)
  }
}
function startRecording(stream, id) {
  const videoElement = document.createElement('video')
  videoElement.srcObject = stream
  videoElement.play()
  videoElement.volume = 0
  return videoElement
  //  document.body.appendChild(videoElement)
  //  console.log("INDEX", id, peers, peers.indexOf(id), vidContainers[peers.indexOf(id)])
  //  vidContainers[peers.indexOf(id)].appendChild(videoElement)
  //    recordLoop(stream);

}

function recordLoop(obj) {

  recordClip(obj, function() {
    setTimeout(function() {
      console.log('and go');
      recordLoop(obj);
    }, 1);
  });

}

function recordClip(obj, doneCallback) {
  var recorder = new MediaRecorder(obj.stream,  {
    type: 'video/mp4'
  });
  recorder.start();
  setTimeout(function() {
    recorder.stop();
    recorder.ondataavailable = function (evt) {
    //  console.log('data', evt);
      var videoURL = URL.createObjectURL(evt.data);
      addVideo(videoURL, obj.el);
      doneCallback();
    };
  }, REPEAT_TIME);
}

function addVideo(src, parent) {
  var videos = parent.querySelectorAll('video');
   //else {
    var el = document.createElement('video');
    el.controls = true;
    el.src = src;
    el.controls = false
    el.onloadeddata = function() {
      el.play();
      // Loop seems to be broken (?)
      el.setAttribute('loop', true);
      parent.insertBefore(el, videos[videos.length-1])
      if(videos.length > NUM_CHOIR) {
        var first = videos[0];
        first.parentNode.removeChild(first);
      }
  //  };

  }
/*  var el = document.createElement('video');
  el.controls = true;
  el.src = src;
  parent.appendChild(el);

  var videos = parent.querySelectorAll('video');
  if(videos.length > NUM_CHOIR) {
    // remove the oldest
    var first = videos[0];
    first.parentNode.removeChild(first);
  }

  // Important: wait until data is ready or else
  // the browser will complain about a broken format
  el.onloadeddata = function() {
    el.play();
    // Loop seems to be broken (?)
    el.setAttribute('loop', true);
  };*/
}
