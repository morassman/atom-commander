Callback = require '../lib/callback'

describe "Callback", ->
  it "must support multiple arguments", ->
    expected = [];
    callback = new Callback (args) ->
      expected = args;

    callback.callback(1, 2, 3);

    expect(expected.length).toBe(3);
    expect(expected[0]).toBe(1);
    expect(expected[1]).toBe(2);
    expect(expected[2]).toBe(3);

  it "must be able to be canceled", ->
    expected = [];
    callback = new Callback (args) ->
      expected = args;

    callback.cancel();
    callback.callback(1, 2, 3);

    expect(expected.length).toBe(0);
