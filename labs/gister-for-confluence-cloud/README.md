
- [atlas-run-standalone --product confluence --version 5.6-OD....](https://developer.atlassian.com/static/connect/docs/developing/developing-locally.html)
- [Static Content Macro](https://developer.atlassian.com/static/connect/docs/modules/confluence/static-content-macro.html)


```
atlas-run-standalone --product confluence --version 5.6-OD-34-013 --bundled-plugins com.atlassian.jwt:jwt-plugin:1.1.0,com.atlassian.bundles:json-schema-validator-atlassian-bundle:1.0.4,com.atlassian.webhooks:atlassian-webhooks-plugin:1.0.6,com.atlassian.upm:atlassian-universal-plugin-manager-plugin:2.17.14-D20140902T224549,com.atlassian.plugins:atlassian-connect-plugin:1.1.7 --jvmargs -Datlassian.upm.on.demand=true
```