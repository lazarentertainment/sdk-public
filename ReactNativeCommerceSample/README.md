## Setup
If you are new to React Native development, make sure to follow the steps in [Setting up the development environment](https://reactnative.dev/docs/environment-setup) for "React Native CLI Quickstart". Then do the following:

* Make sure you have CocoaPods installed (With Brew: `brew install cocoapods`)
* `npm install`
* `cd ios && pod install && cd ..`

Then run `npx react-native run-android` or `npx react-native run-ios`. In our testing, the app runs well on iOS and Android devices, and in the iOS Simulator, but not the Android Emulator.

To run on a device, please be sure to follow the steps in [Running on device](https://reactnative.dev/docs/running-on-device).

If you run into any problems, do not hesitate to file an issue.

## How to create a broadcast
**iOS**

* Download the Stage TEN Mobile Studio: https://apps.apple.com/ca/app/stage-ten-mobile-studio/id1475119349
* Open Safari and navigate to `stagetenstudio://sandbox`, this will allow your Mobile Studio installation to use the `sandbox` environment.
* Watch [this video](https://stageten-asset-samples.s3.amazonaws.com/sdk/hls/index.html) on how to use Stage TEN Mobile Studio to create a broadcast, chat, and use commerce.

**Android**
(currently in development)

**Desktop**

Desktop can output video in landscape orientation and using the Voting feature of the Stage TEN platform.

* Open [sandbox.stageten.tv](https://sandbox.stageten.tv)
* Watch [this video](https://stageten-asset-samples.s3.amazonaws.com/desktop-studio/hls/index.html) on how to use the desktop Studio to broadcast, start a vote, chat, and use commerce.
## SDK Usage
To add the Stage TEN player to your React Native app you need your Stage TEN channel id. Then you can do as follows:

```tsx
import React, { Component } from 'react';

// Feel free to use and modify StageTenPlayer for your purposes
import { StageTenPlayer, stageTenOrigin } from './StageTenPlayer';

const myChannelId = 'REPLACE_WITH_YOUR_CHANNEL_ID';
const playerUri = `${stageTenOrigin}/sdk/${myChannelId}`

class MyApp extends Component {

  playerRef: StageTenPlayer

  onMessage(message: object) {
    // Handle messages and player events from Stage TEN here, and update your local state
  }

  sendAction(message: object) {
    // Send e.g. chat or voting actions to the player
    this.playerRef?.sendAction(message)
  }

  render() {
    return (
      <StageTenPlayer
        uri={playerUri}
        onMessage={this.onMessage}
        ref={(ref) => this.playerRef = ref}
      />
    )
  }
}
```

For a full example, please see App.tsx. You can also run the app and observe most messaging there.

## Events
All events have the form:
```ts
type Event {
  name: string
  payload: object | null
}
```

The player currently publishes the following messages:

**stageten_init**
Fires when the iframe is initialized and you can start sending/receiving events.

```ts
{
  name: 'stageten_init',
  payload: {
    aspectRatio: number
  }
}
```

**state**
Sent in response to a `getstate` action.

```js
{
  name: 'state',
  payload: {
    voting: {
      activeQuestion: {},
    },
  },
}
```

**aspect_ratio_change**
Sent when there is a change in aspect ratio. This would ordinarily only occur if a user were broadcasting in portrait, then on a subsequent broadcast switched to landscape (or vice versa), and the viewer's app were still open.
```js
{
  name: 'aspect_ratio_change',
  payload: {
    aspectRatio: number,
  }
}
```

**voting_activequestionchange**
Sent when there is a change to the active question. Either when the question is activated/deactived or when the question data changes.

```ts
{
  name: 'voting_activequestionchange',
  payload: ActiveQuestion | null,
}
```

**chat_messages**
Sent when there is an update to the chat state

```ts
{
  name: 'chat_messages',
  payload: {
    messages: ChatMessage[]
  }
}
```

**commerce_saleactivestate**
Sent when a Sale is made active or inactive

```ts
{
  name: 'commerce_saleactivestate',
  payload: {
    saleActive: boolean
  }
}
```

**commerce_saleproducts**
Sent when the list of Products in the Sale is updated

```ts
{
  name: 'commerce_saleproducts',
  payload: {
    saleProducts: ProductInfo[]
  }
}
```

## Actions
Actions have the following form however the payload may be omitted altogether if its value is `null`.

```ts
type Action {
  action: string
  payload: object | null
}
```

**getstate**
Request the full state of the player. This is useful on initial load. The player will respond with a `state` event

```js
{
  action: 'getstate',
  payload: null,
}
```

**vote**
Cast a vote for an answer

```js
{
  action: 'vote',
  payload: {
    answerId: 'ANSWER_ID',
  }
}
```

**chat_sendmessage**
Send a message into the chat

```ts
{
  action: 'chat_sendmessage',
  payload: {
    message: string
  }
}
```

**chat_setusername**
Set the username for the chat
```ts
{
  action: 'chat_setusername',
  payload: {
    username: string
  }
}
```
