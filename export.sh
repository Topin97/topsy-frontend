#!/bin/bash
cd ~/topsy-frontend
xcodebuild -exportArchive \
  -archivePath ~/TopSy.xcarchive \
  -exportOptionsPlist ExportOptions.plist \
  -exportPath ~/TopSy-ipa
