var Tabs = require('hypertabs')
var h = require('hyperscript')
var pull = require('pull-stream')
var u = require('../util')
var keyscroll = require('../keyscroll')
var open = require('open-external')
var signifier = require('../plugs').first(exports.signifier = [])


function ancestor (el) {
  if(!el) return
  if(el.tagName !== 'A') return ancestor(el.parentElement)
  return el
}

exports.needs = {
  screen_view: 'first',
  search_box: 'first', 
  menu: 'first',
  avatar_name: 'first'
  
}

exports.gives = 'screen_view'

exports.create = function (api) {
  return function (path) {
    if(path !== 'tabs')
      return

    function setSelected (indexes) {
      var ids = indexes.map(function (index) {
        return tabs.get(index).id
      })
      if(search)
        if(ids.length > 1)
          search.value = 'split('+ids.join(',')+')'
        else
          search.value = ids[0]
    }

    var search
    var tabs = Tabs(setSelected)

    search = api.search_box(function (path, change) {

      if(tabs.has(path)) {
        tabs.select(path)
        return true
      }
      var el = api.screen_view(path)

      if(el) {
        if(!el.title) el.title = path
        el.scroll = keyscroll(el.querySelector('.scroller__content'))
        tabs.add(el, change)
  //      localStorage.openTabs = JSON.stringify(tabs.tabs)
        return change
      }
    })

    //reposition hypertabs menu to inside a container...
    tabs.insertBefore(h('div.header.goLeft',
        
        h('div.header__tabs', tabs.firstChild), //tabs
        h('div.header__search.end', h('div', search), api.menu())
    ), tabs.firstChild)
  //  tabs.insertBefore(searcabs.firstChild.nextSibling)

    var saved = []
  //  try { saved = JSON.parse(localStorage.openTabs) }
  //  catch (_) { }
    
    
    var id= require('../keys').id
    
    if(!saved || saved.length < 4)
      saved = ['/ting-overview', id, '/ting-inqu1ry', '/ting-new-inqu1ry',  '/public', '/notifications']

    saved.forEach(function (path) {
      var el = api.screen_view(path)
      if(!el) return
      el.id = el.id || path
      if (!el) return
      el.scroll = keyscroll(el.querySelector('.scroller__content'))
      if(el) tabs.add(el, false, false)
    })

    tabs.select(0)

    //handle link clicks
    window.onclick = function (ev) {
      var link = ancestor(ev.target)
      if(!link) return
      var path = link.hash.substring(1)

      ev.preventDefault()
      ev.stopPropagation()

      //let the application handle this link
      if (link.getAttribute('href') === '#') return

      //open external links.
      //this ought to be made into something more runcible
      if(open.isExternal(link.href)) return open(link.href)

      if(tabs.has(path))
        return tabs.select(path, !ev.ctrlKey, !!ev.shiftKey)

      var el = api.screen_view(path)
      if(el) {
        el.id = el.id || path
        el.scroll = keyscroll(el.querySelector('.scroller__content'))
        tabs.add(el, !ev.ctrlKey, !!ev.shiftKey)
  //      localStorage.openTabs = JSON.stringify(tabs.tabs)
      }

      return false
    }

    window.addEventListener('keydown', function (ev) {
      if (ev.target.nodeName === 'INPUT' || ev.target.nodeName === 'TEXTAREA')
        return
      switch(ev.keyCode) {

        // scroll through tabs
        case 72: // h
          return tabs.selectRelative(-1)
        case 76: // l
          return tabs.selectRelative(1)

        // scroll through messages
        case 74: // j
          return tabs.get(tabs.selected[0]).scroll(1)
        case 75: // k
          return tabs.get(tabs.selected[0]).scroll(-1)

        // close a tab
        case 88: // x
          if (tabs.selected) {
            var sel = tabs.selected
            var i = sel.reduce(function (a, b) { return Math.min(a, b) })
            tabs.remove(sel)
            tabs.select(Math.max(i-1, 0))
          }
          return

        // activate the search field
        case 191: // /
          if (ev.shiftKey)
            search.activate('?', ev)
          else
            search.activate('/', ev)
          return

        // navigate to a feed
        case 50: // 2
          if (ev.shiftKey)
            search.activate('@', ev)
          return

        // navigate to a channel
        case 51: // 3
          if (ev.shiftKey)
            search.activate('#', ev)
          return

        // navigate to a message
        case 53: // 5
          if (ev.shiftKey)
            search.activate('%', ev)
          return
      }
    })

    // errors tab
    var errorsContent = h('div.column.scroller__content')
    var errors = h('div.column.scroller', {
      id: 'errors',
      style: {'overflow':'auto'}
    }, h('div.scroller__wrapper',
        errorsContent
      )
    )

    // remove loader error handler
    if (window.onError) {
      window.removeEventListener('error', window.onError)
      delete window.onError
    }

    // put errors in a tab
    window.addEventListener('error', function (ev) {
      var err = ev.error || ev
      if(!tabs.has('errors'))
        tabs.add(errors, false)
      var el = h('div.message',
        h('strong', err.message),
        h('pre', err.stack))
      if (errorsContent.firstChild)
        errorsContent.insertBefore(el, errorsContent.firstChild)
      else
        errorsContent.appendChild(el)
    })

    if (process.versions.electron) {
      window.addEventListener('contextmenu', function (ev) {
        ev.preventDefault()
        var remote = require('electron').remote
        var Menu = remote.Menu
        var MenuItem = remote.MenuItem
        var menu = new Menu()
              
        
        
        menu.append(new MenuItem({
          label: 'Inspect Element',
          click: function () {
            remote.getCurrentWindow().inspectElement(ev.x, ev.y)
          }
        }))
        menu.popup(remote.getCurrentWindow())
      })
    }

    return tabs
  }

}
