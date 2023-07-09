# azure-resume
My own Azure resume, following [ACG project video.](https://www.youtube.com/watch?v=ieYrBWmkfno&t=1197s)

## First steps
- Frontend folder contains the website.
- main.js contains visitor counter code.

## Azure Function
This was probably the most daunting step for me. I originally tried to follow along with ACG's example in C#, but something was off. I was getting cryptic errors that I tried to google to no avail, as I do not know C# very well at all (maybe I'll get around to learning it some day, if I can identify a strong personal or professional reason for it; C# does offer the fastest [cold start time](https://mikhail.io/serverless/coldstarts/azure/) of any programming language supported by Azure Functions). So, I decided to develop a function in Python instead. I thought this was better, anyway, since I was particularly interested in this part of the project and wanted to exercise a bit more originality than I did with the frontend web portion. I'm more naturally inclined towards APIs and databases, I suppose.

I found it relatively simple to use the Azure-Cosmos library to interact with my Cosmos NoSql DB.

The biggest thing with using Python is that you have to pay close attention to the version of Python you're selecting. It ought to be one of the ones that's officially supported by the Azure-Cosmos library, and then, when creating the Function App that the function will be deployed to, you need to make sure the version is identical there as well. And make sure you've got your virtual environment activated with testing and deploying your function from the CLI.

Call me lazy, but when it came time to deploy the function, I found it easier to do a local (as opposed to remote) build using this Azure Core Function Tools command:

```
func azure functionapp publish appname --build local
```

Requirements.txt - as a noob, my impulse was to put the name of every library I imported in my __init__.py. DO NOT put modules here that are a part of the standard library, or you will get errors. Also, you do not need to include azure-functions.

