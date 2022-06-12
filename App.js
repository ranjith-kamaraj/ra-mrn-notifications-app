import { StatusBar } from 'expo-status-bar';
import { Alert, Button, Platform, StyleSheet, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true
    }
  }
});

export default function App() {

  //Push Notification
  useEffect(() => {
    console.log('calling hereee')
    async function configurePushNotifications() {
      console.log('calling here')
      let { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== 'granted') {
        let { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permission required',
          'Push notifications required permission'
        );

        return;
      };
      console.log('calling here1')
      const pushTokenData = await Notifications.getExpoPushTokenAsync();
      console.log('calling here2' + pushTokenData)

      //Needs to provide for android
      if(Platform.OS == 'android'){
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT
        })
      }
    };

    configurePushNotifications();
  }, [])

  //Local Notification
  useEffect(() => {
    console.log('calling here')
    const subscription1 = Notifications.addNotificationReceivedListener((notification) => {
      let userName = notification.request.content.data.userName;
      console.log('NOTIFY' + JSON.stringify(userName))
    });

    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      let userName = response.notification.request.content.data.userName;
      console.log('Response' + JSON.stringify(userName));
    });

    //Do clean-up while component removing
    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);


  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: "Check the mail!",
        data: { userName: 'Max' }
      },
      trigger: {
        seconds: 2
      },
    });
  };

  async function pushNotificationHandler() {

    /* Testing */
    let { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;

    if (finalStatus !== 'granted') {
      let { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission required',
        'Push notifications required permission'
      );

      return;
    };
    console.log('calling here1')
    const pushTokenData = await Notifications.getExpoPushTokenAsync();
    console.log('calling here2' + pushTokenData)

    //Needs to provide for android
    if(Platform.OS == 'android'){
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT
      })
    }

    /* Testing */
    fetch("https://exp.host/--/api/v2/push/send", {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '',//Needs to pass token to store the same in database - pushTokenData
        title: 'Push Msg from a device',
        body: 'This is a test msg!'
      })
    });
  };


  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={scheduleNotificationHandler} />
      <Text>Test</Text>
      <Button title='Push Notification' onPress={pushNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
