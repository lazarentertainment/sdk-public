# Stage TEN client SDK for React Native

The Stage TEN platform allows you to stream low-latency live video to audiences, and supports interactive features such as chat, voting, and live selling for Shopify store owners. For details of how to use the Stage TEN for broadcasting, see [How to create a broadcast on Stage TEN](#how-to-create-a-broadcast-on-stage-ten), below.

> For a full example of a working app, please see the [ReactNativeCommerceSample](https://github.com/lazarentertainment/sdk-public/tree/develop/ReactNativeCommerceSample).

## SDK Usage

Do not hesitate to file an issue if you encounter problems using the SDK. We are happy to help troubleshoot.

Please add the following to `.npmrc`:

```
@lazarentertainment:registry = "https://npm.pkg.github.com"
```

You also need to be configured to authenticate with GitHub Packages. Specifically, you need the `read:packages` permission. Please refer to the docs:

- [Authenticating to GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages)
- [About scopes and permissions for packages registries](https://docs.github.com/en/packages/learn-github-packages/about-permissions-for-github-packages#about-scopes-and-permissions-for-package-registries)

Then install:

```
npm install --save @lazarentertainment/react-native-sdk-client
```

To add the Stage TEN player to your React Native app you [need your Stage TEN channel id](#how-to-find-your-stage-ten-channel-id). Then you can do as follows:

```tsx
import { 
  StageTenPlayer,
  StageTenActions,
  Event,
} from '@lazarentertainment/react-native-sdk-client';

const App = () => {
  let stageTenActions: StageTenActions | null = null

  return (
    <StageTenPlayer
      channelId={'YOUR_STAGE_TEN_CHANNEL_ID_HERE'}
      onEvent={(event: Event) => {
        // Handle an event from Stage TEN.
        // Note: When you receive the `stageten_init` event, the Stage TEN service is ready to
        // receive Actions from the client. Do not send Actions before receiving `stageten_init`.
      }}
      onActionsReady={(actions: StageTenActions) => {
        // With this reference, the client is ready to send Actions to the Stage TEN service.
        // Note: You still need to wait for the `stageten_init` event, as described above.
        stageTenActions = actions
      }}
    />
  )
}
```

## API Documentation

The SDK uses a simple message-passing API. You will receive `Event`s, and you can send `Action`s. `Event`s provide you information about the state of your broadcast and different components, e.g. chat, voting, commerce. You can send `Action`s in response to user actions. For example, the user clicks a button to vote, or sends a chat message.

As a convenience, the `StageTenActions` interface exposes methods to make sending actions easy. Please inspect the interface for details and documentation.

### Events
All events have the form:
```ts
type Event {
  name: string
  payload: object | null
}
```

The player publishes the following events:

`stageten_init` Fires when the iframe is initialized and you can start sending/receiving events.

```ts
{
  name: 'stageten_init',
  payload: {
    aspectRatio: number // TODO: This is actually a string
  }
}
```

`state` Sent in response to a `getstate` action.

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

`aspect_ratio_change` Sent when there is a change in aspect ratio. This would ordinarily only occur if a user were broadcasting in portrait, then on a subsequent broadcast switched to landscape (or vice versa), and the viewer's app were still open.
```js
{
  name: 'aspect_ratio_change',
  payload: {
    aspectRatio: number,
  }
}
```

`voting_activequestionchange` Sent when there is a change to the active question. Either when the question is activated/deactived or when the question data changes.

```ts
{
  name: 'voting_activequestionchange',
  payload: ActiveQuestion | null,
}
```

`chat_messages` Sent when there is an update to the chat state

```ts
{
  name: 'chat_messages',
  payload: {
    messages: ChatMessage[]
  }
}
```

`commerce_saleactivestate` Sent when a Sale is made active or inactive

```ts
{
  name: 'commerce_saleactivestate',
  payload: {
    saleActive: boolean
  }
}
```

`commerce_saleproducts` Sent when the list of Products in the Sale is updated

```ts
{
  name: 'commerce_saleproducts',
  payload: {
    saleProducts: ProductInfo[]
  }
}
```

### Actions
Actions have the following form however the payload may be omitted altogether if its value is `null`. The SDK provides `StageTenActions` as a convenience, so in most cases you don't need to build these actions yourself, but rather you can call methods directly on that interface.

```ts
type Action {
  action: string
  payload: object | null
}
```

`getstate` Request the full state of the player. This is useful on initial load. The player will respond with a `state` event

```js
{
  action: 'getstate',
  payload: null,
}
```

`vote` Cast a vote for an answer

```js
{
  action: 'vote',
  payload: {
    answerId: 'ANSWER_ID',
  }
}
```

`chat_sendmessage` Send a message into the chat

```ts
{
  action: 'chat_sendmessage',
  payload: {
    message: string
  }
}
```

`chat_setusername` Set the username for the chat
```ts
{
  action: 'chat_setusername',
  payload: {
    username: string
  }
}
```

## How to create a broadcast on Stage TEN

> Note: At time of this writing, the SDK is only supported in the `sandbox` environment, not production. Please see further directions below for details on using `sandbox`.

### iOS

* Download the [Stage TEN Mobile Studio](https://apps.apple.com/ca/app/stage-ten-mobile-studio/id1475119349)
* Open Safari and navigate to `stagetenstudio://sandbox`, this will allow your Mobile Studio installation to use the `sandbox` environment.
* Watch [this video](https://stageten-asset-samples.s3.amazonaws.com/sdk/hls/index.html) on how to use Stage TEN Mobile Studio to create a broadcast, chat, and use commerce. Note: this video also shows how to watch the broadcast and interact in the [ReactNativeCommerceSample](https://github.com/lazarentertainment/sdk-public/tree/develop/ReactNativeCommerceSample) app.

### Android
(currently in development)

### Desktop

Desktop can output video in landscape orientation and using the Voting feature of the Stage TEN platform.

* Open [sandbox.stageten.tv](https://sandbox.stageten.tv)
* Watch [this video](https://stageten-asset-samples.s3.amazonaws.com/desktop-studio/hls/index.html) on how to use the desktop Studio to broadcast, start a vote, chat, and use commerce. Note: this video also shows how to watch the broadcast and interact in the [ReactNativeCommerceSample](https://github.com/lazarentertainment/sdk-public/tree/develop/ReactNativeCommerceSample) app.

## How to find your Stage TEN channel id

Follow the instructions on [using the Desktop Studio](https://github.com/lazarentertainment/stageten-packages/tree/develop/react-native-sdk-client#desktop), above. You only need to get as far as opening the studio itself and waiting for your Destinations to load (this can take a few seconds). Once they've loaded, click this button in the Destinations panel:

![Button to open your Stage TEN channel page](https://raw.githubusercontent.com/lazarentertainment/stageten-packages/develop/react-native-sdk-client/channel_page_button.png)

This will open your channel page, with your Stage TEN interactive player. The url in the address bar will be of the form `https://sandbox-player.stageten.tv/channel/<YOUR_CHANNEL_ID>` where `<YOUR_CHANNEL_ID>` is a UUID.
