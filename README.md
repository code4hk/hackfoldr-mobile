hackfoldr-mobile
================

Hackfoldr mobile version

The actual content of the app is under hackfoldr/www

To build and run the app:
1. Add android SDK to your PATH variable
e.g. $ echo $PATH
/opt/local/bin:/opt/local/sbin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin:/usr/local/git/bin:/usr/local/mysql/bin:/Applications/Android Studio.app/sdk/tools:/Applications/Android Studio.app/sdk/platform-tools:/Applications/apache-ant-1.9.4/bin:/Applications/Android Studio.app/sdk
2.    $ cordova platform add android
3.    $ cordova build
4. Then the apk file will be generated under hackfoldr/platforms/android/ant-build
5. Start the Android emulator, then run     $ cordova emulate android OR
   Start an emulator in Genymotion, dray the apk file to the emulator

