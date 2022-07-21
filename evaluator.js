const logger = require('node-color-log')
const request = require('request')
function rextest_eval (code, lcw) {
  let url = 'https://rextester.com/rundotnet/Run'
  let data = {
    LanguageChoiceWrapper: toString(lcw),
    EditorChoiceWrapper: '1',
    LayoutChoiceWrapper: '1',
    Program: code,
    Input: '',
    Privacy: '',
    PrivacyUsers: '',
    Title: '',
    SavedOutput: '',
    WholeError: '',
    WholeWarning: '',
    StatsToSave: '',
    CodeGuid: '',
    IsInEditMode: 'False',
    IsLive: 'False'
  }
  return new Promise((resolve, reject) => {
    request.post(url, { form: data }, (err, res, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}

module.exports = { lua_eval: rextest_eval }
// {"Warnings":null,"Errors":null,"Result":"Hello, World!\n","Stats":"Absolute running time: 0.17 sec, cpu time: 0.01 sec, memory peak: 5 Mb, absolute service time: 0,3 sec","Files":null,"NotLoggedIn":false}
// lua_eval('print("Hello, World!")').then(res => {
//   // parse the res to show error or warning when there is
//   let res_json = JSON.parse(res)
//   let to_log = ''
//   if (res_json.Errors) {
//     logger.error(res_json.Errors)
//     to_log = res_json.Errors
//   }
//   if (res_json.Warnings) {
//     logger.warn(res_json.Warnings)
//     to_log += res_json.Warnings
//   }
//   logger.info(res_json.Result)
//   to_log += res_json.Result
// })
