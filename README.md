# Counter

The ultimate social network. For a small group of friends who want to keep track of how many times each of them did something - like dropped a pen in class, overslept for class, fell asleep in the class, said a dad joke, you name it. The sky is the limit.

# Server
This repo hosts the syncing server code. Since simplicity is the ultimate sophistication, the whole model is saved in one JSON file, which is synced with a vector clock (always increasing integer, counter). 

When the client wants to sync with the server, is must pass the current clock value in the url and the server accepts it if it matches the latest model version and rejects it otherwise - in which case the client should get the model from the server and use that.

# API Docs

# `GET /sync`
*response body*: JSON of the current model
```
{
    "clock": 434,
    "users": [
        {
            "name": "Honza Dvorsky",
            "id": "1471255F-3F5E-47E3-93C1-5D4F536E63F5",
            "avatarUrl": "http://honzadvorsky.com/pages/portfolio/images/hd1.jpg",
            "scores": {
                "651425FD-F3AD-47CB-A8BC-BE88340C515C": 14,
                ...
            }
        },
        ...
    ],
    "categories": [
        {
            "name": "Dad Jokes",
            "id": "651425FD-F3AD-47CB-A8BC-BE88340C515C",
            "iconUrl": "https://maxcdn.icons8.com/iOS7/PNG/50/Messaging/lol-50.png"
        },
        {
            "name": "Overslept",
            "id": "50546704-1B1E-416B-900A-A81FFC2C42FE",
            "iconUrl": "https://maxcdn.icons8.com/iOS7/PNG/50/Household/sleeping_in_bed-50.png"
        }
        ...
    ]
}
```

# `POST /sync?clock=CLOCK`
*request body*: JSON of the updated model
*response body*: JSON with only the new clock value 
```
{
    "newClock": 435
}
```

## Errors
All errors return with a HTTP status code 400. Each error is a JSON object with an application-specific error code and a human-readable description.

- Code **1000** - Clock mismatch (e.g. "Sending clock 40 but server is at clock 45")
```
{
  "code": 1000,
  "description": "Sending clock 40 but server is at clock 45"
}
```
Happens when the client is out of date, because other clients have already updated the model. In this case the recommendation is to discard the local model and use the `GET` method to get the current model again.

# Author
[honzadvorsky.com](http://honzadvorsky.com)

