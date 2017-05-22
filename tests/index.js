//Skip in node
if (module.hot) {
  const context = require.context(
    'mocha-loader!./',  //process with mocha loader
    false,              //don't recurse
    /\.test\.js$/       //test files end in test.js
  )

  //execute tests
  context.keys().forEach(context)
}
