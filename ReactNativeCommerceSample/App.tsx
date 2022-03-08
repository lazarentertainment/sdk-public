import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React, { Component, useState } from 'react';
import { Button, FlatList, Image, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { StageTenPlayer, StageTenActions, Action, Event } from '@lazarentertainment/react-native-sdk-client';

const Tab = createBottomTabNavigator()

export default class App extends Component {
  stageTenActions: StageTenActions | undefined

  state = {
    aspectRatio: '',
    votingActiveQuestion: null,
    votingLog: [],
    chatUserHasJoined: false,
    chatMessages: [],
    chatLog: [],
    commerceSaleActive: false,
    commerceSaleProducts: null,
    commerceLog: [],
  };

  get activeQuestion(): any {
    return this.state.votingActiveQuestion
  }

  onEvent = (event: Event) => {
    console.log('Received event', event)

    const payload = (event.payload || {}) as any

    if (event.name === 'stageten_init') {
      this.stageTenActions?.getState()
    }

    if (event.name === 'stageten_init' || event.name === 'aspect_ratio_change') {
      this.setState({
        aspectRatio: payload.aspectRatio,
      })
    }

    if (event.name === 'state') {
      this.setState({
        votingActiveQuestion: payload.voting.activeQuestion,
        chatMessages: payload.chat.messages,
        commerceSaleActive: payload.commerce.saleActive,
        commerceSaleProducts: payload.commerce.saleProducts,
      });
    }

    const logMessage = `received event: ${prettyPrint(event)}`

    if (event.name === 'voting_activequestionchange') {
      this.setState((state: any) => {
        return {
          votingActiveQuestion: payload.activeQuestion,
          votingLog: [...state.votingLog, logMessage],
        };
      });
    }

    if (event.name === 'chat_messages') {
      this.setState((state: any) => {
        return {
          chatMessages: payload.messages,
          chatLog: [...state.chatLog, logMessage],
        };
      });
    }

    if (event.name.startsWith('commerce_')) {
      this.setState((state: any) => {
        return {
          commerceLog: [...state.commerceLog, logMessage],
        }
      })
    }

    if (event.name === 'commerce_saleproducts') {
      this.setState({
        commerceSaleProducts: payload.saleProducts,
      })
    }

    if (event.name === 'commerce_saleactivestate') {
      this.setState({
        commerceSaleActive: payload.saleActive,
      })
    }
  }

  onSendAction = (action: Action) => {
    console.log('Sending action', action)
    const logMessage = `sent action: ${prettyPrint(action)}`
    
    if (action.action.startsWith('chat_')) {
      this.setState((state: any) => {
        return {
          chatLog: [...state.chatLog, logMessage],
        }
      })
    }
    if (action.action == 'vote') {
      this.setState((state: any) => {
        return {
          votingLog: [...state.votingLog, logMessage],
        }
      })
    }
  }

  onSetUsername = (username: string) => {
    this.stageTenActions?.setChatUsername(username)
    this.setState({
      chatUserHasJoined: true,
    })
  }

  onSendChat = (message: string) => {
    this.stageTenActions?.sendChatMessage(message)
  }

  onVote = (answer: any) => {
    this.stageTenActions?.vote(answer.id)
  }

  render() {
    const ChatComponent = () => {
      return (
        <ChatScreen
          logMessages={this.state.chatLog}
          messages={this.state.chatMessages}
          userHasJoinedChat={this.state.chatUserHasJoined}
          onSendChatClick={this.onSendChat}
          onJoinChatClick={this.onSetUsername}
        />
      )
    }

    const CommerceComponent = () => {
      return (
        <CommerceScreen
          logMessages={this.state.commerceLog}
          saleActive={this.state.commerceSaleActive}
          saleProducts={this.state.commerceSaleProducts}
        />
      )
    }

    const VoteComponent = () => {
      return (
        <VotingScreen
          logMessages={this.state.votingLog}
          activeQuestion={this.state.votingActiveQuestion}
          onVote={this.onVote}
        />
      )
    }

    let votingTabBadge;
    if (this.state.votingActiveQuestion != null) {
      votingTabBadge = ''
    }

    let commerceBadge;
    if (this.state.commerceSaleActive) {
      commerceBadge = ''
    }

    return (
      <SafeAreaView style={styles.container}>
        <StageTenPlayer
          channelId={'REPLACE_WITH_YOUR_STAGE_TEN_CHANNEL_ID'}
          onEvent={this.onEvent}
          onSendAction={this.onSendAction}
          onActionsReady={(actions) => this.stageTenActions = actions}
          style={{
            maxHeight: '50%',
            alignSelf: 'center',
          }}
        />

        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarLabelPosition: 'beside-icon',
              headerShown: false,
              tabBarIcon: ({ color, size }) => {
                let iconName

                if (route.name === 'Chat') {
                  iconName = 'chat'
                } else if (route.name === 'Commerce') {
                  iconName = 'local-offer'
                } else if (route.name === 'Voting') {
                  iconName = 'poll'
                }

                return <MaterialIcons name={iconName} color={color} size={size} />
              }
            })}
          >
            <Tab.Screen name='Chat' component={ChatComponent} />
            <Tab.Screen
              name='Commerce'
              component={CommerceComponent}
              options={{ tabBarBadge: commerceBadge }}
            />
            <Tab.Screen
              name='Voting'
              component={VoteComponent}
              options={{ tabBarBadge: votingTabBadge }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  chatInputRow: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  logList: {
    backgroundColor: '#FFF',
    padding: 16,
  },
  logItem: {
    backgroundColor: '#EEE',
    borderRadius: 10,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  image: {
    width: 100,
    height: 100,
    aspectRatio: 1,
  },
})

function prettyPrint(obj: any) {
  return JSON.stringify(obj, null, 2)
}

function LogItem({ text }) {
  return <Text style={styles.logItem}>{text}</Text>
}

function ChatScreen({
  logMessages,
  messages,
  userHasJoinedChat,
  onSendChatClick,
  onJoinChatClick,
}) {
  const [chatInputValue, setChatInputValue] = useState('')
  const [chatUsernameValue, setChatUsernameValue] = useState('')

  let chatInputs
  if (userHasJoinedChat) {
    chatInputs = (
      <View style={styles.chatInputRow}>
        <TextInput
          placeholder='Chat here...'
          value={chatInputValue}
          onChangeText={setChatInputValue}
        />
        <Button
          title='Send Chat'
          onPress={() => {
            onSendChatClick(chatInputValue)
            setChatInputValue('')
          }}
          disabled={chatInputValue.trim() == ''}
        />
      </View>
    )
  } else {
    chatInputs = (
      <View style={styles.chatInputRow}>
        <TextInput
          placeholder='Enter your name...'
          value={chatUsernameValue}
          onChangeText={setChatUsernameValue}
        />
        <Button
          title='Join Chat'
          onPress={() => {
            onJoinChatClick(chatUsernameValue)
          }}
          disabled={chatUsernameValue.trim() == ''}
        />
      </View>
    )
  }
  return (
    <>
      {chatInputs}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function CommerceScreen({
  logMessages,
  saleActive,
  saleProducts,
}) {
  let productsView = null
  if (saleProducts) {
    productsView = <FlatList
      data={saleProducts}
      renderItem={({item}) => {
        return (
          <Image
            style={styles.image}
            source={{
              uri: item.images?.edges[0]?.node.originalSrc,
            }}
          />
        )
      }}
      extraData={saleProducts}
      horizontal={true}
    />
  }
  return (
    <>
      {productsView}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function VotingScreen({
  logMessages,
  activeQuestion,
  onVote
}) {
  let answerButtons;
  if (activeQuestion != null) {
    answerButtons = (
      <View style={{ padding: 10 }}>
        {
          activeQuestion.answers.map((answer: any, index: number) => {
            return (
              <View
                style={index ? { marginTop: 10 } : {}}
                key={answer.id}
              >
                <Button
                  title={answer.text}
                  onPress={() => onVote(answer)}
                />
              </View>
            )
          })
        }
      </View>
    )
  }

  return (
    <>
      {answerButtons}
      <InvertedFlatList
        style={styles.logList}
        data={logMessages}
        renderItem={({item}) => <LogItem text={item} />}
      />
    </>
  )
}

function InvertedFlatList({
  style,
  data,
  renderItem,
}) {
  return (
    <FlatList
      style={style}
      data={[...data].reverse()}
      renderItem={renderItem}
      extraData={data}
      inverted={true}
    />
  )
}