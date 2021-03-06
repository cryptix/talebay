var plugs = require('../plugs')
var h = require('hyperscript')

module.exports = {
  needs: {screen_view: 'first'},
  gives: 'app',
  create: function (api) {
      
    if (process.versions.electron) {
      var remote = require('electron').remote
      remote.getCurrentWindow().setSize(1000, 600)
       document.title = "t4l3";
       document.head.appendChild(h('meta', {name:'viewport'}, {content: 'width=device-width, initial-scale=1.0'}));
    }else{
        document.title = "t4l3";
        document.head.appendChild(h('meta', {name:'viewport'}, {content: 'width=device-width, initial-scale=1.0'}));
    }
      
    return function () {
      document.head.appendChild(h('style', require('../style.css.json')))

      window.addEventListener('error', window.onError = function (e) {
        document.body.appendChild(h('div.error',
          h('h1', e.message),
          h('big', h('code', e.filename + ':' + e.lineno)),
          h('pre', e.error ? (e.error.stack || e.error.toString()) : e.toString())))
      })

      function hash() {
        return window.location.hash.substring(1)
      }

      console.log(hash() || 'tabs')
      var view = api.screen_view(hash() || 'tabs')

      var screen = h('div.screen.column', view)

      window.onhashchange = function (ev) {
        var _view = view
        view = api.screen_view(hash() || 'tabs')

        if(_view) screen.replaceChild(view, _view)
        else      document.body.appendChild(view)
      }

      document.body.appendChild(screen)

      return screen
    }
  }
}


