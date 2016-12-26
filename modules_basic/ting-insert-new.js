'use strict'
var h = require('hyperscript')

var plugs = require('../plugs')
var cont = require('cont')
var ref = require('ssb-ref')

exports.needs = {
  message_render: 'first',
  message_compose: 'first',
  message_unbox: 'first',
  sbot_log: 'first',
  sbot_whoami: 'first',
  avatar_image_link: 'first',
  emoji_url: 'first'
}

exports.gives = {
  builtin_tabs: true,
  screen_view: true
}

exports.create = function (api) {

  return {
    builtin_tabs: function () {
      return ['/new insert']
    },

    screen_view: function (path) {
    if(path === '/new insert') {

     var content = h('div.column.scroller__content')
     var div = h('div.column.scroller',
       {style: {'overflow':'auto'}},
       h('div.scroller__wrapper',
         h('div.column.scroller__content'),
           h('div.headline'),
           h('div.introduction'),
           h('div.missing_skills')
         )  
       )
     
      var id = require('../keys').id
     
   
      var content = h('div.column.scroller__content')
        div.appendChild(h('div.scroller__wrapper', 'test'))
     }
        return div;
    }
  }
}

