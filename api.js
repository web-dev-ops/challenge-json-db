const fs = require('fs')
module.exports = {
  getHealth,
  handleData,
}

async function getHealth (req, res) {
  res.json({ success: true })
}

async function handleData (req, res) {
  const { studentId } = req.params
  if (!studentId) {
    return res.status(400).json({ error: `Invalid student id` })
  }
  if (req.url === '/') {
    return res.status(400).json({ error: `Invalid property name` })
  }
  const arrPropertyNames = req.url.split('/').filter(property => property)
  switch (req.method) {
    case 'GET':
      return await getData(studentId, arrPropertyNames, res)
    case 'PUT':
      if (!req.body || !Object.keys(req.body).length) {
        return res.status(400).json({ error: `Invalid score` })
      }
      return await putData(studentId, arrPropertyNames, req.body, res)
    case 'DELETE':
      return await deleteData(studentId, arrPropertyNames, res)
    default:
      return await res.status(500).json({ error: `Invalid request method` })
  }
}

async function putData (studentId, arrPropertyNames, body, res) {
  const filePath = `data/${studentId}.json`
  let originalData = {}
  try {
    const buffer = await fs.readFileSync(filePath)
    originalData = JSON.parse(buffer.toString())
  } catch (e) {
    console.log(`The original file ${studentId}.json is not existing in the data folder. Now creating the file...`)
    originalData = {}
  }
  const newJsonData = buildObjWithKeyArray(arrPropertyNames, body)
  const jsonResult = { ...originalData, ...newJsonData }
  await fs.writeFileSync(filePath, JSON.stringify(jsonResult), 'utf8')
  return await res.json(jsonResult)
}

async function getData (studentId, arrPropertyNames, res) {
  const filePath = `data/${studentId}.json`
  try {
    const buffer = await fs.readFileSync(filePath)
    let jsonData = JSON.parse(buffer.toString())
    arrPropertyNames.map(property => {
      if (!jsonData.hasOwnProperty(property)) {
        throw new Error(`Invalid property with ${property}`)
      }
      jsonData = jsonData[property]
    })
    return await res.json(jsonData)
  } catch (e) {
    return await res.status(404).json({ error: e.message })
  }
}

async function deleteData (studentId, arrPropertyNames, res) {
  const filePath = `data/${studentId}.json`
  try {
    const buffer = await fs.readFileSync(filePath)
    const jsonData = JSON.parse(buffer.toString())
    let deleteData = jsonData
    arrPropertyNames.filter((property, i) => i !== arrPropertyNames.length - 1).map(property => {
      if (!deleteData.hasOwnProperty(property)) {
        throw new Error(`Invalid property with ${property}`)
      }
      deleteData = deleteData[property]
    })
    const finalProperty = arrPropertyNames[arrPropertyNames.length - 1]
    if (!deleteData.hasOwnProperty(finalProperty)) {
      throw new Error(`Invalid property with ${finalProperty}`)
    }
    delete deleteData[finalProperty]
    await fs.writeFileSync(filePath, JSON.stringify(jsonData), 'utf8')
    return await res.json(jsonData)
  } catch (e) {
    return await res.status(404).json({ error: e.message })
  }
}

function buildObjWithKeyArray (arrKeys, body) {
  const key = arrKeys[0]
  let value = body
  if (Array.isArray(arrKeys) && arrKeys.length > 1) {
    arrKeys.shift()
    value = buildObjWithKeyArray(arrKeys, body)
  }
  return {
    [key]: value,
  }
}
