const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})
tape('put json data', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus/quizzes/ye0ab61`
  jsonist.put(url, { score: 98 }, (err, body) => {
    if (err) t.error(err)
    t.ok(body['courses'], 'should contain courses in the json data from file')
    t.ok(body['courses']['calculus'], 'should contain calculus in the body[\'courses\'] from file')
    t.ok(body['courses']['calculus']['quizzes'], 'should contain quizzes in the body[\'courses\'][\'calculus\'] from file')
    t.ok(body['courses']['calculus']['quizzes']['ye0ab61'], 'should contain ye0ab61 in the body[\'courses\'][\'calculus\'][\'quizzes\'] from file')
    t.end()
  })
})
tape('get json data', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body['quizzes'], 'should contain quizzes in the json data from file')
    t.ok(body['quizzes']['ye0ab61'], 'should contain ye0ab61 in the body[\'quizzes\'] from file')
    t.ok(body['quizzes']['ye0ab61']['score'], 'should contain score in the body[\'quizzes\'][\'ye0ab61\'] from file')
    t.end()
  })
})
tape('delete json data', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus`
  jsonist.delete(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body['courses'], 'should contain key1 in the json data from file')
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
