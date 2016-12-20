var h = require('hyperscript')
var obs = require('observable')
var u = require('../util')
var pull = require('pull-stream')

exports.needs = {
  avatar_name: 'first',
  avatar_link: 'first',
  sbot_get: 'first',
  sbot_query: 'first',
  markdown: 'first',
  ting_inquiry_adopted: 'first'
}

exports.gives = { message_content: true }

exports.create = function (api) {

  return {
    message_content: function (msg) {
      var c = msg.value.content
      if(c.type === 'ting-inquiry') {
        var positions_el = h('ul')


        var skillMatching = {}
        c.skills.forEach(function(skillID) {

          skillMatching[skillID] = obs()
          api.inquiry_adopted(msg.key, inquiryID, function(err, grouped) {
            skillMatching[skillID](h('span', Object.keys(grouped).map(function(author) {
              if (grouped[author] > 0) {
                return api.avatar_link(author, api.avatar_name(author))
              }
            })))
          })


          api.sbot_get(skillID, function(err, skMsg) {
            if(err) { throw err; return}
            positions_el.appendChild(h('li', skMsg.content.name, skillMatching[skillID]))
          })
        });

        return h('div.inquiry',
          h('h1', c.title),
          h('strong','Hat: ',api.avatar_link(c.hat, api.avatar_name(c.hat))),
          h('p', api.markdown(c.text)),
          h('strong', 'skills needed:'),
          positions_el
          // TODO: location
        )
      }
    }

  }
}
