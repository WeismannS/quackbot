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

module.exports = { rextest_eval }