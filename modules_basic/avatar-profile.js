var h = require('hyperscript')
var pull = require('pull-stream')

exports.needs = {
  avatar_image_link: 'first',
  avatar_action: 'map',
  avatar_description: 'first',
  avatar_edit: 'first',
  avatar_pinned: 'first',
  follows: 'first',
  followers: 'first',
  sbot_get: 'first',
  sbot_query: 'first'
}

exports.gives = 'avatar_profile'

function streamToList(stream, el) {
  pull(
    stream,
    pull.drain(function (item) {
      if(item) el.appendChild(item)
    })
  )
  return el
}

exports.create = function (api) {

  function image_link (id) {
    return api.avatar_image_link(id, 'thumbnail')
  }

  return function (id) {

    var skorgs_el = h('ul')
    var follows_el = h('div.profile__follows.wrap')
    var friends_el = h('div.profile__friendss.wrap')
    var followers_el = h('div.profile__followers.wrap')
    var a, b

    pull(api.follows(id), pull.unique(), pull.collect(function (err, ary) {
      a = ary || []; next()
    }))
    pull(api.followers(id), pull.unique(), pull.collect(function (err, ary) {
      b = ary || {}; next()
    }))

    pull(
      api.sbot_query({query: [
        {"$filter": {
          "value":{
            "author": id,
            "content": {"type":"about", "sk0rg":{"$prefix":""} }
          }
        }},
        {"$map": ['value', 'content','sk0rg']}
      ]}),
      pull.unique(),
      pull.collect(function(err, ary) {
        if(err) {throw err; return;}
        ary.forEach(function(id) {
          api.sbot_get(id, function(err, obj) {
            skorgs_el.appendChild(h('li', 
              h('a', {href: '#'+id}, obj.content.sk0rg),
              ": " + obj.content.text))
          })
        })
      })
    )

    function next () {
      if(!(a && b)) return
      var _c = [], _a = [], _b = []

      a.forEach(function (id) {
        if(!~b.indexOf(id)) _a.push(id)
        else               _c.push(id)
      })
      b.forEach(function (id) {
        if(!~_c.indexOf(id)) _b.push(id)
      })
      function add (ary, el) {
        ary.forEach(function (id) { el.appendChild(image_link(id)) })
      }

      add(_a, follows_el)
      add(_c, friends_el)
      add(_b, followers_el)
    }


    return h('div.column.profile',
      api.avatar_edit(id),
      api.avatar_description(id),
      h("strong", "pinned post"),
      api.avatar_pinned(id),
      api.avatar_action(id),
      h('div.profile__relationships.column',
        h('strong', 'sk0rgs'),
        skorgs_el,
        h('strong', 'follows'),
        follows_el,
        h('strong', 'friends'),
        friends_el,
        h('strong', 'followers'),
        followers_el
      )
    )
  }

}

