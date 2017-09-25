const css = require('dom-css')

var VideoRepeater = function (options) {
  console.log("new video repeater", options)
//  if(options.stream) {
    this.width = options.width
    this.height = options.height
    this.numReps = options.numReps
    this.cycleTime = options.cycleTime

    this.id = options.id
    this.stream = options.stream
      this.initContainer()
    this.sourceVid = this.initVidElement(options.stream)
    this.container.appendChild(this.sourceVid)
    console.log(this)
   this.repeat()
//  }
}

VideoRepeater.prototype.initVidElement = function (stream) {
  const videoElement = document.createElement('video')
  videoElement.srcObject = stream
  videoElement.play()
  videoElement.volume = 0
  videoElement.width = this.width
  videoElement.height = this.height
  return videoElement
}

VideoRepeater.prototype.initContainer = function () {
  var el = document.createElement('div')
  el.id = this.id
  css(el, {
    width: this.width * (this.numReps + 1) + 'px',
    height: this.height + 'px'
  })
  this.container = el
  console.log("creating container", this)
}

VideoRepeater.prototype.repeat = function(){
//  console.log("repeating")
  this.recordClip ( function() {
  //  console.log("recordClip called", this)
    setTimeout (function() {
  //    console.log('repeat')
    //  if(!stopped){
        this.repeat()
    //  }
    }.bind(this), 1)
  }.bind(this))
}

VideoRepeater.prototype.recordClip = function(doneCallback) {
//  console.log("recording", this)
  var recorder = new MediaRecorder(this.stream,  {
    type: 'video/mp4'
  });
//    console.log("starting recording", recorder)
  recorder.start()

  setTimeout(function() {
    recorder.stop();
  //  console.log("stopping recording", recorder)
    recorder.ondataavailable = function (evt) {
    //  console.log('data', evt);
    //  if(!stopped){
        var videoURL = URL.createObjectURL(evt.data)
        addVideo(videoURL, this.container, {
          width: this.width,
          height: this.height,
          numReps: this.numReps
        })
    //  }
      doneCallback()
    }.bind(this)
  }.bind(this), this.cycleTime)
}

VideoRepeater.prototype.destroy = function () {

}

function addVideo (src, parent, opts) {
  //console.log("parent", parent)
  var videos = parent.children
   //else {
    var el = document.createElement('video')
    el.controls = true
    el.src = src
    el.controls = false
    el.onloadeddata = function () {
      el.play()
      el.volume = 0
      el.width = opts.width
      el.height = opts.height
      // Loop seems to be broken (?)
      el.setAttribute('loop', true)
      parent.insertBefore(el, videos[videos.length - 1])
      if (videos.length > opts.numReps) {
        var first = videos[0]
    //    console.log("removing", first, first.parentNode)
      //  console.log("removing ", first, first.parentNode)
        first.parentNode.removeChild(first)
      }
  }
}

module.exports = VideoRepeater
