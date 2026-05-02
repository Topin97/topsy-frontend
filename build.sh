#!/bin/bash
cd ~/topsy-frontend/ios/App

xcodebuild archive \
  -scheme App \
  -configuration Release \
  -archivePath ~/TopSy.xcarchive \
  -destination "generic/platform=iOS" \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM=5S4V8SHNN4 \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  PROVISIONING_PROFILE_SPECIFIER="Topsy AppStore Distribution"