# hermione-retry-progressive

## Обзор

Используйте плагин `hermione-retry-progressive`, чтобы дополнительно прогонять тесты, если ошибки, с которыми они упали соответствуют заданному набору шаблонов.

Для чего это может понадобиться?

Тесты могут падать не только из-за ошибок разработчика, гонок между скриптами, исполняющимися на веб-странице, но и по инфраструктурным причинам. Например, когда моргает сеть, вовремя не отдается браузер, временные проблемы с DNS и т. п.

### Примеры шаблонов для таких ошибок

* Browser request was cancelled
* A window size operation failed because the window is not currently available
* chrome not reachable
* Tried to run command without establishing a connection
* No such driver
* no such window
* Session timed out or not found
* Reached error page
* getaddrinfo ENOTFOUND
* Browsing context has been discarded
* Cannot launch browser
* Failed to decode response from marionette
* session deleted because of page crash
* Couldn't connect to selenium server

## Установка

```bash
npm install -D hermione-retry-progressive
```

## Настройка

Необходимо подключить плагин в разделе `plugins` конфига `hermione`:

```javascript
module.exports = {
    plugins: {
        'hermione-retry-progressive': {
            enabled: true,
            extraRetry: 7,
            errorPatterns: [
                'Parameter .* must be a string',
                {
                    name: 'Cannot read property of undefined',
                    pattern: 'Cannot read property .* of undefined',
                },
            ],
        },

        // другие плагины гермионы...
    },

    // другие настройки гермионы...
};
```

### Расшифровка параметров конфигурации

| **Параметр** | **Тип** | **По&nbsp;умолчанию** | **Описание** |
| ------------ | ------- | --------------------- | ------------ |
| enabled | Boolean | true | Включить / отключить плагин. |
| extraRetry | Number | 5 | Количество раз, которые нужно повторно прогнать тест, если он падает с ошибкой, подходящей под один из шаблонов _errorPatterns_. |
| errorPatterns | Array | `[ ]` | Список шаблонов, под один из которых должна подойти ошибка, чтобы плагин запустил тест повторно. Подробнее см. ниже. |

### errorPatterns

Каждый шаблон в массиве `errorPatterns` представляет собой либо объект вида:

```javascript
{
    name: 'Понятное сообщение для пользователя, которое будет выводиться в консоль',
    pattern: 'Шаблон ошибки, который может задаваться в том числе как строка для регулярного выражения'
}
```

либо строку, которая будет проинтерпретирована плагином как объект вида:

```javascript
{
    name: 'ваша строка',
    pattern: 'ваша строка'
}
```

Последний вариант удобен, если формат для консоли и шаблон ошибки полностью совпадают.

### Передача параметров через CLI

Все параметры плагина, которые можно определить в конфиге, можно также передать в виде опций командной строки или через переменные окружения во время запуска гермионы. Используйте префикс `--retry-progressive-` для опций командной строки и `hermione_retry_progressive_` &mdash; для переменных окружения. Например:

```bash
npx hermione --retry-progressive-extra-retry 3
```

```bash
hermione_retry_progressive_extra_retry=3 npx hermione
```
