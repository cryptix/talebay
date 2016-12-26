'use strict'
var h = require('hyperscript')
var pull = require('pull-stream')

exports.needs = {
  message_name: 'first',
  sbot_query: 'first'
}

exports.gives = {
  builtin_tabs: true,
  screen_view: true
}

exports.create = function (api) {

  return {
    builtin_tabs: function () {
      return ['/ting-overview']
    },

    screen_view: function (path) {
      if(path !== '/ting-overview') return


      pull(
        api.sbot_query({query: [
          {"$filter": {
            "value":{
              "author": require('../keys.js').id,
              "content": {
                "type":"ting-adopt",
              }
            }
          }},
          {"$map": {
            "inquiry": ["value","content","inquiry"]
          }}
        ]}),
        pull.unique("inquiry"),
        pull.drain(function(msg) {
          api.message_name(msg.inquiry, function (err, name) {
            if(err) { throw err; return}
            content.appendChild(h('li',
              h('a',{href:"#"+msg.inquiry}, name)))
          })
        })
      )

      var content = h('ul')
      var div = h('div.column.scroller',
        {style: {'overflow':'auto'}},
        h('div.scroller__wrapper',
          h('div.column.scroller__content'),
          h('div.headline', h('h1', "hello world")),
          h('div.introduction'),
          h('div.missing_skills'),
          h('div.missing_skills'),
          h('h3', 'inqu1ries you take part in:'),
          content
        ))

      return div;
    }
  }
}

