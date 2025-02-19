# Internationalization / Localization

```shell
ng add @angular/localize --project=internationalization-demo
```

* [Locale Codes Official](https://www.loc.gov/standards/iso639-2/php/code_list.php)
* [Locale Codes](https://www.ibm.com/docs/en/datacap/9.1.8?topic=support-supported-language-codes)
* [Angular Tutorial Video](https://www.youtube.com/watch?v=KNTN-nsbV7M)
* [Official Docs](https://angular.dev/guide/i18n/add-package)
* https://docs.angular.lat/guide/i18n


```shell
ng extract-i18n --output-path src/locale --project=internationalization-demo
# for each language you wanna support
cp src/locale/messages.xlf src/locale/messages.es.xlf
```

```shell
npm run build --project internationalization-demo --localize
```


### Testing different locales

```json
{
   "projects": {
    "internationalization-demo": {
      "architect": {
        "build": {
          "options": {
            "localize": "en" <--- will render in spanish
          }
        }
      }
    }
  }
}

```

