var h = require('hyperscript')
var obs = require('observable')
var pull = require('pull-stream')
var cat = require('pull-cat')
var combobox = require('hypercombo')

exports.needs = {
  avatar_image_link: 'first',
  avatar_action: 'map',
  avatar_description: 'first',
  avatar_edit: 'first',
  avatar_pinned: 'first',
  avatar_name: 'first',
  avatar_link: 'first',
  follows: 'first',
  followers: 'first',
  sbot_get: 'first',
  sbot_whoami: 'first',
  message_confirm: 'first',
  message_compose: 'first',
  ting_allskills:'first',
  ting_myskills:'first'
}

exports.gives = 'avatar_profile'

exports.create = function (api) {

  function image_link (id) {
    return api.avatar_image_link(id, 'thumbnail')
  }


  return function (id) {


    var sk0rgs_el = h('div.skill_list.float')
    var follows_el = h('div.profile__follows.wrap')
    var friends_el = h('div.profile__friendss.wrap')
    var followers_el = h('div.profile__followers.wrap')
    var a, b

    //  make sure the sk0rgs are only displayed for yourself
    var self_id = require('../keys').id

    // fill sk0rgs list
    api.ting_myskills(id, function(err, aboutMsgArr) {
      if(err) { throw err; return}
      aboutMsgArr.forEach(function(aboutMsg) {

        var sk = aboutMsg.value.content.sk0rg
        api.sbot_get(sk, function(err, skMsg) {
          if(err) { throw err; return}

          sk0rgs_el.appendChild(h('div.skill_object.float',
            // TODO: don't link to individual message, link to feed with all inquiries for this skill
            h('a', {href: '#'+sk}, skMsg.content.name), //": " + skMsg.content.text,
            (id === self_id) ? h('a', {href: '#', onclick: function(e) {
              e.preventDefault()
              // copy msg and invert it
              var untrack = aboutMsg.value.content
              untrack.adopted = false
              api.message_confirm(untrack, function (err, msg) {
                if(err) return alert(err)
                if(!msg) return
              })
            }}, " (-)") : null
          ))
        })
      })
    })

    // followers
    pull(api.follows(id), pull.unique(), pull.collect(function (err, ary) {
      a = ary || []; next()
    }))
    pull(api.followers(id), pull.unique(), pull.collect(function (err, ary) {
      b = ary || {}; next()
    }))

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
        ary.forEach(function (id) { el.appendChild(api.avatar_link(id, api.avatar_name(id))) })
        ary.forEach(function (id) { el.appendChild(h('div.blank', ' ')) })
      }
//var name = api.avatar_name(id)
      add(_a, follows_el)
      add(_c, friends_el)
      add(_b, followers_el)
    }

    // return the ui
    var adoptSelector_el
    return h('div.column.profile',
      api.avatar_edit(id),
      
      sk0rgs_el,
      h('div.skill_object.green.float', 
        h('a', {href: "#/new_skill"}, 'new skill')),
                 
      h('div.profile__relationships',
        h('div.profile_headline_short', 'Contacts'),
        follows_el,
        friends_el,
        followers_el

      )
    )
  }

}

