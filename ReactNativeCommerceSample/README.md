## Environment setup
If you are new to React Native development, make sure to follow the steps in [Setting up the development environment](https://reactnative.dev/docs/environment-setup) for "React Native CLI Quickstart". Then do the following:

* Make sure you have CocoaPods installed (With Brew: `brew install cocoapods`)
* `npm install`
* `cd ios && pod install && cd ..`

Then run `npx react-native run-android` or `npx react-native run-ios`. In our testing, the app runs well on iOS and Android devices, and in the iOS Simulator, but not the Android Emulator.

To run on a device, please be sure to follow the steps in [Running on device](https://reactnative.dev/docs/running-on-device).

If you run into any problems, do not hesitate to file an issue.

## Running the app

You need to change App.tsx, where the player is embedded:

```tsx
<StageTenPlayer
  channelId={'REPLACE_WITH_YOUR_STAGE_TEN_CHANNEL_ID'}
  ...
```

Set `channelId` to your Stage TEN channel id. See [How to find your Stage TEN channel id](https://github.com/lazarentertainment/stageten-packages/tree/develop/react-native-sdk-client#how-to-find-your-stage-ten-channel-id) for help.

## SDK Usage

The [SDK documentation](https://github.com/lazarentertainment/stageten-packages/blob/develop/react-native-sdk-client/README.md) contains detailed information on how to use the SDK.

## How to create a broadcast

Please see [SDK documentation - How to create a broadcast on Stage TEN](https://github.com/lazarentertainment/stageten-packages/blob/develop/react-native-sdk-client/README.md#how-to-create-a-broadcast-on-stage-ten).

## How to find your Stage TEN channel id
Please see [SDK documentation - How to find your Stage TEN channel id](https://github.com/lazarentertainment/stageten-packages/tree/develop/react-native-sdk-client#how-to-find-your-stage-ten-channel-id)